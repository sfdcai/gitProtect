import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, normalize } from 'path';
import { SECRET_RULES, EXCLUDED_PATHS, EXCLUDED_EXTENSIONS } from './rules.js';

/**
 * Compute Shannon entropy of a string.
 * High entropy (> 4.5) often indicates generated secrets.
 */
function entropy(str) {
  if (!str || str.length === 0) return 0;
  const freq = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  const len = str.length;
  return -Object.values(freq).reduce((sum, f) => {
    const p = f / len;
    return sum + p * Math.log2(p);
  }, 0);
}

/**
 * Check if a path segment should be skipped.
 */
function shouldSkipPath(pathStr) {
  const segments = normalize(pathStr).split(/[/\\]/);
  return segments.some((seg) => EXCLUDED_PATHS.includes(seg));
}

/**
 * Check if a file extension should be skipped.
 */
function shouldSkipExtension(filePath) {
  const ext = extname(filePath).toLowerCase();
  return EXCLUDED_EXTENSIONS.some((e) => filePath.toLowerCase().endsWith(e));
}

/**
 * Mask a matched secret: reveal first 4 and last 4 chars, asterisk the middle.
 */
function maskSecret(secret) {
  if (secret.length <= 8) return '*'.repeat(secret.length);
  return secret.slice(0, 4) + '*'.repeat(Math.max(secret.length - 8, 4)) + secret.slice(-4);
}

/**
 * Scan a single file's content for secrets.
 * Returns an array of finding objects (without job_id yet).
 */
function scanFileContent(filePath, content) {
  const findings = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip extremely long lines (minified files)
    if (line.length > 2000) continue;

    for (const rule of SECRET_RULES) {
      const match = rule.pattern.exec(line);
      if (match) {
        const matched = match[1] ?? match[0];
        findings.push({
          file_path: filePath,
          line_number: lineNumber,
          secret_type: rule.name,
          masked_secret: maskSecret(matched),
          severity: rule.severity,
          raw_match: matched, // stripped before DB insert
        });
        break; // One match per line per pass to avoid duplicates
      }
    }
  }

  return findings;
}

/**
 * Recursively walk a directory and scan all non-excluded files.
 * Returns all findings with file_path relative to repoRoot.
 */
export function scanDirectory(repoRoot) {
  const allFindings = [];

  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = fullPath.replace(repoRoot, '').replace(/^[/\\]/, '');

      if (shouldSkipPath(relativePath)) continue;
      if (shouldSkipExtension(fullPath)) continue;

      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile()) {
        // Skip files > 1MB
        if (stat.size > 1_000_000) continue;

        let content;
        try {
          content = readFileSync(fullPath, 'utf8');
        } catch {
          continue; // Skip binary or unreadable files
        }

        const findings = scanFileContent(relativePath, content);
        allFindings.push(...findings);
      }
    }
  }

  walk(repoRoot);
  return allFindings;
}

/**
 * Parse git log output to extract commit metadata per file.
 * Returns a map of { filePath -> { commit_hash, commit_author } }
 */
export function parseGitBlameInfo(git, repoPath) {
  // This is a simplified approach: get the last commit hash + author for the whole repo
  // For per-file blame, extend this using `git log -- <file>`
  return null;
}
