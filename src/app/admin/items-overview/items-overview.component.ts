import { Component, inject } from '@angular/core';
import { combineLatest, delay, Observable, startWith, take } from 'rxjs';
import { ItemsService } from '../../services/items.service';
import { Category, Item } from '../../travler/travler.models';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ItemFormComponent } from '../item-form/item-form.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';

@Component({
  selector: 'app-items-overview',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PropertiesTranslationPipe,
    LanguageDirectionDirective,
  ],
  templateUrl: './items-overview.component.html',
  styleUrl: './items-overview.component.scss',
})
export class ItemsOverviewComponent {
  readonly dialog = inject(MatDialog);
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  viewMode: 'grid' | 'table' = 'grid';
  searchTerm = new FormControl('');
  selectedCategory = new FormControl<Category | null>(null);

  displayedColumns: string[] = [
    'name',
    'price',
    'addOns',
    'addOnPrice',
    'freeAddOnAllowed',
    'image',
    'actions',
  ];

  items: Item[] = [];
  categories: Category[] = [];
  filteredItems: Item[] = [];
  dir: LanguageDirection = 'ltr';

  constructor(
    private itemsService: ItemsService,
    private languageService: LanguageService
  ) {
    this.lang$ = this.languageService.currentLanguage$;
    this.itemsService.allItems$.subscribe((categories) => {
      this.categories = categories;
      this.items = categories.map((category) => category.items).flat();
      this.filteredItems = categories.map((category) => category.items).flat();
    });

    combineLatest([
      this.selectedCategory.valueChanges.pipe(startWith(null)),
      this.searchTerm.valueChanges.pipe(startWith('')),
    ]).subscribe(([selectedCategory, term]) => {
      const value = term?.toLowerCase() || '';
      if (!selectedCategory) {
        this.filteredItems = this.items.filter((item) => {
          return (
            item.enName.toLowerCase().includes(value) ||
            item.esName.toLowerCase().includes(value) ||
            item.heName.toLowerCase().includes(value)
          );
        });
      } else {
        this.filteredItems = this.categories
          .filter(
            (currentCategory) => currentCategory.uuid === selectedCategory.uuid
          )
          .map((category) => category.items)
          .flat()
          .filter((item) => {
            return (
              item.enName.toLowerCase().includes(value) ||
              item.esName.toLowerCase().includes(value) ||
              item.heName.toLowerCase().includes(value)
            );
          });
      }
    });
  }

  addNewItem(): void {
    const dialogRef = this.dialog.open(ItemFormComponent, {
      width: '90%',
      data: {
        cb: (data: { item: Item; image: File }) =>
          this.itemsService.createItem(data.item, data.image),
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  editItem(item: Item) {
    const categoryUuid = this.categories.find((cat) =>
      cat.items.some((ite) => ite.uuid === item.uuid)
    )?.uuid;
    const dialogRef = this.dialog.open(ItemFormComponent, {
      width: '90%',
      data: {
        item,
        categoryUuid,
        cb: (data: { item: Item; image: File }) =>
          this.itemsService.editItem(data.item, data.image),
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  deleteItem(item: Item) {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      autoFocus: false,
      data: {
        type: 'item',
        cb: (item: Item) =>
          this.itemsService.deleteItem(item).pipe(delay(2000)),
        objectToDelete: item,
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}
