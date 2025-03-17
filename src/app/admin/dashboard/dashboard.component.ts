import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { MenuIconComponent } from '../../components/menu-icon/menu-icon.component';
import { LanguagePickerComponent } from '../../components/language-picker/language-picker.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface DashboardMenuButton {
  titleKey: string;
  icon: string;
  route: string;
}

const A = 'dashboard.menu.buttons.titles';
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MaterialModule,
    MenuIconComponent,
    // LanguagePickerComponent,
    RouterOutlet,
    TranslateModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  dashboardMenuButtons: DashboardMenuButton[] = [
    {
      titleKey: `${A}.generalOverview`,
      icon: 'space_dashboard',
      route: 'general',
    },
    {
      titleKey: `${A}.categoriesOverview`,
      icon: 'apps',
      route: 'categories',
    },
    {
      titleKey: `${A}.itemsOverview`,
      icon: 'fastfood',
      route: 'items',
    },
    {
      titleKey: `${A}.addOnsOverview`,
      icon: 'extension',
      route: 'add-ons',
    },
    {
      titleKey: `${A}.ordersOverview`,
      icon: 'list_alt',
      route: 'orders',
    },
    {
      titleKey: `${A}.scheduleOverview`,
      icon: 'calendar_month',
      route: 'schedule',
    },
  ];

  isSidenavExpanded = false;

  toggleSidenav(collapsed: boolean) {
    this.isSidenavExpanded = !this.isSidenavExpanded;
  }

  // toggleSidenav(sidenav: any) {
  //   if (sidenav.opened) {
  //     this.isSidenavExpanded = !this.isSidenavExpanded;
  //   } else {
  //     sidenav.open();
  //     this.isSidenavExpanded = true;
  //   }
  // }
}
