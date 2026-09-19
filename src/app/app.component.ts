import { Component, HostBinding } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'KanbanFlow';

  constructor(private readonly themeService: ThemeService) {}

  // Angular's special `@.disabled` binding turns off all child animation triggers at once
  @HostBinding('@.disabled')
  get animationsDisabled(): boolean {
    return !this.themeService.motionEnabled;
  }
}
