/**
 * GitProtect Secret Pattern Catalog
 * Patterns inspired by TruffleHog, GitGuardian, and gitleaks open-source rule sets.
 * Each rule contains: id, name, regex pattern, severity level.
 */

export const SECRET_RULES = [
  // ─── AWS ───────────────────────────────────────────────────────────────────
  {
    id: 'aws_access_key_id',
    name: 'AWS Access Key ID',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
    severity: 'critical',
  },
  {
    id: 'aws_secret_access_key',
    name: 'AWS Secret Access Key',
    pattern: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[=:]\s*["']?([A-Za-z0-9/+=]{40})["']?/i,
    severity: 'critical',
  },

  // ─── GitHub ────────────────────────────────────────────────────────────────
  {
    id: 'github_pat_classic',
    name: 'GitHub Personal Access Token (Classic)',
    pattern: /ghp_[A-Za-z0-9]{36}/,
    severity: 'critical',
  },
  {
    id: 'github_pat_fine_grained',
    name: 'GitHub Fine-Grained PAT',
    pattern: /github_pat_[A-Za-z0-9_]{82}/,
    severity: 'critical',
  },
  {
    id: 'github_oauth_token',
    name: 'GitHub OAuth Token',
    pattern: /gho_[A-Za-z0-9]{36}/,
    severity: 'critical',
  },
  {
    id: 'github_app_token',
    name: 'GitHub App Token',
    pattern: /(?:ghs|ghu)_[A-Za-z0-9]{36}/,
    severity: 'high',
  },

  // ─── Stripe ────────────────────────────────────────────────────────────────
  {
    id: 'stripe_secret_key',
    name: 'Stripe Secret Key',
    pattern: /sk_live_[A-Za-z0-9]{24,}/,
    severity: 'critical',
  },
  {
    id: 'stripe_restricted_key',
    name: 'Stripe Restricted Key',
    pattern: /rk_live_[A-Za-z0-9]{24,}/,
    severity: 'high',
  },

  // ─── Slack ─────────────────────────────────────────────────────────────────
  {
    id: 'slack_bot_token',
    name: 'Slack Bot Token',
    pattern: /xoxb-[A-Za-z0-9-]{10,72}/,
    severity: 'high',
  },
  {
    id: 'slack_user_token',
    name: 'Slack User Token',
    pattern: /xoxp-[A-Za-z0-9-]{10,72}/,
    severity: 'high',
  },
  {
    id: 'slack_webhook',
    name: 'Slack Webhook URL',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9]+\/B[A-Za-z0-9]+\/[A-Za-z0-9]+/,
    severity: 'high',
  },

  // ─── Google ────────────────────────────────────────────────────────────────
  {
    id: 'google_api_key',
    name: 'Google API Key',
    pattern: /AIza[0-9A-Za-z-_]{35}/,
    severity: 'high',
  },
  {
    id: 'google_oauth_client_secret',
    name: 'Google OAuth Client Secret',
    pattern: /GOCSPX-[A-Za-z0-9_-]{28}/,
    severity: 'critical',
  },

  // ─── Database URLs ─────────────────────────────────────────────────────────
  {
    id: 'postgres_connection_string',
    name: 'PostgreSQL Connection String',
    pattern: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^\s"']+/i,
    severity: 'critical',
  },
  {
    id: 'mongodb_connection_string',
    name: 'MongoDB Connection String',
    pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s"']+/i,
    severity: 'critical',
  },
  {
    id: 'mysql_connection_string',
    name: 'MySQL Connection String',
    pattern: /mysql:\/\/[^:]+:[^@]+@[^\s"']+/i,
    severity: 'critical',
  },

  // ─── Private Keys ──────────────────────────────────────────────────────────
  {
    id: 'rsa_private_key',
    name: 'RSA Private Key',
    pattern: /-----BEGIN RSA PRIVATE KEY-----/,
    severity: 'critical',
  },
  {
    id: 'ec_private_key',
    name: 'EC Private Key',
    pattern: /-----BEGIN EC PRIVATE KEY-----/,
    severity: 'critical',
  },
  {
    id: 'openssh_private_key',
    name: 'OpenSSH Private Key',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/,
    severity: 'critical',
  },

  // ─── JWT / Secrets ─────────────────────────────────────────────────────────
  {
    id: 'jwt_secret',
    name: 'JWT Secret Assignment',
    pattern: /(?:jwt_secret|JWT_SECRET|jwt_signing_key)\s*[=:]\s*["']?([A-Za-z0-9!@#$%^&*_+=-]{16,})["']?/i,
    severity: 'high',
  },

  // ─── Generic Password Assignments ──────────────────────────────────────────
  {
    id: 'generic_password',
    name: 'Generic Password Assignment',
    pattern: /(?:password|passwd|pwd|secret|api_key|apikey|api_secret|auth_token|access_token)\s*[=:]\s*["']([^"'\s]{8,})["']/i,
    severity: 'medium',
  },

  // ─── Twilio ────────────────────────────────────────────────────────────────
  {
    id: 'twilio_auth_token',
    name: 'Twilio Auth Token',
    pattern: /AC[a-zA-Z0-9]{32}/,
    severity: 'high',
  },

  // ─── SendGrid ──────────────────────────────────────────────────────────────
  {
    id: 'sendgrid_api_key',
    name: 'SendGrid API Key',
    pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/,
    severity: 'high',
  },

  // ─── Mailchimp ─────────────────────────────────────────────────────────────
  {
    id: 'mailchimp_api_key',
    name: 'Mailchimp API Key',
    pattern: /[0-9a-f]{32}-us[0-9]{1,2}/,
    severity: 'medium',
  },

  // ─── NPM ───────────────────────────────────────────────────────────────────
  {
    id: 'npm_auth_token',
    name: 'NPM Auth Token',
    pattern: /npm_[A-Za-z0-9]{36}/,
    severity: 'high',
  },

  // ─── Heroku ────────────────────────────────────────────────────────────────
  {
    id: 'heroku_api_key',
    name: 'Heroku API Key',
    pattern: /heroku.*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/i,
    severity: 'high',
  },
];

// Files and directories to always skip
export const EXCLUDED_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
];

// File extensions to skip (binaries, images, etc.)
export const EXCLUDED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.bmp', '.tiff',
  '.mp4', '.mp3', '.wav', '.avi', '.mov', '.webm',
  '.zip', '.tar', '.gz', '.7z', '.rar',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.lock', // e.g. package-lock.json checked separately
  '.min.js', '.min.css',
  '.map',
  '.woff', '.woff2', '.ttf', '.eot',
];
