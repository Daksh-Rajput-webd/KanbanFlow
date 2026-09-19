import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { BoardService } from '../../services/board.service';
import { Column, Task } from '../../models/kanban.models';

interface ColumnView {
  column: Column;
  tasks: Task[];
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {
  isSettingsOpen = false;
  isModalOpen = false;
  editingTask: Task | null = null;
  targetColumnId = '';
  collapsedColumns = new Set<string>();

  private readonly searchTermSubject = new BehaviorSubject<string>('');

  readonly columnViews$: Observable<ColumnView[]>;

  constructor(private readonly boardService: BoardService) {
    this.columnViews$ = combineLatest([this.boardService.state$, this.searchTermSubject]).pipe(
      map(([state, term]) =>
        state.columns.map(column => ({
          column,
          tasks: this.filterTasks(column.taskIds.map(id => state.tasks[id]).filter(Boolean), term)
        }))
      )
    );
  }

  get searchTerm(): string {
    return this.searchTermSubject.value;
  }

  set searchTerm(value: string) {
    this.searchTermSubject.next(value);
  }

  get columnIds(): string[] {
    return this.boardService.state.columns.map(c => c.id);
  }

  trackByColumnId(_index: number, view: ColumnView): string {
    return view.column.id;
  }

  private filterTasks(tasks: Task[], term: string): Task[] {
    const q = term.trim().toLowerCase();
    if (!q) {
      return tasks;
    }
    return tasks.filter(t => t.title.toLowerCase().includes(q) || t.labels?.some(l => l.toLowerCase().includes(q)));
  }

  onTaskDropped(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    const fromColumnId = event.previousContainer.id;
    const toColumnId = event.container.id;
    this.boardService.moveTask(task.id, fromColumnId, toColumnId, event.currentIndex);
  }

  onColumnDropped(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    this.boardService.moveColumn(event.previousIndex, event.currentIndex);
  }

  addColumn(): void {
    const title = prompt('New column name:', 'New Column');
    if (title) {
      this.boardService.addColumn(title);
    }
  }

  renameColumn(columnId: string, title: string): void {
    this.boardService.renameColumn(columnId, title);
  }

  deleteColumn(columnId: string): void {
    if (confirm('Delete this column and all its tasks?')) {
      this.boardService.deleteColumn(columnId);
    }
  }

  toggleCollapse(columnId: string): void {
    if (this.collapsedColumns.has(columnId)) {
      this.collapsedColumns.delete(columnId);
    } else {
      this.collapsedColumns.add(columnId);
    }
  }

  openAddTaskModal(columnId: string): void {
    this.targetColumnId = columnId;
    this.editingTask = null;
    this.isModalOpen = true;
  }

  openEditTaskModal(columnId: string, taskId: string): void {
    this.targetColumnId = columnId;
    this.editingTask = this.boardService.state.tasks[taskId] ?? null;
    this.isModalOpen = true;
  }

  deleteTask(taskId: string): void {
    this.boardService.deleteTask(taskId);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingTask = null;
  }

  saveTask(payload: Omit<Task, 'id' | 'createdAt'>): void {
    if (this.editingTask) {
      this.boardService.updateTask(this.editingTask.id, payload);
    } else {
      this.boardService.addTask(this.targetColumnId, payload);
    }
    this.closeModal();
  }

  deleteFromModal(): void {
    if (this.editingTask) {
      this.boardService.deleteTask(this.editingTask.id);
    }
    this.closeModal();
  }
}
