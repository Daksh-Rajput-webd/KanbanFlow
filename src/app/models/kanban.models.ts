export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  labels: string[];
  dueDate?: string;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface BoardState {
  columns: Column[];
  tasks: Record<string, Task>;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  isDark: boolean;
  swatch: [string, string, string];
  vars: Record<string, string>;
}
