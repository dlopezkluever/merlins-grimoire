# Git Branching Workflow Guide

This guide covers how to use git branches effectively for feature development and safely merge changes back to main.

## 🌿 Why Use Branches?

- **Safety**: Keep `main` stable and working
- **Isolation**: Work on features independently 
- **Collaboration**: Multiple people can work on different features
- **History**: Clear tracking of what changes were made when
- **Rollback**: Easy to undo problematic changes

## 📋 Branch Naming Conventions

Use descriptive names with prefixes:

```bash
feature/health-bar-improvements
feature/enemy-ai-enhancement
feature/inventory-system
feature/spell-casting-system

bugfix/player-movement-freeze
bugfix/health-bar-positioning
bugfix/enemy-collision-detection

ui/modal-redesign
ui/game-over-screen
ui/settings-menu

experimental/new-combat-system
experimental/procedural-generation
```

## 🚀 Complete Workflow

### 1. Starting a New Feature

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Alternative newer syntax:
git switch -c feature/your-feature-name
```

### 2. Working on Your Feature

```bash
# Make your code changes...
# Test your changes...

# Stage your changes
git add .
# Or stage specific files:
git add path/to/specific/file.ts

# Commit with a descriptive message
git commit -m "Add player inventory system with drag-and-drop"

# Continue making commits as you work...
git commit -m "Fix inventory slot highlighting"
git commit -m "Add item tooltips to inventory"
```

### 3. Pushing Your Branch to GitHub

```bash
# First time pushing this branch:
git push -u origin feature/your-feature-name

# Subsequent pushes (after first time):
git push
```

## 🔄 Merging Back to Main

### Option A: Direct Merge (Simple, for solo work)

```bash
# Switch back to main
git checkout main

# Make sure main is up to date
git pull origin main

# Merge your feature branch into main
git merge feature/your-feature-name

# Push the updated main to GitHub
git push origin main

# Clean up: delete the feature branch locally
git branch -d feature/your-feature-name

# Clean up: delete the feature branch on GitHub
git push origin --delete feature/your-feature-name
```

### Option B: Pull Request (Recommended for teams)

```bash
# Push your feature branch to GitHub
git push -u origin feature/your-feature-name
```

Then:
1. Go to GitHub.com → your repository
2. Click "Compare & pull request" 
3. Add a description of your changes
4. Click "Create pull request"
5. Review and merge via the web interface

After merging via GitHub:
```bash
# Switch back to main
git checkout main

# Pull the merged changes
git pull origin main

# Clean up local branch
git branch -d feature/your-feature-name
```

## 🛠️ Useful Git Commands

### Checking Status

```bash
# See which branch you're on and status
git status

# List all branches
git branch

# List all branches (including remote)
git branch -a

# See recent commits
git log --oneline -10
```

### Switching Branches

```bash
# Switch to existing branch
git checkout branch-name
# or
git switch branch-name

# Create and switch to new branch
git checkout -b new-branch-name
# or  
git switch -c new-branch-name
```

### Cleaning Up Branches

```bash
# Delete local branch (safe - won't delete if unmerged)
git branch -d branch-name

# Force delete local branch (be careful!)
git branch -D branch-name

# Delete remote branch
git push origin --delete branch-name

# See which branches are merged (safe to delete)
git branch --merged

# See which branches are not merged (don't delete these!)
git branch --no-merged
```

### Keeping Branches Updated

```bash
# While on your feature branch, get latest main changes:
git checkout main
git pull origin main
git checkout feature/your-branch
git merge main

# Or use rebase (cleaner history):
git checkout feature/your-branch
git rebase main
```

## 🚨 Emergency: "I Need to Switch Branches But Have Uncommitted Changes"

```bash
# Option 1: Commit your work-in-progress
git add .
git commit -m "WIP: working on feature X"

# Option 2: Stash your changes temporarily
git stash
git checkout other-branch
# Do whatever you need to do...
git checkout original-branch
git stash pop  # Restores your changes
```

## 🎯 Best Practices

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive: "Fix health bar positioning bug" not "Fix bug"
- Reference issues: "Fix #123: Player can't cast spells"

### Branch Management
- Keep branches focused on one feature/fix
- Delete branches after merging
- Don't let branches live too long (merge frequently)
- Test before merging to main

### Workflow Tips
- Always test your changes before committing
- Commit early and often
- Pull latest main before creating new branches
- Use meaningful branch names

## 📁 Example: Adding a New Game Feature

```bash
# 1. Start fresh
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/spell-cooldown-system

# 3. Work on the feature
# ... make changes to files ...
git add src/objects/spells/
git commit -m "Add spell cooldown tracking"

# ... more changes ...
git add src/objects/player/Player.ts
git commit -m "Integrate cooldown system with player casting"

# 4. Push to GitHub
git push -u origin feature/spell-cooldown-system

# 5. Merge back to main (when ready)
git checkout main
git pull origin main
git merge feature/spell-cooldown-system
git push origin main

# 6. Clean up
git branch -d feature/spell-cooldown-system
git push origin --delete feature/spell-cooldown-system
```

## 🆘 When Things Go Wrong

### "I committed to main by mistake!"
```bash
# If you haven't pushed yet:
git reset --soft HEAD~1  # Undo last commit, keep changes
# Create proper branch:
git checkout -b feature/my-feature
git commit -m "Add my feature properly"
```

### "I merged the wrong branch!"
```bash
# If you just merged and haven't pushed:
git reset --hard HEAD~1  # Undo the merge
```

### "My branch is behind main"
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main  # or git rebase main
```

---

**Remember**: When in doubt, create a branch! It's always safer to work on branches and merge when you're confident everything works. 🌿 