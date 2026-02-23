---
name: gh
description: GitHub CLI master operations - manage repos, PRs, issues, workflows, gists, and all GitHub functionality from command line.
metadata:
  openclaw:
    requires:
      bins:
        - gh
        - git
---

# GitHub CLI Master — Complete GitHub Operations

Master-level GitHub operations via GitHub CLI. Handle repositories, pull requests, issues, workflows, gists, and direct API access. Your GitHub sensei for all command-line operations.

## When to Use This Skill

- Create and manage repositories
- Handle pull request workflows
- Manage issues and project management
- Run GitHub Actions workflows  
- Work with gists and code snippets
- Direct GitHub API operations
- Search across GitHub
- Organization and team management

## Repository Management

### Create and Clone Repositories
```bash
# Create new repo (public)
gh repo create my-awesome-repo --public --description "My awesome project"

# Create new repo (private) 
gh repo create my-private-repo --private --clone

# Create from template
gh repo create my-new-project --template owner/template-repo

# Clone repositories
gh repo clone owner/repo-name
gh repo clone https://github.com/owner/repo-name

# Fork a repository
gh repo fork owner/original-repo --clone
```

### Repository Settings and Management  
```bash
# View repository details
gh repo view owner/repo-name
gh repo view --web  # Open in browser

# Edit repository settings
gh repo edit --description "New description"
gh repo edit --homepage https://example.com
gh repo edit --visibility private
gh repo edit --add-topic javascript,nodejs
gh repo edit --remove-topic old-topic

# Archive/unarchive repositories
gh repo archive owner/repo-name
gh repo unarchive owner/repo-name

# Delete repository (be careful!)
gh repo delete owner/repo-name --yes

# List repositories
gh repo list                    # Your repos
gh repo list owner             # Someone else's repos
gh repo list --limit 50 --visibility public
```

## Pull Request Mastery

### Create and Manage PRs
```bash
# Create pull request
gh pr create --title "Add new feature" --body "Description of changes"
gh pr create --fill  # Auto-fill from commits
gh pr create --draft  # Create as draft
gh pr create --web    # Open web interface

# List pull requests
gh pr list
gh pr list --state open
gh pr list --author @me
gh pr list --assignee username
gh pr list --label bug,enhancement

# View PR details
gh pr view 123
gh pr view 123 --web
gh pr view 123 --comments

# Checkout PR locally
gh pr checkout 123
gh pr checkout https://github.com/owner/repo/pull/123
```

### PR Reviews and Management
```bash
# Review a PR
gh pr review 123 --approve
gh pr review 123 --request-changes --body "Please fix these issues"
gh pr review 123 --comment --body "Looks good overall"

# Add comments
gh pr comment 123 --body "Great work on this feature!"

# Merge pull requests  
gh pr merge 123 --merge     # Regular merge
gh pr merge 123 --squash    # Squash merge
gh pr merge 123 --rebase    # Rebase merge
gh pr merge 123 --delete-branch  # Delete branch after merge

# PR status and checks
gh pr status
gh pr checks 123
gh pr diff 123

# Close/reopen PRs
gh pr close 123
gh pr reopen 123
```

## Issue Management

### Create and Manage Issues
```bash
# Create issues
gh issue create --title "Bug in login system" --body "Description of bug"
gh issue create --label bug,priority-high
gh issue create --assignee username
gh issue create --milestone v1.0

# List issues
gh issue list
gh issue list --state open
gh issue list --assignee @me
gh issue list --label bug
gh issue list --author username

# View issue details
gh issue view 456
gh issue view 456 --web
gh issue view 456 --comments

# Edit issues
gh issue edit 456 --title "Updated title"
gh issue edit 456 --body "Updated description"
gh issue edit 456 --add-label enhancement
gh issue edit 456 --add-assignee username
```

### Issue Operations
```bash
# Comment on issues
gh issue comment 456 --body "I can reproduce this issue"

# Close/reopen issues
gh issue close 456
gh issue reopen 456

# Pin/unpin issues
gh issue pin 456
gh issue unpin 456

# Transfer issues
gh issue transfer 456 other-owner/other-repo

# Delete issues
gh issue delete 456

# Link branches to issues
gh issue develop 456 --checkout  # Create and checkout branch
```

## GitHub Actions & Workflows

### Workflow Management
```bash
# List workflows
gh workflow list

# View workflow details
gh workflow view workflow.yml
gh workflow view "CI/CD Pipeline"

# Run workflow manually
gh workflow run workflow.yml
gh workflow run workflow.yml --ref main
gh workflow run workflow.yml -f environment=production

# Enable/disable workflows
gh workflow enable workflow.yml  
gh workflow disable workflow.yml
```

### Workflow Runs
```bash
# List workflow runs
gh run list
gh run list --workflow=ci.yml
gh run list --status=failure
gh run list --limit 20

# View run details
gh run view 12345678
gh run view 12345678 --web
gh run view 12345678 --log

# Download run artifacts
gh run download 12345678
gh run download 12345678 --name artifact-name

# Cancel/rerun workflows
gh run cancel 12345678
gh run rerun 12345678
```

## Gist Operations

### Create and Manage Gists
```bash
# Create gists
gh gist create file.txt
gh gist create file1.txt file2.py --description "Useful scripts"
gh gist create --public file.txt  # Public gist
echo "console.log('hello')" | gh gist create --filename hello.js

# List gists  
gh gist list
gh gist list --limit 50

# View gists
gh gist view gist-id
gh gist view gist-id --web
gh gist view gist-id --filename specific-file.txt

# Clone gists
gh gist clone gist-id

# Edit gists
gh gist edit gist-id
gh gist rename gist-id old-name.txt new-name.txt

# Delete gists
gh gist delete gist-id
```

