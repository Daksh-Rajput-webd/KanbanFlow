import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BoardState, Column, Task, Priority } from '../models/kanban.models';

const STORAGE_KEY = 'kanbanflow_board';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function seedBoard(): BoardState {
  const tasks: Record<string, Task> = {};
  const makeTask = (title: string, priority: Priority, labels: string[], description = '', dueDate?: string): Task => {
    const task: Task = { id: uid(), title, priority, labels, description, dueDate, createdAt: Date.now() };
    tasks[task.id] = task;
    return task;
  };

  const backlog = [
    makeTask('Design onboarding flow', 'medium', ['Design'], 'Sketch the first-run experience for new users.'),
    makeTask('Research competitor boards', 'low', ['Research']),
    makeTask('Set up analytics events', 'low', ['Engineering'])
  ];
  const inProgress = [
    makeTask('Build drag-and-drop columns', 'high', ['Engineering'], 'Implement CDK drag/drop across columns.', daysFromNow(2)),
    makeTask('Theme switcher UI', 'medium', ['Design', 'Engineering'], 'Add a settings panel with live theme previews.')
  ];
  const review = [
    makeTask('Card animation polish', 'medium', ['Design'], 'Smooth enter/leave transitions for cards.', daysFromNow(1))
  ];
  const done = [
    makeTask('Project kickoff', 'low', ['Planning']),
    makeTask('Repo & CI scaffolding', 'low', ['Engineering'])
  ];

  const columns: Column[] = [
    { id: uid(), title: 'Backlog', taskIds: backlog.map(t => t.id) },
    { id: uid(), title: 'In Progress', taskIds: inProgress.map(t => t.id) },
    { id: uid(), title: 'Review', taskIds: review.map(t => t.id) },
    { id: uid(), title: 'Done', taskIds: done.map(t => t.id) }
  ];

  return { columns, tasks };
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly stateSubject = new BehaviorSubject<BoardState>(this.restore());
  readonly state$ = this.stateSubject.asObservable();

  get state(): BoardState {
    return this.stateSubject.value;
  }

  addColumn(title: string): void {
    const column: Column = { id: uid(), title: title.trim() || 'Untitled', taskIds: [] };
    this.update(state => ({ ...state, columns: [...state.columns, column] }));
  }

  renameColumn(columnId: string, title: string): void {
    this.update(state => ({
      ...state,
      columns: state.columns.map(c => (c.id === columnId ? { ...c, title: title.trim() || c.title } : c))
    }));
  }

  deleteColumn(columnId: string): void {
    this.update(state => {
      const column = state.columns.find(c => c.id === columnId);
      const tasks = { ...state.tasks };
      column?.taskIds.forEach(id => delete tasks[id]);
      return { columns: state.columns.filter(c => c.id !== columnId), tasks };
    });
  }

  moveColumn(fromIndex: number, toIndex: number): void {
    this.update(state => {
      const columns = [...state.columns];
      const [moved] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, moved);
      return { ...state, columns };
    });
  }

  addTask(columnId: string, task: Omit<Task, 'id' | 'createdAt'>): void {
    const newTask: Task = { ...task, id: uid(), createdAt: Date.now() };
    this.update(state => ({
      tasks: { ...state.tasks, [newTask.id]: newTask },
      columns: state.columns.map(c => (c.id === columnId ? { ...c, taskIds: [...c.taskIds, newTask.id] } : c))
    }));
  }

  updateTask(taskId: string, changes: Partial<Task>): void {
    this.update(state => ({
      ...state,
      tasks: { ...state.tasks, [taskId]: { ...state.tasks[taskId], ...changes } }
    }));
  }

  deleteTask(taskId: string): void {
    this.update(state => {
      const tasks = { ...state.tasks };
      delete tasks[taskId];
      return {
        tasks,
        columns: state.columns.map(c => ({ ...c, taskIds: c.taskIds.filter(id => id !== taskId) }))
      };
    });
  }

  moveTask(taskId: string, fromColumnId: string, toColumnId: string, toIndex: number): void {
    this.update(state => {
      const columns = state.columns.map(c => {
        if (c.id === fromColumnId && c.id === toColumnId) {
          const taskIds = c.taskIds.filter(id => id !== taskId);
          taskIds.splice(toIndex, 0, taskId);
          return { ...c, taskIds };
        }
        if (c.id === fromColumnId) {
          return { ...c, taskIds: c.taskIds.filter(id => id !== taskId) };
        }
        if (c.id === toColumnId) {
          const taskIds = [...c.taskIds];
          taskIds.splice(toIndex, 0, taskId);
          return { ...c, taskIds };
        }
        return c;
      });
      return { ...state, columns };
    });
  }

  resetToDemo(): void {
    this.setState(seedBoard());
  }

  private update(fn: (state: BoardState) => BoardState): void {
    this.setState(fn(this.stateSubject.value));
  }

  private setState(state: BoardState): void {
    this.stateSubject.next(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private restore(): BoardState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return seedBoard();
    }
    try {
      const parsed = JSON.parse(raw) as BoardState;
      if (!parsed.columns || !parsed.tasks) {
        return seedBoard();
      }
      return parsed;
    } catch {
      return seedBoard();
    }
  }
}
