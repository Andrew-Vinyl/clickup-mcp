import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

// Extended server interface
interface ExtendedServer extends Server {
  tools?: Map<string, Tool>;
  toolHandlers?: Map<string, (args: any) => Promise<any>>;
}

export function registerTeamTools(server: ExtendedServer, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_teams',
    'Get all teams for the authenticated user',
    {
      type: 'object',
      properties: {},
      required: []
    },
    async () => {
      const teams = await clickup.getTeams();
      return {
        success: true,
        data: teams,
        message: `Retrieved ${teams.length} teams`
      };
    }
  );
}
