# Security Fix: Sensitive Credentials Exposure

## Issue Summary
Sensitive credentials were committed to version control in the following files:
- `.env.local.backup`
- `.env.local.backup-1760411403011`
- `.vscode/settings.json`

These files contained:
- Database passwords (MySQL)
- API keys (UPS, Google Maps, YouTube)
- SMTP credentials
- OAuth tokens

## Immediate Actions Taken

1. ✅ Removed sensitive files from git tracking
2. ✅ Updated `.gitignore` to prevent future commits
3. ✅ Removed hardcoded credentials from `.vscode/settings.json` (now uses environment variables)

## Required Actions

### 1. Remove Files from Git History

The files have been removed from tracking, but they still exist in git history. To completely remove them:

```bash
# Option 1: Use the provided script (recommended)
./scripts/remove-sensitive-files-from-history.sh

# Option 2: Manual removal using git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local.backup .env.local.backup-1760411403011 .vscode/settings.json" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**⚠️ WARNING:** This rewrites git history. Coordinate with your team before force pushing!

### 2. Rotate ALL Exposed Credentials

**CRITICAL:** All exposed credentials must be rotated immediately:

#### Database Credentials
- [ ] Change MySQL root password
- [ ] Change MySQL user passwords
- [ ] Update all application connection strings

#### API Keys
- [ ] **UPS API**: Regenerate API keys in UPS Developer Portal
- [ ] **Google Maps API**: Regenerate API key in Google Cloud Console
- [ ] **YouTube API**: Regenerate API key in Google Cloud Console

#### SMTP Credentials
- [ ] Change email service provider passwords
- [ ] Regenerate SMTP authentication tokens

#### OAuth Tokens
- [ ] Revoke and regenerate OAuth tokens for all services

### 3. Update Environment Variables

After rotating credentials, update your `.env.local` file with new values:

```bash
# Never commit .env.local - it's already in .gitignore
cp .env.local.example .env.local
# Edit .env.local with new credentials
```

### 4. Force Push (After History Cleanup)

**Only after coordinating with your team:**

```bash
git push origin --force --all
git push origin --force --tags
```

### 5. Team Notification

- [ ] Notify all team members to re-clone the repository
- [ ] Share new credentials securely (use password manager, not email/chat)

## Prevention

To prevent this in the future:

1. ✅ `.gitignore` now includes:
   - `.env.local.backup*`
   - `*.backup`
   - `.vscode/settings.json`

2. Use environment variables instead of hardcoded values:
   - ✅ `.vscode/settings.json` now uses `${env:VARIABLE_NAME}` syntax
   - Always use `.env.local` for local development (never commit it)

3. Use a pre-commit hook to scan for secrets:
   ```bash
   # Install git-secrets or similar tool
   npm install --save-dev @trufflesecurity/git-secrets
   ```

## Files Modified

- `.gitignore` - Added patterns to ignore sensitive files
- `.vscode/settings.json` - Removed hardcoded credentials, uses env vars
- `scripts/remove-sensitive-files-from-history.sh` - Script to clean git history

## Verification

After completing the above steps, verify:

```bash
# Check that files are no longer tracked
git ls-files | grep -E "(\.env\.local\.backup|\.vscode/settings\.json)"

# Should return nothing

# Check git history doesn't contain sensitive data
git log --all --full-history -p | grep -i "MYSQL_PASSWORD\|API_KEY\|SECRET"

# Review results carefully
```
