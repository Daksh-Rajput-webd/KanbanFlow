import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../models/kanban.models';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  get isOverdue(): boolean {
    if (!this.task.dueDate) {
      return false;
    }
    return new Date(this.task.dueDate) < new Date(new Date().toDateString());
  }
}
