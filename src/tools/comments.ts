import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

// Extended server interface
interface ExtendedServer extends Server {
  tools?: Map<string, Tool>;
  toolHandlers?: Map<string, (args: any) => Promise<any>>;
}

export function registerCommentTools(server: ExtendedServer, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_task_comments',
    'Get all comments for a task',
    {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The task ID to get comments for'
        }
      },
      required: ['taskId']
    },
    async (args: { taskId: string }) => {
      const comments = await clickup.getTaskComments(args.taskId);
      return {
        success: true,
        data: comments,
        message: `Retrieved ${comments.length} comments for task ${args.taskId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_create_task_comment',
    'Create a new comment on a task',
    {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The task ID to comment on'
        },
        comment_text: {
          type: 'string',
          description: 'The comment text'
        },
        assignee: {
          type: 'number',
          description: 'User ID to assign the comment to'
        },
        notify_all: {
          type: 'boolean',
          description: 'Notify all task watchers'
        }
      },
      required: ['taskId', 'comment_text']
    },
    async (args: {
      taskId: string;
      comment_text: string;
      assignee?: number;
      notify_all?: boolean;
    }) => {
      const comment = await clickup.createTaskComment(args.taskId, {
        comment_text: args.comment_text,
        assignee: args.assignee,
        notify_all: args.notify_all
      });
      return {
        success: true,
        data: comment,
        message: `Created comment on task ${args.taskId}`
      };
    }
  );
}
