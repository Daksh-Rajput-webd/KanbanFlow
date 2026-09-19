import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Output } from '@angular/core';
import { ThemeDefinition } from '../../models/kanban.models';
import { ThemeService } from '../../services/theme.service';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
  animations: [
    trigger('scrimAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('160ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('120ms ease-in', style({ opacity: 0 }))])
    ]),
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('240ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'none' }))
      ]),
      transition(':leave', [animate('200ms cubic-bezier(0.32, 0.72, 0, 1)', style({ transform: 'translateX(100%)' }))])
    ])
  ]
})
export class SettingsPanelComponent {
  @Output() close = new EventEmitter<void>();

  readonly themes: ThemeDefinition[] = this.themeService.themes;

  constructor(private readonly themeService: ThemeService, private readonly boardService: BoardService) {}

  get activeThemeId(): string {
    return this.themeService.activeTheme.id;
  }

  get motionEnabled(): boolean {
    return this.themeService.motionEnabled;
  }

  selectTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  toggleMotion(enabled: boolean): void {
    this.themeService.setMotionEnabled(enabled);
  }

  resetDemoData(): void {
    if (confirm('Reset the board to the demo dataset? This clears your current tasks.')) {
      this.boardService.resetToDemo();
    }
  }
}
