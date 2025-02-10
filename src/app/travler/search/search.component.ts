import { Component, OnInit, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { Category, Item } from '../travler.models';
import { ItemsService } from '../../services/items.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PropertiesTranslationPipe,
    LanguageDirectionDirective,
    TranslateModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  @ViewChildren('seatchInput') seatchInput: any;

  allItems: Category[] = [];

  searchControl = new FormControl('');
  filteredCategories: Category[] = [];
  filteredItems: Item[] = [];
  showSuggestions = false;

  stickyLeft = false;

  public lang$: Observable<LanguageType> | undefined;

  constructor(
    private languageService: LanguageService,
    private itemsService: ItemsService
  ) {}

  ngOnInit() {
    this.lang$ = this.languageService.currentLanguage$;

    this.itemsService.allItems$.pipe().subscribe((items) => {
      this.allItems = items;
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        if (searchTerm) {
          this.filterResults(searchTerm);
        } else {
          this.clearResults();
        }
      });
  }

  filterResults(searchTerm: string) {
    searchTerm = searchTerm.toLowerCase();

    this.filteredCategories = this.allItems.filter(
      (category) =>
        category.enName.toLowerCase().includes(searchTerm) ||
        category.heName.toLowerCase().includes(searchTerm) ||
        category.esName.toLowerCase().includes(searchTerm)
    );

    this.filteredItems = this.allItems
      .flatMap((category) => category.items)
      .filter(
        (item) =>
          item.enName.toLowerCase().includes(searchTerm) ||
          item.heName.toLowerCase().includes(searchTerm) ||
          item.esName.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5);
  }

  clearResults() {
    this.filteredCategories = [];
    this.filteredItems = [];
  }

  toggleSearch(): void {
    if (!this.showSuggestions) {
      this.seatchInput?.first?.nativeElement?.focus();
    } else {
      this.clearResults();
      this.searchControl.setValue('');
      this.onBlur();
    }
  }

  onFocus() {
    this.showSuggestions = true;
  }

  onBlur() {
    if (!this.searchControl.value) {
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    }
  }

  scrollToResult(uuid: string) {
    const element = document.getElementById(uuid);
    if (element) {
      element.scrollIntoView({ block: 'start', behavior: 'smooth' });

      element.classList.add('heartbeat');
      setTimeout(() => {
        element.classList.remove('heartbeat');
      }, 2500);
    }
    this.clearResults();
    this.searchControl.setValue('');
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.stickyLeft = languageDirection === 'rtl';
  }
}
