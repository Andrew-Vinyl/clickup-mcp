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
import { fileURLToPath } from 'url';
import { ClickUpAPI } from './clickup-api.js';
import { registerAllTools } from './tools/index.js';

// ES Module helpers
const __filename = fileURLToPath(import.meta.url);

// Load environment variables with error handling
try {
  dotenv.config();
} catch (error) {
  console.log('⚠️  dotenv config failed, using process.env directly');
}

// Environment variables with Railway defaults
const CLICKUP_TOKEN = process.env.CLICKUP_PERSONAL_TOKEN || '';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const SERVER_MODE = process.env.SERVER_MODE || process.env.NODE_ENV === 'production' ? 'http' : 'stdio';
const PORT = parseInt(process.env.PORT || '3000');

console.log('🔧 Environment Configuration:');
console.log(`   SERVER_MODE: ${SERVER_MODE}`);
console.log(`   PORT: ${PORT}`);
console.log(`   CLICKUP_TOKEN: ${CLICKUP_TOKEN ? 'SET ✅' : 'MISSING ❌'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Extended server interface to handle our custom properties
interface ExtendedServer extends Server {
  tools?: Map<string, Tool>;
  toolHandlers?: Map<string, (args: any) => Promise<any>>;
}

class ClickUpMCPServer {
  private server: ExtendedServer;
  private clickup: ClickUpAPI | null = null;

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

    // Initialize ClickUp API only if token is available
    if (CLICKUP_TOKEN) {
      try {
        this.clickup = new ClickUpAPI(CLICKUP_TOKEN, LOG_LEVEL as any);
        console.log('✅ ClickUp API initialized');
      } catch (error) {
        console.error('❌ ClickUp API initialization failed:', error);
      }
    } else {
      console.log('⚠️  ClickUp token not provided - running in demo mode');
    }

    this.setupHandlers();
  }

  private setupHandlers() {
    // Initialize custom properties
    this.server.tools = new Map();
    this.server.toolHandlers = new Map();

    // Register tools only if ClickUp API is available
    if (this.clickup) {
      try {
        registerAllTools(this.server, this.clickup);
        console.log(`✅ Registered ${this.server.tools.size} tools`);
      } catch (error) {
        console.error('❌ Tool registration failed:', error);
      }
    } else {
      // Add a demo tool for health checks
      this.server.tools.set('demo_ping', {
        name: 'demo_ping',
        description: 'Demo ping tool - ClickUp token required for full functionality',
        inputSchema: { type: 'object', properties: {}, required: [] }
      });
      this.server.toolHandlers.set('demo_ping', async () => ({
        success: true,
        message: 'Demo mode - Add CLICKUP_PERSONAL_TOKEN for full functionality'
      }));
    }

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
    console.log(`🔌 Binding to port ${PORT}...`);
    
    const app = express();
    
    // Basic middleware
    app.use(express.json({ limit: '10mb' }));
    app.use((req, res, next) => {
      console.log(`📨 ${req.method} ${req.path}`);
      next();
    });

    // Health check endpoint (Railway requirement)
    app.get('/health', (req, res) => {
      try {
        const healthData = {
          status: 'healthy',
          service: 'clickup-mcp',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          tools: this.server.tools?.size || 0,
          mode: SERVER_MODE,
          clickup_connected: !!this.clickup,
          environment: {
            node_env: process.env.NODE_ENV,
            port: PORT,
            has_token: !!CLICKUP_TOKEN
          }
        };
        
        console.log('✅ Health check successful');
        res.status(200).json(healthData);
      } catch (error) {
        console.error('❌ Health check failed:', error);
        res.status(500).json({ 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({ 
        message: 'ClickUp MCP Server is running',
        health: '/health',
        version: '1.0.0',
        tools: this.server.tools?.size || 0
      });
    });

    // Tools endpoint for debugging
    app.get('/tools', (req, res) => {
      const toolsMap = this.server.tools || new Map();
      const tools = Array.from(toolsMap.keys());
      res.json({ tools, count: tools.length });
    });

    // MCP endpoint (for future HTTP transport support)
    app.post('/mcp', async (req, res) => {
      res.json({ message: 'MCP HTTP endpoint ready for future implementation' });
    });

    // Error handling middleware
    app.use((error: any, req: any, res: any, next: any) => {
      console.error('🚨 Express error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });

    // Start server with error handling
    try {
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ ClickUp MCP Server running on port ${PORT}`);
        console.log(`🔍 Health check: http://localhost:${PORT}/health`);
        console.log(`🔧 Registered ${this.server.tools?.size || 0} tools`);
        console.log(`🌐 Server ready for Railway deployment`);
      });

      // Handle server errors
      server.on('error', (error: any) => {
        console.error('🚨 Server error:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`💥 Port ${PORT} is already in use`);
          process.exit(1);
        }
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('👋 Received SIGTERM, shutting down gracefully');
        server.close(() => {
          console.log('✅ Server closed');
          process.exit(0);
        });
      });

    } catch (error) {
      console.error('💥 Failed to start HTTP server:', error);
      process.exit(1);
    }
  }
}

// Main execution with comprehensive error handling
async function main() {
  try {
    console.log('🔥 ClickUp MCP Server Starting...');
    console.log('==========================================');
    
    const server = new ClickUpMCPServer();

    if (SERVER_MODE === 'http' || process.env.NODE_ENV === 'production') {
      await server.startHttp();
    } else {
      await server.startStdio();
    }
  } catch (error) {
    console.error('💥 Fatal error during startup:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// ES Module startup check - replaces require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
