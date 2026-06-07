export type SubscriptionTier = 'free' | 'premium';

export type ScanStatus = 'pending' | 'cloning' | 'scanning' | 'completed' | 'failed';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Profile {
  id: string;
  github_username: string | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
}

export interface ScanTarget {
  id: string;
  user_id: string;
  repo_name: string;
  url: string;
  is_private: boolean;
  created_at: string;
}

export interface ScanJob {
  id: string;
  target_id: string;
  status: ScanStatus;
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  scan_targets?: ScanTarget;
}

export interface SecretFinding {
  id: string;
  job_id: string;
  file_path: string;
  line_number: number;
  secret_type: string;
  masked_secret: string;
  commit_hash: string | null;
  commit_author: string | null;
  severity: Severity;
  is_false_positive: boolean;
  created_at: string;
  scan_jobs?: ScanJob & { scan_targets?: ScanTarget };
}
