import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the Service Role key
// This bypasses Row Level Security so we can query across all users' targets
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // The GitHub webhook payload might have the repository URL in different places
    // depending on the event type. We check a few common locations.
    const repoUrl = payload.repository?.html_url || payload.repository?.url;

    if (!repoUrl) {
      return NextResponse.json({ error: 'No repository URL found in payload' }, { status: 400 });
    }

    // Query scan_targets table for this repository url.
    // We use the admin client so we bypass RLS and can find ANY user's target.
    const { data: targets, error: targetError } = await supabaseAdmin
      .from('scan_targets')
      .select('id, url')
      .eq('url', repoUrl);

    if (targetError) {
      console.error('Error querying scan_targets:', targetError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!targets || targets.length === 0) {
      // We are not monitoring this repository. That's fine, return 200.
      return NextResponse.json({ message: 'Repository not monitored' }, { status: 200 });
    }

    // Insert a new job for each target that matches this repository
    const jobsToInsert = targets.map((target) => ({
      target_id: target.id,
      status: 'pending',
    }));

    const { error: insertError } = await supabaseAdmin
      .from('scan_jobs')
      .insert(jobsToInsert);

    if (insertError) {
      console.error('Error inserting scan_jobs:', insertError);
      return NextResponse.json({ error: 'Failed to queue scan' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Scans queued successfully' }, { status: 200 });
  } catch (error) {
    console.error('Webhook payload parsing error:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
