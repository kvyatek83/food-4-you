import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'menu-icon',
  imports: [],
  templateUrl: './menu-icon.component.html',
  styleUrl: './menu-icon.component.scss',
})
export class MenuIconComponent {
  @Output() menuStateChanged = new EventEmitter<boolean>();

  menuOpen = false;

  toggleMenuOpen(): void {
    this.menuOpen = !this.menuOpen;
    this.menuStateChanged.emit(this.menuOpen);
  }
}
