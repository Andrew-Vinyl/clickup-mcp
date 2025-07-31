import axios, { AxiosInstance, AxiosResponse } from 'axios';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ClickUpTeam {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  members: ClickUpUser[];
}

export interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
}

export interface ClickUpSpace {
  id: string;
  name: string;
  color: string;
  private: boolean;
  statuses: ClickUpStatus[];
  multiple_assignees: boolean;
}

export interface ClickUpStatus {
  id: string;
  status: string;
  color: string;
  orderindex: number;
  type: string;
}

export interface ClickUpFolder {
  id: string;
  name: string;
  orderindex: number;
  override_statuses: boolean;
  hidden: boolean;
  space: {
    id: string;
    name: string;
  };
  task_count: string;
}

export interface ClickUpList {
  id: string;
  name: string;
  orderindex: number;
  status?: ClickUpStatus;
  priority?: ClickUpPriority;
  assignee?: ClickUpUser;
  task_count: number;
  due_date?: string;
  start_date?: string;
  folder: {
    id: string;
    name: string;
    hidden: boolean;
  };
  space: {
    id: string;
    name: string;
  };
  archived: boolean;
}

export interface ClickUpPriority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface ClickUpTask {
  id: string;
  custom_id?: string;
  name: string;
  text_content?: string;
  description?: string;
  status: ClickUpStatus;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed?: string;
  date_done?: string;
  archived: boolean;
  creator: ClickUpUser;
  assignees: ClickUpUser[];
  watchers: ClickUpUser[];
  checklists: any[];
  tags: any[];
  parent?: string;
  priority?: ClickUpPriority;
  due_date?: string;
  start_date?: string;
  points?: number;
  time_estimate?: number;
  time_spent?: number;
  custom_fields: any[];
  dependencies: any[];
  linked_tasks: any[];
  team_id: string;
  url: string;
  permission_level: string;
  list: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
    hidden: boolean;
  };
  folder: {
    id: string;
    name: string;
    hidden: boolean;
  };
  space: {
    id: string;
  };
}

export class ClickUpAPI {
  private client: AxiosInstance;
  private logLevel: LogLevel;

