import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() addColumn = new EventEmitter<void>();
  @Output() openSettings = new EventEmitter<void>();

  onSearchInput(value: string): void {
    this.searchTermChange.emit(value);
  }
}
