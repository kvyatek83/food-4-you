import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { MenuIconComponent } from '../../components/menu-icon/menu-icon.component';

@Component({
  selector: 'app-dashboard',
  imports: [MaterialModule, MenuIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
