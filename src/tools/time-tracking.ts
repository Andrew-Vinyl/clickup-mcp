import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

export function registerTimeTrackingTools(server: Server, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_time_entries',
    'Get time entries for a team with optional filtering',
    {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'The team ID to get time entries for'
        },
        start_date: {
          type: 'number',
          description: 'Start date timestamp in milliseconds'
        },
        end_date: {
          type: 'number',
          description: 'End date timestamp in milliseconds'
        },
        assignee: {
          type: 'number',
          description: 'Filter by assignee user ID'
        },
        include_task_tags: {
          type: 'boolean',
          description: 'Include task tags in response'
        },
        include_location_names: {
          type: 'boolean',
          description: 'Include location names in response'
        },
        space_id: {
          type: 'string',
          description: 'Filter by space ID'
        },
        folder_id: {
          type: 'string',
          description: 'Filter by folder ID'
        },
        list_id: {
          type: 'string',
          description: 'Filter by list ID'
        },
        task_id: {
          type: 'string',
          description: 'Filter by task ID'
        }
      },
      required: ['teamId']
    },
    async (args: {
      teamId: string;
      start_date?: number;
      end_date?: number;
      assignee?: number;
      include_task_tags?: boolean;
      include_location_names?: boolean;
      space_id?: string;
      folder_id?: string;
      list_id?: string;
      task_id?: string;
    }) => {
      const entries = await clickup.getTimeEntries(args.teamId, {
        start_date: args.start_date,
        end_date: args.end_date,
        assignee: args.assignee,
        include_task_tags: args.include_task_tags,
        include_location_names: args.include_location_names,
        space_id: args.space_id,
        folder_id: args.folder_id,
        list_id: args.list_id,
        task_id: args.task_id
      });
      return {
        success: true,
        data: entries,
        message: `Retrieved ${entries.length} time entries for team ${args.teamId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_start_time_tracking',
    'Start time tracking for a task',
    {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'The team ID'
        },
        tid: {
          type: 'string',
          description: 'The task ID to track time for'
        },
        description: {
          type: 'string',
          description: 'Description for the time entry'
        },
        tags: {
          type: 'array',
          description: 'Tags for the time entry'
        },
        billable: {
          type: 'boolean',
          description: 'Whether the time is billable'
        }
      },
      required: ['teamId', 'tid']
    },
    async (args: {
      teamId: string;
      tid: string;
      description?: string;
      tags?: any[];
      billable?: boolean;
    }) => {
      const result = await clickup.startTimeTracking(args.teamId, {
        tid: args.tid,
        description: args.description,
        tags: args.tags,
        billable: args.billable
      });
      return {
        success: true,
        data: result,
        message: `Started time tracking for task ${args.tid}`
      };
    }
  );

  registerTool(
    server,
    'clickup_stop_time_tracking',
    'Stop time tracking for a team',
    {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'The team ID'
        }
      },
      required: ['teamId']
    },
    async (args: { teamId: string }) => {
      const result = await clickup.stopTimeTracking(args.teamId);
      return {
        success: true,
        data: result,
        message: `Stopped time tracking for team ${args.teamId}`
      };
    }
  );
}
