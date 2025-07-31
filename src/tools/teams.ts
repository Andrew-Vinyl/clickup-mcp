import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

export function registerTeamTools(server: Server, clickup: ClickUpAPI): void {
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
