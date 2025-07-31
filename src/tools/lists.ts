import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

// Extended server interface
interface ExtendedServer extends Server {
  tools?: Map<string, Tool>;
  toolHandlers?: Map<string, (args: any) => Promise<any>>;
}

export function registerListTools(server: ExtendedServer, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_lists',
    'Get all lists in a folder',
    {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The folder ID to get lists for'
        }
      },
      required: ['folderId']
    },
    async (args: { folderId: string }) => {
      const lists = await clickup.getLists(args.folderId);
      return {
        success: true,
        data: lists,
        message: `Retrieved ${lists.length} lists for folder ${args.folderId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_get_folderless_lists',
    'Get all folderless lists in a space',
    {
      type: 'object',
      properties: {
        spaceId: {
          type: 'string',
          description: 'The space ID to get folderless lists for'
        }
      },
      required: ['spaceId']
    },
    async (args: { spaceId: string }) => {
      const lists = await clickup.getFolderlessLists(args.spaceId);
      return {
        success: true,
        data: lists,
        message: `Retrieved ${lists.length} folderless lists for space ${args.spaceId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_create_list',
    'Create a new list in a folder',
    {
      type: 'object',
      properties: {
        folderId: {
          type: 'string',
          description: 'The folder ID to create the list in'
        },
        name: {
          type: 'string',
          description: 'Name of the list'
        },
        content: {
          type: 'string',
          description: 'List description/content'
        },
        due_date: {
          type: 'number',
          description: 'Due date timestamp in milliseconds'
        },
        priority: {
          type: 'number',
          description: 'Priority level (1-4)'
        },
        assignee: {
          type: 'number',
          description: 'Assignee user ID'
        },
        status: {
          type: 'string',
          description: 'Initial status for the list'
        }
      },
      required: ['folderId', 'name']
    },
    async (args: {
      folderId: string;
      name: string;
      content?: string;
      due_date?: number;
      priority?: number;
      assignee?: number;
      status?: string;
    }) => {
      const list = await clickup.createList(args.folderId, {
        name: args.name,
        content: args.content,
        due_date: args.due_date,
        priority: args.priority,
        assignee: args.assignee,
        status: args.status
      });
      return {
        success: true,
        data: list,
        message: `Created list "${args.name}" in folder ${args.folderId}`
      };
    }
  );
}
