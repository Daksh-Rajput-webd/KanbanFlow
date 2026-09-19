import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Priority, Task } from '../../models/kanban.models';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
  animations: [
    trigger('overlayAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('160ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('120ms ease-in', style({ opacity: 0 }))])
    ]),
    trigger('panelAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px) scale(0.96)' }),
        animate('220ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [animate('140ms ease-in', style({ opacity: 0, transform: 'translateY(10px) scale(0.97)' }))])
    ])
  ]
})
export class TaskModalComponent implements OnChanges {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<Omit<Task, 'id' | 'createdAt'>>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  title = '';
  description = '';
  priority: Priority = 'medium';
  labelsText = '';
  dueDate = '';

  get isEditing(): boolean {
    return !!this.task;
  }

  ngOnChanges(): void {
    this.title = this.task?.title ?? '';
    this.description = this.task?.description ?? '';
    this.priority = this.task?.priority ?? 'medium';
    this.labelsText = this.task?.labels?.join(', ') ?? '';
    this.dueDate = this.task?.dueDate ?? '';
  }

  submit(): void {
    if (!this.title.trim()) {
      return;
    }
    this.save.emit({
      title: this.title.trim(),
      description: this.description.trim(),
      priority: this.priority,
      labels: this.labelsText
        .split(',')
        .map(l => l.trim())
        .filter(Boolean),
      dueDate: this.dueDate || undefined
    });
  }
}
