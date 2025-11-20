# Security Policy

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [YOUR_SECURITY_EMAIL@example.com]

You should receive a response within 48 hours. If for some reason you do not, please follow up to ensure we received your original message.

Please include the following information (as much as you can provide):

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| develop | :white_check_mark: |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

### 1. Credentials and Secrets Management

#### **NEVER commit credentials to Git**

- ❌ `.env` files containing actual credentials
- ❌ API keys, tokens, passwords
- ❌ Private keys (RSA, SSH, etc.)
- ❌ Service account JSON files
- ✅ Only `.env.example` template files

#### **Use environment variables**

All sensitive credentials must be stored in environment variables:

```bash
# Backend
backend/.env.production  # Local only, never commit
backend/.env.development # Local only, never commit

# Frontend
frontend/.env.production # Local only, never commit
frontend/.env.local      # Local only, never commit
```

#### **GitHub Secrets for CI/CD**

Configure these secrets in GitHub (Settings → Secrets and variables → Actions):

- `GEMINI_API_KEY` - Google Gemini API key
- `FIREBASE_PRIVATE_KEY` - Firebase Admin SDK private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_TOKEN` - Firebase CI deploy token
- `DISCORD_WEBHOOK` - Discord webhook for alerts (optional)
- All `NEXT_PUBLIC_FIREBASE_*` variables

### 2. Credential Rotation Policy

#### **When to rotate credentials:**

- ✅ Immediately if accidentally committed to Git
- ✅ Every 90 days (recommended)
- ✅ When team member with access leaves
- ✅ After security incident
- ✅ When third-party service is compromised

#### **How to rotate:**

1. **Gemini API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Delete old key
   - Create new key
   - Update in GitHub Secrets and local `.env`

2. **Firebase Service Account:**
   - Visit: Firebase Console → Project Settings → Service Accounts
   - Delete old key
   - Generate new private key
   - Update `FIREBASE_SERVICE_ACCOUNT` in all environments

3. **Firebase Deploy Token:**
   ```bash
   firebase login:ci
   # Copy new token
   # Update FIREBASE_TOKEN in GitHub Secrets
   ```

### 3. Git Security

#### **Pre-commit Hook**

A pre-commit hook is installed at `.git/hooks/pre-commit` to prevent accidental commits of:

- `.env` files (except `.example`)
- Files containing `api_key`, `password`, `secret`, `token`
- Private keys

To bypass (NOT recommended):
```bash
git commit --no-verify  # Only for emergencies
```

#### **Check Git History**

If you accidentally committed secrets:

```bash
# Check if secrets are in Git history
git log --all --full-history -- "**/.env*"

# If found, use BFG Repo Cleaner or git-filter-repo to remove
# Then IMMEDIATELY rotate all exposed credentials
```

### 4. Firebase Security

#### **Firestore Rules**

Security rules are enforced in [firestore.rules](firestore.rules):

- ✅ Authentication required for all operations
- ✅ Role-based access control (master/player)
- ✅ Document ownership validation
- ✅ Rate limiting considerations

Review rules before deploying:
```bash
firebase deploy --only firestore:rules
```

#### **Storage Rules**

Storage rules in [storage.rules](storage.rules):

- ✅ File type validation (PDF only)
- ✅ File size limits (50MB max)
- ✅ Authentication required
- ✅ Master-only uploads

### 5. API Security

#### **Rate Limiting**

Backend implements rate limiting:

- **Production:** 30 requests/minute per IP
- **Development:** 20 requests/minute per IP

Configured in `backend/index.js`:
```javascript
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Muitas requisições..." }
});
```

#### **CORS**

CORS is restricted to known origins only:

```javascript
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_VERCEL_URL,
].filter(Boolean);
```

Never set `origin: "*"` in production.

#### **JWT Authentication**

All protected routes require Firebase JWT:

```javascript
// middleware/auth.js
const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  // ...
};
```

### 6. Dependency Security

#### **Automated Scanning**

- Enable GitHub Dependabot alerts (Settings → Code security)
- Run `npm audit` regularly:

```bash
cd backend && npm audit
cd frontend && npm audit
```

#### **Update Policy**

- Review and update dependencies monthly
- Address critical vulnerabilities within 48h
- Test thoroughly after updates

### 7. Production Deployment Security

#### **Checklist before production:**

- [ ] All credentials rotated and stored in GitHub Secrets
- [ ] `.env` files not committed to Git
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Firebase Auth configured
- [ ] Backups enabled
- [ ] Monitoring and alerts configured

#### **Vercel Environment Variables**

Configure in Vercel dashboard (Settings → Environment Variables):

- All `NEXT_PUBLIC_*` variables
- Separate values for Production, Preview, and Development

#### **PM2 Process Security**

- Run backend with non-root user
- Use environment-specific configs
- Enable log rotation:

```javascript
// ecosystem.config.js
log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
merge_logs: true,
max_restarts: 10,
```

### 8. Monitoring and Logging

#### **What to log:**

- ✅ Authentication attempts
- ✅ Failed authorization
- ✅ Rate limit violations
- ✅ API errors
- ✅ Suspicious activity patterns

#### **What NOT to log:**

- ❌ Passwords
- ❌ API keys
- ❌ Private keys
- ❌ Full user documents with PII
- ❌ Credit card numbers

#### **Log Retention**

- Production logs: 30 days minimum
- Error logs: 90 days
- Security logs: 1 year

### 9. Incident Response Plan

#### **If credentials are exposed:**

1. **IMMEDIATE (< 1 hour):**
   - Rotate ALL exposed credentials
   - Check Firebase logs for unauthorized access
   - Check Google Cloud logs for API usage spikes
   - Notify team via Discord/Slack

2. **SHORT TERM (< 24 hours):**
   - Review all commits in last 30 days
   - Scan for other potential exposures
   - Update GitHub Secrets
   - Deploy with new credentials
   - Monitor for suspicious activity

3. **FOLLOW UP (< 1 week):**
   - Root cause analysis
   - Update security procedures
   - Train team on prevention
   - Document incident and response

### 10. Contact

For security concerns, contact:

- **Email:** [YOUR_SECURITY_EMAIL@example.com]
- **Discord:** [Your Discord Server Link]
- **GitHub Issues:** (for non-sensitive security improvements only)

---

## Recent Security Changes

### 2025-11-20: Credential Rotation
- Rotated Gemini API Key
- Rotated Firebase Service Account
- Updated .gitignore to prevent .env commits
- Added pre-commit hook for secret detection
- Created this SECURITY.md policy

---

**Last Updated:** 2025-11-20
**Version:** 1.0.0