  constructor(token: string, logLevel: LogLevel = 'info') {
    this.logLevel = logLevel;
    
    this.client = axios.create({
      baseURL: 'https://api.clickup.com/api/v2',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.log('debug', `🔄 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.log('error', `❌ Request error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.log('debug', `✅ ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const status = error.response?.status || 'unknown';
        const message = error.response?.data?.err || error.message;
        this.log('error', `❌ ${status} ${error.config?.url}: ${message}`);
        return Promise.reject(error);
      }
    );
  }

  private log(level: LogLevel, message: string) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.logLevel] || 1;
    
    if (levels[level] >= currentLevel) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }

  // Teams
  async getTeams(): Promise<ClickUpTeam[]> {
    const response: AxiosResponse<{ teams: ClickUpTeam[] }> = await this.client.get('/team');
    return response.data.teams;
  }

  // Spaces
  async getSpaces(teamId: string): Promise<ClickUpSpace[]> {
    const response: AxiosResponse<{ spaces: ClickUpSpace[] }> = await this.client.get(`/team/${teamId}/space`);
    return response.data.spaces;
  }

  async createSpace(teamId: string, data: { name: string; multiple_assignees?: boolean; features?: any }): Promise<ClickUpSpace> {
    const response: AxiosResponse<ClickUpSpace> = await this.client.post(`/team/${teamId}/space`, data);
    return response.data;
  }

  // Folders
  async getFolders(spaceId: string): Promise<ClickUpFolder[]> {
    const response: AxiosResponse<{ folders: ClickUpFolder[] }> = await this.client.get(`/space/${spaceId}/folder`);
    return response.data.folders;
  }

  async createFolder(spaceId: string, data: { name: string }): Promise<ClickUpFolder> {
    const response: AxiosResponse<ClickUpFolder> = await this.client.post(`/space/${spaceId}/folder`, data);
    return response.data;
  }

  // Lists
  async getLists(folderId: string): Promise<ClickUpList[]> {
    const response: AxiosResponse<{ lists: ClickUpList[] }> = await this.client.get(`/folder/${folderId}/list`);
    return response.data.lists;
  }

  async getFolderlessLists(spaceId: string): Promise<ClickUpList[]> {
    const response: AxiosResponse<{ lists: ClickUpList[] }> = await this.client.get(`/space/${spaceId}/list`);
    return response.data.lists;
  }

  async createList(folderId: string, data: { name: string; content?: string; due_date?: number; priority?: number; assignee?: number; status?: string }): Promise<ClickUpList> {
    const response: AxiosResponse<ClickUpList> = await this.client.post(`/folder/${folderId}/list`, data);
    return response.data;
  }

  // Tasks
  async getTasks(listId: string, options?: {
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
    date_created_gt?: number;
    date_created_lt?: number;
    date_updated_gt?: number;
    date_updated_lt?: number;
    custom_fields?: any[];
  }): Promise<ClickUpTask[]> {
    const params = new URLSearchParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.set(key, String(value));
          }
        }
      });
    }

    const response: AxiosResponse<{ tasks: ClickUpTask[] }> = await this.client.get(`/list/${listId}/task?${params}`);
    return response.data.tasks;
  }

  async getTask(taskId: string, options?: {
    custom_task_ids?: boolean;
    team_id?: string;
    include_subtasks?: boolean;
  }): Promise<ClickUpTask> {
    const params = new URLSearchParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, String(value));
        }
      });
    }

    const response: AxiosResponse<ClickUpTask> = await this.client.get(`/task/${taskId}?${params}`);
    return response.data;
  }

  async createTask(listId: string, data: {
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
  }): Promise<ClickUpTask> {
    const response: AxiosResponse<ClickUpTask> = await this.client.post(`/list/${listId}/task`, data);
    return response.data;
  }

  async updateTask(taskId: string, data: {
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
    assignees?: {
      add?: number[];
      rem?: number[];
    };
    archived?: boolean;
  }): Promise<ClickUpTask> {
    const response: AxiosResponse<ClickUpTask> = await this.client.put(`/task/${taskId}`, data);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/task/${taskId}`);
  }

  // Comments
  async getTaskComments(taskId: string): Promise<any[]> {
    const response: AxiosResponse<{ comments: any[] }> = await this.client.get(`/task/${taskId}/comment`);
    return response.data.comments;
  }

  async createTaskComment(taskId: string, data: {
    comment_text: string;
    assignee?: number;
    notify_all?: boolean;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(`/task/${taskId}/comment`, data);
    return response.data;
  }

  // Custom Fields
  async getCustomFields(listId: string): Promise<any[]> {
    const response: AxiosResponse<{ fields: any[] }> = await this.client.get(`/list/${listId}/field`);
    return response.data.fields;
  }

  async setCustomFieldValue(taskId: string, fieldId: string, value: any): Promise<void> {
    await this.client.post(`/task/${taskId}/field/${fieldId}`, { value });
  }

  // Time Tracking
  async getTimeEntries(teamId: string, options?: {
    start_date?: number;
    end_date?: number;
    assignee?: number;
    include_task_tags?: boolean;
    include_location_names?: boolean;
    space_id?: string;
    folder_id?: string;
    list_id?: string;
    task_id?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, String(value));
        }
      });
    }

    const response: AxiosResponse<{ data: any[] }> = await this.client.get(`/team/${teamId}/time_entries?${params}`);
    return response.data.data;
  }

  async startTimeTracking(teamId: string, data: {
    tid: string;
    description?: string;
    tags?: any[];
    billable?: boolean;
  }): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(`/team/${teamId}/time_entries/start`, data);
    return response.data;
  }

  async stopTimeTracking(teamId: string): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post(`/team/${teamId}/time_entries/stop`);
    return response.data;
  }
}
