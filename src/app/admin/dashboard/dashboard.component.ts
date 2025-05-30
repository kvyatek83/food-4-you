import { Component } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { MenuIconComponent } from '../../components/menu-icon/menu-icon.component';
import { LanguagePickerComponent } from '../../components/language-picker/language-picker.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map, Observable, startWith } from 'rxjs';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { ItemsService } from '../../services/items.service';

interface DashboardMenuButton {
  titleKey: string;
  icon: string;
  route: string;
}

const TRANSLATE_KEY_PREFIX = 'dashboard.menu.buttons.titles';
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MaterialModule,
    MenuIconComponent,
    LanguagePickerComponent,
    RouterOutlet,
    TranslateModule,
    LanguageDirectionDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();
  public selectedMenuButton: DashboardMenuButton | undefined;
  public stickyLeft = false;

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private _: ItemsService
  ) {
    this.lang$ = this.languageService.currentLanguage$;
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        map((event: NavigationEnd) => event.urlAfterRedirects), // Using urlAfterRedirects for more accurate URL
        startWith(this.router.url) // Ensure initial URL is captured
      )
      .subscribe((currentUrl) => {
        this.selectedMenuButton = this.dashboardMenuButtons.find((button) =>
          currentUrl.includes(button.route)
        );
      });
  }

  dashboardMenuButtons: DashboardMenuButton[] = [
    {
      titleKey: `${TRANSLATE_KEY_PREFIX}.generalOverview`,
      icon: 'space_dashboard',
      route: 'general-overview',
    },
    {
      titleKey: `${TRANSLATE_KEY_PREFIX}.categoriesOverview`,
      icon: 'apps',
      route: 'categories-overview',
    },
    {
      titleKey: `${TRANSLATE_KEY_PREFIX}.itemsOverview`,
      icon: 'fastfood',
      route: 'items-overview',
    },
    {
      titleKey: `${TRANSLATE_KEY_PREFIX}.addOnsOverview`,
      icon: 'extension',
      route: 'add-ons-overview',
    },
    {
      titleKey: `${TRANSLATE_KEY_PREFIX}.ordersOverview`,
      icon: 'list_alt',
      route: 'orders-overview',
    },
    {
      titleKey: `${TRANSLATE_KEY_PREFIX}.scheduleOverview`,
      icon: 'calendar_month',
      route: 'schedule-overview',
    },
  ];

  isSidenavExpanded = false;

  toggleSidenav(_: boolean): void {
    this.isSidenavExpanded = !this.isSidenavExpanded;
  }

  menuButtonClicked(menuButton: DashboardMenuButton): void {
    if (menuButton.route !== this.selectedMenuButton?.route) {
      this.selectedMenuButton = menuButton;
      this.router.navigate([`/admin/${menuButton.route}`]);
    }
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.stickyLeft = languageDirection === 'ltr';
  }
}
