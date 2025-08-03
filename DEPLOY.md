# 🚂 Railway Deployment Guide

## Quick Deploy Button

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fyourusername%2Fclickup-mcp&plugins=&envs=CLICKUP_PERSONAL_TOKEN%2CSERVER_MODE&CLICKUP_PERSONAL_TOKENDesc=Your+ClickUp+Personal+API+Token&SERVER_MODEDesc=Set+to+%27http%27+for+Railway+deployment&SERVER_MODEDefault=http)

## Manual Deployment Steps

### 1. 🔑 Get Your ClickUp Token

1. Go to https://app.clickup.com/settings/apps
2. Click "Generate" under "Personal API Token"
3. Copy the token (starts with `pk_`)

### 2. 🐙 Push to GitHub

```bash
git init
git add .
git commit -m "Initial ClickUp MCP Server"
git remote add origin https://github.com/yourusername/clickup-mcp.git
git push -u origin main
```

### 3. 🚂 Deploy on Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `clickup-mcp` repository
5. Railway will automatically detect the Dockerfile

### 4. ⚙️ Environment Variables

Add these environment variables in Railway:

```bash
CLICKUP_PERSONAL_TOKEN=pk_your_token_here
SERVER_MODE=http
PORT=3000
LOG_LEVEL=info
```

### 5. 🔍 Verify Deployment

Once deployed, test the health endpoint:

```bash
curl https://your-app.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "clickup-mcp",
  "version": "1.0.0",
  "timestamp": "2025-07-31T..."
}
```

## 🔧 Usage with Claude

### Local Usage (STDIO)
Add to your Claude MCP settings (`~/Library/Application Support/Claude/mcp_settings.json`):

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["clickup-mcp"],
      "env": {
        "CLICKUP_PERSONAL_TOKEN": "pk_your_token_here"
      }
    }
  }
}
```

### Remote Usage (HTTP via Railway)
For the deployed Railway server, use:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-remote", "https://your-app.railway.app/mcp"],
      "env": {
        "CLICKUP_PERSONAL_TOKEN": "pk_your_token_here"
      }
    }
  }
}
```

## 🛠️ Available Tools

Once connected, Claude can use these ClickUp tools:

- **Teams**: `clickup_get_teams`
- **Spaces**: `clickup_get_spaces`, `clickup_create_space`
- **Folders**: `clickup_get_folders`, `clickup_create_folder`
- **Lists**: `clickup_get_lists`, `clickup_get_folderless_lists`, `clickup_create_list`
- **Tasks**: `clickup_get_tasks`, `clickup_get_task`, `clickup_create_task`, `clickup_update_task`, `clickup_delete_task`
- **Comments**: `clickup_get_task_comments`, `clickup_create_task_comment`
- **Custom Fields**: `clickup_get_custom_fields`, `clickup_set_custom_field_value`
- **Time Tracking**: `clickup_get_time_entries`, `clickup_start_time_tracking`, `clickup_stop_time_tracking`

## 🚨 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your `CLICKUP_PERSONAL_TOKEN`
2. **403 Forbidden**: Token valid but lacks permissions
3. **404 Not Found**: Invalid team/space/list/task IDs
4. **Docker build fails**: Check Dockerfile syntax
5. **Railway deploy fails**: Verify environment variables

### Debug Steps

1. Check Railway logs in the dashboard
2. Test locally with `npm run dev`
3. Verify token permissions in ClickUp
4. Run `npm test` to validate setup

### Get Help

- Check Railway logs for error details
- Verify ClickUp API status
- Test with different team/workspace
- Ensure token has required permissions

---

Built with ❤️ by Vinyl Marketing for maximum ClickUp automation power.
