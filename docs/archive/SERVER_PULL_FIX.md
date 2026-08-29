# Fix Git Pull Conflict on Server

## Problem
Server has local uncommitted changes to `package.json` preventing `git pull`.

## Solution - Choose One:

### Option 1: Stash Local Changes (Recommended)
```bash
cd /var/www/Rava-KPI-Platform

# Stash local changes
git stash

# Pull latest code
git pull origin main

# If you need your local changes back later:
# git stash pop
```

### Option 2: Discard Local Changes (If you don't need them)
```bash
cd /var/www/Rava-KPI-Platform

# Discard local changes to package.json
git checkout -- package.json

# Pull latest code
git pull origin main
```

### Option 3: Commit Local Changes First
```bash
cd /var/www/Rava-KPI-Platform

# See what changed
git diff package.json

# If changes are important, commit them:
git add package.json
git commit -m "Local package.json changes"

# Then pull (may need merge)
git pull origin main
```

## Recommended: Option 1 (Stash)
This preserves your local changes in case you need them later, but allows the pull to proceed.

