import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import express from 'express';
import { ClickUpAPI } from './clickup-api.js';
import { registerAllTools } from './tools/index.js';

// Load environment variables
dotenv.config();

const CLICKUP_TOKEN = process.env.CLICKUP_PERSONAL_TOKEN || '';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const SERVER_MODE = process.env.SERVER_MODE || 'stdio';
const PORT = parseInt(process.env.PORT || '3000');

// Extended server interface to handle our custom properties
interface ExtendedServer extends Server {
  tools?: Map<string, Tool>;
  toolHandlers?: Map<string, (args: any) => Promise<any>>;
}

if (!CLICKUP_TOKEN) {
  console.error('❌ CLICKUP_PERSONAL_TOKEN is required');
  process.exit(1);
}

class ClickUpMCPServer {
  private server: ExtendedServer;
  private clickup: ClickUpAPI;

  constructor() {
    this.server = new Server(
      {
        name: 'clickup-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    ) as ExtendedServer;

    this.clickup = new ClickUpAPI(CLICKUP_TOKEN, LOG_LEVEL as any);
    this.setupHandlers();
  }

  private setupHandlers() {
    // Initialize custom properties
    this.server.tools = new Map();
    this.server.toolHandlers = new Map();

    // Register all available tools
    registerAllTools(this.server, this.clickup);

    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const toolsMap = this.server.tools || new Map();
      const tools = Array.from(toolsMap.entries()).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      return { tools };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const toolHandlers = this.server.toolHandlers || new Map();
        const handler = toolHandlers.get(name);
        
        if (!handler) {
          throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
        }

        const result = await handler(args);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
      }
    });
  }

  async startStdio() {
    console.log('🚀 Starting ClickUp MCP Server in STDIO mode...');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('✅ ClickUp MCP Server connected via STDIO');
  }

  async startHttp() {
    console.log('🚀 Starting ClickUp MCP Server in HTTP mode...');
    
    const app = express();
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'clickup-mcp',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        tools: this.server.tools?.size || 0
      });
    });

    // MCP endpoint (for future HTTP transport support)
    app.post('/mcp', async (req, res) => {
      res.json({ message: 'MCP HTTP endpoint ready for future implementation' });
    });

    app.listen(PORT, () => {
      console.log(`✅ ClickUp MCP Server running on port ${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Registered ${this.server.tools?.size || 0} tools`);
    });
  }
}

// Main execution
async function main() {
  const server = new ClickUpMCPServer();

  if (SERVER_MODE === 'http') {
    await server.startHttp();
  } else {
    await server.startStdio();
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down ClickUp MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down ClickUp MCP Server...');
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  });
}
