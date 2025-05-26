import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryComponent } from '../category/category.component';
import { Category } from '../traveler.models';
import { CommonModule } from '@angular/common';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { Observable } from 'rxjs';
import { LanguageService, LanguageType } from '../../services/lang.service';
import { ItemsService } from '../../services/items.service';

@Component({
  selector: 'app-menu',
  imports: [
    CommonModule,
    LanguageDirectionDirective,
    PropertiesTranslationPipe,
    TranslateModule,
    CategoryComponent,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements AfterViewInit {
  @ViewChild('menuWrapper') menuWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('topMenu') topMenu!: ElementRef<HTMLDivElement>;
  @ViewChild('bottomMenu') bottomMenu!: ElementRef<HTMLDivElement>;

  lang$: Observable<LanguageType> = new Observable<LanguageType>();

  categories: Category[] = [];
  isTopMenuNotInView: boolean = false;
  isBottomMenuNotInView: boolean = false;

  constructor(
    private itemsService: ItemsService,
    private languageService: LanguageService
  ) {
    this.itemsService.allItems$.pipe().subscribe((categories) => {
      this.categories = categories;
    });
  }

  ngOnInit(): void {
    this.lang$ = this.languageService.currentLanguage$;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkMenuVisibility();
    }, 100);
  }

  onScroll(_: Event) {
    this.checkMenuVisibility();
  }

  scrollToCategory(categoryUuid: string): void {
    const element = document.getElementById(categoryUuid);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.classList.add('heartbeat');
      setTimeout(() => {
        element.classList.remove('heartbeat');
      }, 2500);
    }
  }

  private checkMenuVisibility() {
    if (!this.menuWrapper || !this.topMenu || !this.bottomMenu) return;

    const wrapperRect = this.menuWrapper.nativeElement.getBoundingClientRect();
    const topMenuRect = this.topMenu.nativeElement.getBoundingClientRect();
    const bottomMenuRect =
      this.bottomMenu.nativeElement.getBoundingClientRect();

    this.isTopMenuNotInView =
      topMenuRect.bottom < wrapperRect.top || topMenuRect.top < wrapperRect.top;

    this.isBottomMenuNotInView =
      bottomMenuRect.top > wrapperRect.bottom ||
      bottomMenuRect.bottom > wrapperRect.bottom;
  }
}
