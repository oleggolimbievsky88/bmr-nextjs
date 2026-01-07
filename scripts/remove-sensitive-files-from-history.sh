#!/bin/bash
# Script to remove sensitive files from git history
# WARNING: This rewrites git history. Use with caution!

set -e

echo "⚠️  WARNING: This script will rewrite git history!"
echo "⚠️  Make sure you have a backup and coordinate with your team!"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Files to remove from history
FILES=(
    ".env.local.backup"
    ".env.local.backup-1760411403011"
    ".vscode/settings.json"
)

echo "Removing sensitive files from git history..."

# Use git filter-branch to remove files from all commits
for file in "${FILES[@]}"; do
    echo "Removing $file from history..."
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch '$file'" \
        --prune-empty --tag-name-filter cat -- --all
done

# Clean up backup refs created by filter-branch
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Force garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Sensitive files removed from git history!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Rotate ALL exposed credentials immediately:"
echo "   - Database passwords"
echo "   - API keys (UPS, Google Maps, YouTube)"
echo "   - SMTP credentials"
echo "   - OAuth tokens"
echo ""
echo "2. Force push to update remote (after coordinating with team):"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "3. Inform all team members to re-clone the repository"
