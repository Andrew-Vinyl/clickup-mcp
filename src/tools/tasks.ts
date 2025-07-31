import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

// Extended server interface
interface ExtendedServer extends Server {
  tools?: Map<string, Tool>;
  toolHandlers?: Map<string, (args: any) => Promise<any>>;
}

export function registerTaskTools(server: ExtendedServer, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_tasks',
    'Get all tasks in a list with optional filtering',
    {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'The list ID to get tasks for'
        },
        archived: {
          type: 'boolean',
          description: 'Include archived tasks'
        },
        page: {
          type: 'number',
          description: 'Page number for pagination'
        },
        order_by: {
          type: 'string',
          description: 'Field to order by (created, updated, due_date)'
        },
        reverse: {
          type: 'boolean',
          description: 'Reverse the order'
        },
        subtasks: {
          type: 'boolean',
          description: 'Include subtasks'
        },
        statuses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by statuses'
        },
        include_closed: {
          type: 'boolean',
          description: 'Include closed tasks'
        },
        assignees: {
          type: 'array',
          items: { type: 'number' },
          description: 'Filter by assignee user IDs'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags'
        },
        due_date_gt: {
          type: 'number',
          description: 'Due date greater than (timestamp)'
        },
        due_date_lt: {
          type: 'number',
          description: 'Due date less than (timestamp)'
        }
      },
      required: ['listId']
    },
    async (args: {
      listId: string;
      archived?: boolean;
      page?: number;
      order_by?: string;
      reverse?: boolean;
      subtasks?: boolean;
      statuses?: string[];
      include_closed?: boolean;
      assignees?: number[];
      tags?: string[];
      due_date_gt?: number;
      due_date_lt?: number;
    }) => {
      const tasks = await clickup.getTasks(args.listId, args);
      return {
        success: true,
        data: tasks,
        message: `Retrieved ${tasks.length} tasks for list ${args.listId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_get_task',
    'Get a specific task by ID',
    {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The task ID to retrieve'
        },
        custom_task_ids: {
          type: 'boolean',
          description: 'Use custom task IDs'
        },
        team_id: {
          type: 'string',
          description: 'Team ID (required if using custom task IDs)'
        },
        include_subtasks: {
          type: 'boolean',
          description: 'Include subtasks in response'
        }
      },
      required: ['taskId']
    },
    async (args: {
      taskId: string;
      custom_task_ids?: boolean;
      team_id?: string;
      include_subtasks?: boolean;
    }) => {
      const task = await clickup.getTask(args.taskId, {
        custom_task_ids: args.custom_task_ids,
        team_id: args.team_id,
        include_subtasks: args.include_subtasks
      });
      return {
        success: true,
        data: task,
        message: `Retrieved task ${args.taskId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_create_task',
    'Create a new task in a list',
    {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'The list ID to create the task in'
        },
        name: {
          type: 'string',
          description: 'Task name'
        },
        description: {
          type: 'string',
          description: 'Task description'
        },
        assignees: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of assignee user IDs'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag names'
        },
        status: {
          type: 'string',
          description: 'Task status'
        },
        priority: {
          type: 'number',
          description: 'Priority level (1-4, where 1 is urgent)'
        },
        due_date: {
          type: 'number',
          description: 'Due date timestamp in milliseconds'
        },
        due_date_time: {
          type: 'boolean',
          description: 'Include time in due date'
        },
        time_estimate: {
          type: 'number',
          description: 'Time estimate in milliseconds'
        },
        start_date: {
          type: 'number',
          description: 'Start date timestamp in milliseconds'
        },
        start_date_time: {
          type: 'boolean',
          description: 'Include time in start date'
        },
        notify_all: {
          type: 'boolean',
          description: 'Notify all assignees'
        },
        parent: {
          type: 'string',
          description: 'Parent task ID (for subtasks)'
        },
        links_to: {
          type: 'string',
          description: 'Task ID to link to'
        },
        check_required_custom_fields: {
          type: 'boolean',
          description: 'Check required custom fields'
        },
        custom_fields: {
          type: 'array',
          description: 'Custom field values'
        }
      },
      required: ['listId', 'name']
    },
    async (args: {
      listId: string;
      name: string;
      description?: string;
      assignees?: number[];
      tags?: string[];
      status?: string;
      priority?: number;
      due_date?: number;
      due_date_time?: boolean;
      time_estimate?: number;
      start_date?: number;
      start_date_time?: boolean;
      notify_all?: boolean;
      parent?: string;
      links_to?: string;
      check_required_custom_fields?: boolean;
      custom_fields?: any[];
    }) => {
      const task = await clickup.createTask(args.listId, {
        name: args.name,
        description: args.description,
        assignees: args.assignees,
        tags: args.tags,
        status: args.status,
        priority: args.priority,
        due_date: args.due_date,
        due_date_time: args.due_date_time,
        time_estimate: args.time_estimate,
        start_date: args.start_date,
        start_date_time: args.start_date_time,
        notify_all: args.notify_all,
        parent: args.parent,
        links_to: args.links_to,
        check_required_custom_fields: args.check_required_custom_fields,
        custom_fields: args.custom_fields
      });
      return {
        success: true,
        data: task,
        message: `Created task "${args.name}" in list ${args.listId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_update_task',
    'Update an existing task',
    {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The task ID to update'
        },
        name: {
          type: 'string',
          description: 'Task name'
        },
        description: {
          type: 'string',
          description: 'Task description'
        },
        status: {
          type: 'string',
          description: 'Task status'
        },
        priority: {
          type: 'number',
          description: 'Priority level (1-4)'
        },
        due_date: {
          type: 'number',
          description: 'Due date timestamp in milliseconds'
        },
        due_date_time: {
          type: 'boolean',
          description: 'Include time in due date'
        },
        parent: {
          type: 'string',
          description: 'Parent task ID'
        },
        time_estimate: {
          type: 'number',
          description: 'Time estimate in milliseconds'
        },
        start_date: {
          type: 'number',
          description: 'Start date timestamp in milliseconds'
        },
        start_date_time: {
          type: 'boolean',
          description: 'Include time in start date'
        },
        assignees: {
          type: 'object',
          properties: {
            add: {
              type: 'array',
              items: { type: 'number' },
              description: 'User IDs to add as assignees'
            },
            rem: {
              type: 'array',
              items: { type: 'number' },
              description: 'User IDs to remove as assignees'
            }
          },
          description: 'Assignee changes'
        },
        archived: {
          type: 'boolean',
          description: 'Archive the task'
        }
      },
      required: ['taskId']
    },
    async (args: {
      taskId: string;
      name?: string;
      description?: string;
      status?: string;
      priority?: number;
      due_date?: number;
      due_date_time?: boolean;
      parent?: string;
      time_estimate?: number;
      start_date?: number;
      start_date_time?: boolean;
      assignees?: { add?: number[]; rem?: number[] };
      archived?: boolean;
    }) => {
      const task = await clickup.updateTask(args.taskId, {
        name: args.name,
        description: args.description,
        status: args.status,
        priority: args.priority,
        due_date: args.due_date,
        due_date_time: args.due_date_time,
        parent: args.parent,
        time_estimate: args.time_estimate,
        start_date: args.start_date,
        start_date_time: args.start_date_time,
        assignees: args.assignees,
        archived: args.archived
      });
      return {
        success: true,
        data: task,
        message: `Updated task ${args.taskId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_delete_task',
    'Delete a task',
    {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The task ID to delete'
        }
      },
      required: ['taskId']
    },
    async (args: { taskId: string }) => {
      await clickup.deleteTask(args.taskId);
      return {
        success: true,
        data: null,
        message: `Deleted task ${args.taskId}`
      };
    }
  );
}
