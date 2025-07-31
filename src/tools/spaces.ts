import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

export function registerSpaceTools(server: Server, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_spaces',
    'Get all spaces for a team',
    {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'The team ID to get spaces for'
        }
      },
      required: ['teamId']
    },
    async (args: { teamId: string }) => {
      const spaces = await clickup.getSpaces(args.teamId);
      return {
        success: true,
        data: spaces,
        message: `Retrieved ${spaces.length} spaces for team ${args.teamId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_create_space',
    'Create a new space in a team',
    {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'The team ID to create the space in'
        },
        name: {
          type: 'string',
          description: 'Name of the space'
        },
        multiple_assignees: {
          type: 'boolean',
          description: 'Allow multiple assignees on tasks (default: true)'
        },
        features: {
          type: 'object',
          description: 'Space features configuration'
        }
      },
      required: ['teamId', 'name']
    },
    async (args: { teamId: string; name: string; multiple_assignees?: boolean; features?: any }) => {
      const space = await clickup.createSpace(args.teamId, {
        name: args.name,
        multiple_assignees: args.multiple_assignees ?? true,
        features: args.features
      });
      return {
        success: true,
        data: space,
        message: `Created space "${args.name}" in team ${args.teamId}`
      };
    }
  );
}