## Search Operations

### Search Across GitHub
```bash
# Search repositories
gh search repos "machine learning" --language python
gh search repos --owner microsoft --language typescript
gh search repos "web framework" --stars ">1000"

# Search issues
gh search issues "bug" --repo owner/repo
gh search issues "is:open is:issue author:username"

# Search pull requests  
gh search prs "is:open is:pr review-requested:@me"
gh search prs "react" --language javascript

# Search code
gh search code "function authenticate" --extension js
gh search code "class DatabaseConnection" --repo owner/repo

# Search commits
gh search commits "fix bug" --author username
gh search commits "security" --org organization
```

## Direct API Access

### REST API Operations
```bash
# Get repository info
gh api repos/{owner}/{repo}

# List repository issues
gh api repos/{owner}/{repo}/issues

# Create an issue via API
gh api repos/{owner}/{repo}/issues \
  --method POST \
  -f title="API created issue" \
  -f body="Created via gh api command"

# Get user information
gh api user
gh api users/username

# Organization operations
gh api orgs/{org}/repos
gh api orgs/{org}/members

# Raw API with custom headers
gh api repos/{owner}/{repo}/releases \
  -H "Accept: application/vnd.github.v3+json"
```

### GraphQL Operations
```bash
# GraphQL query example
gh api graphql -f query='
  query {
    viewer {
      login
      repositories(first: 10) {
        nodes {
          name
          stargazerCount
        }
      }
    }
  }'

# Paginated GraphQL query
gh api graphql --paginate -f query='
  query($endCursor: String) {
    search(query: "language:python", type: REPOSITORY, first: 10, after: $endCursor) {
      nodes {
        ... on Repository {
          nameWithOwner
          stargazerCount
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }'
```

## Organization Management

### Organization Operations
```bash
# List organization repositories
gh repo list org-name

# Organization member management (requires admin)
gh api orgs/{org}/members
gh api orgs/{org}/teams

# Organization secrets (requires admin)
gh secret list --org org-name
gh secret set SECRET_NAME --org org-name --body "secret-value"
```

## Secrets and Variables

### Repository Secrets
```bash
# List secrets
gh secret list
gh secret list --org org-name

# Set secrets
gh secret set SECRET_NAME
gh secret set DATABASE_URL --body "postgresql://..."

# Delete secrets
gh secret delete SECRET_NAME
```

### Environment Variables
```bash
# List variables
gh variable list
gh variable list --env production

# Set variables
gh variable set ENVIRONMENT_NAME --body "production"
gh variable set API_ENDPOINT --env staging --body "https://staging-api.com"

# Delete variables
gh variable delete VARIABLE_NAME
```

## Advanced Operations

### Aliases and Extensions
```bash
# Create custom aliases
gh alias set --shell prs 'gh pr list --author @me'
gh alias set --shell my-issues 'gh issue list --assignee @me'

# List extensions
gh extension list

# Install extensions
gh extension install owner/gh-extension-name
```

### Configuration and Status
```bash
# Check overall status
gh status

# Authentication status
gh auth status

# Configuration  
gh config set editor vim
gh config set git_protocol https
gh config list

# Browse to web interface
gh browse                    # Current repo
gh browse --settings        # Repository settings
gh browse issues/123        # Specific issue/PR
```

## Batch Operations and Automation

### Multiple Repositories
```bash
# Loop through user's repositories
for repo in $(gh repo list --json name -q '.[].name'); do
  echo "Processing $repo"
  gh repo view "$repo" --json description -q '.description'
done

# Bulk operations with jq
gh repo list --json nameWithOwner,stargazerCount \
  | jq '.[] | select(.stargazerCount > 100) | .nameWithOwner'
```

### JSON Output and Processing
```bash
# Get structured data
gh pr list --json number,title,state,author
gh issue list --json number,title,labels,assignees
gh repo list --json nameWithOwner,description,stargazerCount,language

# Process with jq
gh pr list --json number,title | jq '.[] | select(.title | contains("bug"))'
```

## Error Handling and Debugging

### Common Issues
```bash
# Verbose output for debugging
gh repo list --verbose

# Check authentication
gh auth token

# Force refresh authentication
gh auth refresh

# Repository not found - check format
gh repo view owner/repo-name  # Correct format
```

### Rate Limiting
```bash
# Check rate limit status
gh api rate_limit

# Use --cache for repeated requests
gh api repos/{owner}/{repo} --cache 3600s
```

## Tips and Best Practices

### Efficiency Tips
- Use `--json` flag for programmatic processing
- Leverage aliases for common operations  
- Use `--web` flag to open things in browser quickly
- Use repository shortcuts when in git repos (auto-detects owner/repo)
- Use `@me` for operations on your own content

### Security Tips  
- Use organization secrets for sensitive data
- Be careful with `gh repo delete` - it's permanent
- Review PR changes before merging with `gh pr diff`
- Use draft PRs for work-in-progress

### Automation Patterns
- Combine with shell scripts for bulk operations
- Use `gh api` for operations not covered by specific commands
- Leverage GitHub Actions with `gh workflow run`
- Use search commands for discovery and reporting

## Integration with Git

GitHub CLI works seamlessly with git:
```bash
# In a git repository, these auto-detect owner/repo:
gh pr create
gh issue list  
gh repo view

# Set default repository for directory
gh repo set-default owner/repo-name
```

This skill provides complete GitHub operations via CLI. Use it for repository management, collaboration workflows, automation, and any GitHub operation from the command line.