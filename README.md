# ClickUp MCP Server

Production-ready Model Context Protocol server for ClickUp API integration.

## 🚀 Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/clickup-mcp)

## 🛠️ Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
CLICKUP_PERSONAL_TOKEN=your_clickup_token_here
LOG_LEVEL=debug
SERVER_MODE=stdio
PORT=3000
```

### 2. Local Development

```bash
npm install
npm run dev
```

### 3. Production Build

```bash
npm run build
npm start
```

## 🔧 Available Tools

- **Task Management**: Create, update, delete tasks
- **Space/Folder/List Management**: Organize your workspace
- **Custom Fields**: Handle custom field operations
- **Time Tracking**: Track time on tasks
- **Comments**: Add and manage task comments
- **Teams/Users**: Manage team members and permissions

## 🐳 Docker Support

```bash
docker build -t clickup-mcp .
docker run -p 3000:3000 --env-file .env clickup-mcp
```

## 🎯 Usage with Claude

### Local Usage (STDIO)
Add to your MCP settings:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["clickup-mcp"],
      "env": {
        "CLICKUP_PERSONAL_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Remote Usage (HTTP via Railway)
For remote deployment, use:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-remote", "https://your-app.railway.app/mcp"],
      "env": {
        "CLICKUP_PERSONAL_TOKEN": "your_token_here"
      }
    }
  }
}
```

---

Built with ❤️ by Vinyl Marketing for maximum automation power.
