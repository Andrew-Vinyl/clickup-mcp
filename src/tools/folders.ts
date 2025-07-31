import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

// Extended server interface
interface ExtendedServer extends Server {
  tools?: Map<string, Tool>;
  toolHandlers?: Map<string, (args: any) => Promise<any>>;
}

export function registerFolderTools(server: ExtendedServer, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_folders',
    'Get all folders in a space',
    {
      type: 'object',
      properties: {
        spaceId: {
          type: 'string',
          description: 'The space ID to get folders for'
        }
      },
      required: ['spaceId']
    },
    async (args: { spaceId: string }) => {
      const folders = await clickup.getFolders(args.spaceId);
      return {
        success: true,
        data: folders,
        message: `Retrieved ${folders.length} folders for space ${args.spaceId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_create_folder',
    'Create a new folder in a space',
    {
      type: 'object',
      properties: {
        spaceId: {
          type: 'string',
          description: 'The space ID to create the folder in'
        },
        name: {
          type: 'string',
          description: 'Name of the folder'
        }
      },
      required: ['spaceId', 'name']
    },
    async (args: { spaceId: string; name: string }) => {
      const folder = await clickup.createFolder(args.spaceId, { name: args.name });
      return {
        success: true,
        data: folder,
        message: `Created folder "${args.name}" in space ${args.spaceId}`
      };
    }
  );
}
