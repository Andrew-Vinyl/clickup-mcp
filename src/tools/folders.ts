import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

export function registerFolderTools(server: Server, clickup: ClickUpAPI): void {
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
