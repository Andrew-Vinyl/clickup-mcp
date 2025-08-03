import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
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
  private sseTransports: Map<string, SSEServerTransport> = new Map();

  constructor() {
    console.log('🏗️  Constructing ClickUp MCP Server...');
    
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

    console.log('✅ MCP Server created');

    // Initialize ClickUp API only if token is available
    if (CLICKUP_TOKEN) {
      try {
        console.log('🔑 Initializing ClickUp API...');
        this.clickup = new ClickUpAPI(CLICKUP_TOKEN, LOG_LEVEL as any);
        console.log('✅ ClickUp API initialized');
      } catch (error) {
        console.error('❌ ClickUp API initialization failed:', error);
      }
    } else {
      console.log('⚠️  ClickUp token not provided - running in demo mode');
    }

    console.log('🔧 Setting up handlers...');
    this.setupHandlers();
    console.log('✅ Handlers setup complete');
  }

  private setupHandlers() {
    console.log('📝 Initializing tool storage...');
    // Initialize custom properties
    this.server.tools = new Map();
    this.server.toolHandlers = new Map();

    // Register basic tools without external dependencies to avoid hanging
    console.log('🛠️  Registering basic tools...');
    this.registerBasicTools();

    console.log('📋 Setting up request handlers...');
    this.setupRequestHandlers();
    console.log('✅ Request handlers setup complete');
  }

  private registerBasicTools() {
    // Add basic tools that don't require ClickUp API
    this.server.tools!.set('demo_ping', {
      name: 'demo_ping',
      description: 'Demo ping tool - ClickUp token required for full functionality',
      inputSchema: { type: 'object', properties: {}, required: [] }
    });
    
    this.server.toolHandlers!.set('demo_ping', async () => ({
      success: true,
      message: 'Demo mode - Add CLICKUP_PERSONAL_TOKEN for full functionality',
      timestamp: new Date().toISOString()
    }));

    // Add ClickUp teams tool if API is available
    if (this.clickup) {
      this.server.tools!.set('clickup_get_teams', {
        name: 'clickup_get_teams',
        description: 'Get all teams for the authenticated user',
        inputSchema: { type: 'object', properties: {}, required: [] }
      });
      
      this.server.toolHandlers!.set('clickup_get_teams', async () => {
        try {
          const teams = await this.clickup!.getTeams();
          return {
            success: true,
            data: teams,
            message: `Retrieved ${teams.length} teams`
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            message: 'Failed to retrieve teams'
          };
        }
      });
    }

    console.log(`📦 Registered ${this.server.tools!.size} basic tools`);
  }

  private setupRequestHandlers() {
    // Initialize request handler - handle as notification
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log('📋 Handling list tools request...');
      const toolsMap = this.server.tools || new Map();
      const tools = Array.from(toolsMap.entries()).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));

      console.log(`📋 Returning ${tools.length} tools`);
      return { tools };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.log(`🔧 Handling tool call: ${name}`);
      
      try {
        const toolHandlers = this.server.toolHandlers || new Map();
        const handler = toolHandlers.get(name);
        
        if (!handler) {
          console.error(`❌ Tool not found: ${name}`);
          throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
        }

        console.log(`⚡ Executing tool: ${name}`);
        const result = await handler(args);
        console.log(`✅ Tool executed successfully: ${name}`);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Tool execution failed: ${name} - ${errorMessage}`);
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

    // Tools endpoint for debugging
    app.get('/tools', (req, res) => {
      console.log('🔧 Tools endpoint accessed');
      const toolsMap = this.server.tools || new Map();
      const tools = Array.from(toolsMap.keys());
      res.json({ tools, count: tools.length });
    });

    // MCP SSE endpoint - GET request to establish SSE connection
    app.get('/mcp', async (req, res) => {
      console.log('🌊 MCP SSE connection request received');
      console.log(`   User-Agent: ${req.headers['user-agent'] || 'unknown'}`);
      console.log(`   Accept: ${req.headers.accept || 'unknown'}`);

      try {
        // Create SSE transport with POST endpoint for messages
        const transport = new SSEServerTransport('/mcp', res);

        // Store transport for session management
        this.sseTransports.set(transport.sessionId, transport);

        // Handle transport events
        transport.onclose = () => {
          console.log(`👋 MCP SSE transport closed for session ${transport.sessionId}`);
          this.sseTransports.delete(transport.sessionId);
        };

        transport.onerror = (error) => {
          console.error(`🚨 MCP SSE transport error for session ${transport.sessionId}:`, error);
          this.sseTransports.delete(transport.sessionId);
        };

        // Handle connection close
        req.on('close', () => {
          console.log(`🔌 Client disconnected for session ${transport.sessionId}`);
          this.sseTransports.delete(transport.sessionId);
        });

        req.on('error', (error) => {
          console.error(`🚨 Request error for session ${transport.sessionId}:`, error);
          this.sseTransports.delete(transport.sessionId);
        });

        // Connect the MCP server to this transport
        await this.server.connect(transport);

        console.log(`✅ MCP Server connected via SSE transport, session: ${transport.sessionId}`);

      } catch (error) {
        console.error('❌ Failed to establish MCP SSE connection:', error);
        res.status(500).json({
          error: 'Failed to establish MCP connection',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // MCP POST endpoint - Handle incoming messages from SSE transport
    app.post('/mcp', async (req, res) => {
      console.log('📨 MCP POST message received');
      console.log(`   Query params:`, req.query);
      console.log(`   Body:`, req.body);

      try {
        // Get session ID from query parameters
        const sessionId = req.query.sessionId as string;

        if (!sessionId) {
          console.error('❌ No sessionId provided in POST request');
          res.status(400).json({ error: 'sessionId required' });
          return;
        }

        // Find the SSE transport for this session
        const transport = this.sseTransports.get(sessionId);

        if (!transport) {
          console.error(`❌ No SSE transport found for session: ${sessionId}`);
          res.status(404).json({ error: 'Session not found' });
          return;
        }

        // Let the transport handle the message
        await transport.handlePostMessage(req, res);
        console.log(`✅ Message handled by SSE transport for session: ${sessionId}`);

      } catch (error) {
        console.error('❌ MCP POST message handling error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Failed to handle MCP message',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    });

    // Handle OPTIONS for MCP endpoint
    app.options('/mcp', (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Accept, Authorization');
      res.status(200).end();
    });

    // Error handling middleware
    app.use((error: any, req: any, res: any, next: any) => {
      console.error('🚨 Express error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });



    // Start server with error handling
    try {
      console.log('🌐 Starting Express server...');
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
    
    console.log('🏗️  Creating server instance...');
    const server = new ClickUpMCPServer();
    console.log('✅ Server instance created');

    if (SERVER_MODE === 'http' || process.env.NODE_ENV === 'production') {
      console.log('🌐 Starting in HTTP mode...');
      await server.startHttp();
    } else {
      console.log('📡 Starting in STDIO mode...');
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

// FORCE STARTUP - Always run main() regardless of how this is called
console.log('🚀 FORCE STARTING - Main execution beginning...');
main().catch((error) => {
  console.error('💥 CRITICAL STARTUP FAILURE:', error);
  process.exit(1);
});
