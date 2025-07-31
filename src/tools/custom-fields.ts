import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ClickUpAPI } from '../clickup-api.js';
import { registerTool } from './index.js';

export function registerCustomFieldTools(server: Server, clickup: ClickUpAPI): void {
  registerTool(
    server,
    'clickup_get_custom_fields',
    'Get all custom fields for a list',
    {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'The list ID to get custom fields for'
        }
      },
      required: ['listId']
    },
    async (args: { listId: string }) => {
      const fields = await clickup.getCustomFields(args.listId);
      return {
        success: true,
        data: fields,
        message: `Retrieved ${fields.length} custom fields for list ${args.listId}`
      };
    }
  );

  registerTool(
    server,
    'clickup_set_custom_field_value',
    'Set a custom field value on a task',
    {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The task ID to set custom field on'
        },
        fieldId: {
          type: 'string',
          description: 'The custom field ID'
        },
        value: {
          description: 'The value to set (type depends on field type)'
        }
      },
      required: ['taskId', 'fieldId', 'value']
    },
    async (args: { taskId: string; fieldId: string; value: any }) => {
      await clickup.setCustomFieldValue(args.taskId, args.fieldId, args.value);
      return {
        success: true,
        data: null,
        message: `Set custom field ${args.fieldId} on task ${args.taskId}`
      };
    }
  );
}
