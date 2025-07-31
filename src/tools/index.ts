import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ClickUpAPI } from '../clickup-api.js';

// Import all tool modules
import { registerTeamTools } from './teams.js';
import { registerSpaceTools } from './spaces.js';
import { registerFolderTools } from './folders.js';
import { registerListTools } from './lists.js';
import { registerTaskTools } from './tasks.js';
import { registerCommentTools } from './comments.js';
import { registerCustomFieldTools } from './custom-fields.js';
import { registerTimeTrackingTools } from './time-tracking.js';

/**
 * Register all ClickUp tools with the MCP server
 */
export function registerAllTools(server: Server, clickup: ClickUpAPI): void {
  console.log('🔧 Registering ClickUp MCP tools...');

  // Initialize tool handlers map if it doesn't exist
  if (!server['toolHandlers']) {
    server['toolHandlers'] = new Map();
  }

  if (!server['tools']) {
    server['tools'] = new Map();
  }

  // Register all tool categories
  registerTeamTools(server, clickup);
  registerSpaceTools(server, clickup);
  registerFolderTools(server, clickup);
  registerListTools(server, clickup);
  registerTaskTools(server, clickup);
  registerCommentTools(server, clickup);
  registerCustomFieldTools(server, clickup);
  registerTimeTrackingTools(server, clickup);

  const toolCount = server['tools'].size;
  console.log(`✅ Registered ${toolCount} ClickUp tools`);
}

/**
 * Helper function to register a tool with the server
 */
export function registerTool(
  server: Server,
  name: string,
  description: string,
  inputSchema: any,
  handler: (args: any) => Promise<any>
): void {
  // Store tool definition
  server['tools'].set(name, {
    name,
    description,
    inputSchema,
  });

  // Store tool handler
  server['toolHandlers'].set(name, handler);
}
