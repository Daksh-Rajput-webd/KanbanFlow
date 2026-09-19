import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Column, Task } from '../../models/kanban.models';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px) scale(0.96)' }),
        animate('220ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class ColumnComponent {
  @Input() column!: Column;
  @Input() tasks: Task[] = [];
  @Input() connectedListIds: string[] = [];
  @Input() isCollapsed = false;

  @Output() addTask = new EventEmitter<void>();
  @Output() editTask = new EventEmitter<string>();
  @Output() deleteTask = new EventEmitter<string>();
  @Output() taskDropped = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() renameColumn = new EventEmitter<string>();
  @Output() deleteColumn = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  isRenaming = false;
  draftTitle = '';

  startRename(): void {
    this.draftTitle = this.column.title;
    this.isRenaming = true;
  }

  confirmRename(): void {
    if (this.draftTitle.trim()) {
      this.renameColumn.emit(this.draftTitle.trim());
    }
    this.isRenaming = false;
  }

  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }
}
