import { Component, inject } from '@angular/core';
import { delay, filter, Observable, take } from 'rxjs';
import { ItemsService } from '../../services/items.service';
import { Category } from '../../travler/travler.models';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';

@Component({
  selector: 'app-categories-overview',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PropertiesTranslationPipe,
    LanguageDirectionDirective,
  ],
  templateUrl: './categories-overview.component.html',
  styleUrl: './categories-overview.component.scss',
})
export class CategoriesOverviewComponent {
  readonly dialog = inject(MatDialog);
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  viewMode: 'grid' | 'table' = 'grid';
  searchTerm = new FormControl('');
  displayedColumns: string[] = ['name', 'items', 'image', 'actions'];

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  dir: LanguageDirection = 'ltr';

  constructor(
    private itemsService: ItemsService,
    private languageService: LanguageService
  ) {
    this.lang$ = this.languageService.currentLanguage$;
    this.itemsService.allItems$.subscribe((categories) => {
      this.categories = categories;
      this.filteredCategories = categories;
    });

    this.searchTerm.valueChanges
      .pipe(filter((term) => term !== null))
      .subscribe((term) => {
        this.filteredCategories = this.categories.filter((category) => {
          console.log(term);

          const value = term.toLowerCase();
          return (
            category.enName.toLowerCase().includes(value) ||
            category.esName.toLowerCase().includes(value) ||
            category.heName.toLowerCase().includes(value)
          );
        });
      });
  }

  addNewCategory(): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      data: {
        cb: (data: { category: Category; image: File }) =>
          this.itemsService.createCategory(data.category, data.image),
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  editCategory(category: Category) {
    console.log('Edit category:', category);
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      data: {
        category,
        cb: (data: { category: Category; image?: File }) =>
          this.itemsService
            .editCategory(data.category, data.image)
            .pipe(delay(2000)),
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  deleteCategory(category: Category) {
    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      autoFocus: false,
      data: {
        type: 'category',
        cb: (category: Category) =>
          this.itemsService.deleteCategory(category).pipe(delay(2000)),
        objectToDelete: category,
        usedAmund: category.items.length,
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}
