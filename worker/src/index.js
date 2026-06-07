import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import simpleGit from 'simple-git';
import { mkdtempSync, rmSync } from 'fs';
import { createServer } from 'http';
import { tmpdir } from 'os';
import { join } from 'path';
import { scanDirectory, scanGitHistory } from './scanner.js';

// ─── Supabase client (service role — bypasses RLS for writes) ─────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '15000', 10);

// ─── Helpers ──────────────────────────────────────────────────────────────

async function updateJobStatus(jobId, status, progress = null) {
  const update = { status };
  if (progress !== null) update.progress_percentage = progress;
  if (status === 'scanning' || status === 'cloning') update.started_at = new Date().toISOString();
  if (status === 'completed' || status === 'failed') update.completed_at = new Date().toISOString();

  const { error } = await supabase.from('scan_jobs').update(update).eq('id', jobId);
  if (error) console.error(`[job:${jobId}] Failed to update status:`, error.message);
}

async function getLastCommitInfo(git) {
  try {
    const log = await git.log({ maxCount: 1 });
    const latest = log.latest;
    return {
      commit_hash: latest?.hash ?? null,
      commit_author: latest?.author_name ?? null,
    };
  } catch {
    return { commit_hash: null, commit_author: null };
  }
}

// ─── Core scan function ───────────────────────────────────────────────────

async function performScan(job, target) {
  console.log(`\n[job:${job.id}] Starting scan of ${target.url}`);
  const tmpDir = mkdtempSync(join(tmpdir(), 'gitprotect-'));

  try {
    // Step 1: Clone
    await updateJobStatus(job.id, 'cloning', 5);
    console.log(`[job:${job.id}] Cloning into ${tmpDir}...`);

    const git = simpleGit();
    const cloneOptions = []; // Full clone for deep history scan
    if (process.env.GITHUB_PAT) {
      // Inject PAT into URL for higher rate limits
      const url = new URL(target.url);
      url.username = 'x-access-token';
      url.password = process.env.GITHUB_PAT;
      await git.clone(url.toString(), tmpDir, cloneOptions);
    } else {
      await git.clone(target.url, tmpDir, cloneOptions);
    }

    await updateJobStatus(job.id, 'scanning', 30);
    console.log(`[job:${job.id}] Clone complete. Scanning files...`);

    // Step 2: Get commit info
    const repoGit = simpleGit(tmpDir);
    const commitInfo = await getLastCommitInfo(repoGit);

    // Step 3: Scan directory and git history
    const rawFindings = scanDirectory(tmpDir);
    const historyFindings = scanGitHistory(tmpDir);
    const combinedFindings = [...rawFindings, ...historyFindings];
    
    await updateJobStatus(job.id, 'scanning', 70);
    console.log(`[job:${job.id}] Found ${combinedFindings.length} potential secrets`);

    // Step 4: Deduplicate by (file_path + line_number/commit_hash + secret_type + masked_secret)
    const seen = new Set();
    const deduped = combinedFindings.filter((f) => {
      const loc = f.line_number === 0 ? f.commit_hash : f.line_number;
      const key = `${f.file_path}:${loc}:${f.secret_type}:${f.masked_secret}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Step 5: Insert findings into DB
    if (deduped.length > 0) {
      const dbFindings = deduped.map(({ raw_match, ...f }) => ({
        ...f,
        job_id: job.id,
        commit_hash: f.commit_hash || commitInfo.commit_hash,
        commit_author: f.commit_author || commitInfo.commit_author,
        is_false_positive: false,
      }));

      // Insert in batches of 100
      const BATCH = 100;
      for (let i = 0; i < dbFindings.length; i += BATCH) {
        const { error } = await supabase
          .from('secret_findings')
          .insert(dbFindings.slice(i, i + BATCH));
        if (error) console.error(`[job:${job.id}] Insert error:`, error.message);
      }
    }

    await updateJobStatus(job.id, 'completed', 100);
    console.log(`[job:${job.id}] ✅ Completed. ${deduped.length} findings saved.`);
  } catch (err) {
    console.error(`[job:${job.id}] ❌ Scan failed:`, err.message);
    await updateJobStatus(job.id, 'failed');
  } finally {
    // Clean up cloned repo
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

// ─── Poll loop ────────────────────────────────────────────────────────────

async function pollForJobs() {
  try {
    // Fetch one pending job at a time
    const { data: jobs, error } = await supabase
      .from('scan_jobs')
      .select('*, scan_targets(*)')
      .eq('status', 'pending')
      .order('id', { ascending: true })
      .limit(1);

    if (error) {
      console.error('[poll] Query error:', error.message);
      return;
    }

    if (!jobs || jobs.length === 0) return;

    const job = jobs[0];
    const target = job.scan_targets;

    if (!target) {
      console.warn(`[job:${job.id}] No scan target found, marking failed`);
      await updateJobStatus(job.id, 'failed');
      return;
    }

    // Prevent other workers from picking up the same job
    await updateJobStatus(job.id, 'cloning', 0);

    await performScan(job, target);
  } catch (err) {
    console.error('[poll] Unexpected error:', err.message);
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────

console.log('🛡️  GitProtect Worker starting...');
console.log(`   Polling every ${POLL_INTERVAL_MS / 1000}s for pending jobs`);
console.log(`   Supabase URL: ${process.env.SUPABASE_URL}`);

// Minimal HTTP health-check server so Render doesn't kill the process
// for not binding a port. Returns 200 OK on GET /health.
const PORT = process.env.PORT || 3001;
createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'gitprotect-worker' }));
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, () => {
  console.log(`   Health endpoint: http://0.0.0.0:${PORT}/health`);
});

// Initial poll immediately, then on interval
pollForJobs();
setInterval(pollForJobs, POLL_INTERVAL_MS);
