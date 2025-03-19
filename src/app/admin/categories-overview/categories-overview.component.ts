import { Component, inject } from '@angular/core';
import { combineLatest, filter, startWith, switchMap } from 'rxjs';
import { ItemsService } from '../../services/items.service';
import { Category } from '../../travler/travler.models';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-categories-overview',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './categories-overview.component.html',
  styleUrl: './categories-overview.component.scss',
})
export class CategoriesOverviewComponent {
  readonly dialog = inject(MatDialog);
  viewMode: 'grid' | 'table' = 'grid'; // Default view mode
  searchTerm = new FormControl('');
  displayedColumns: string[] = ['image', 'name', 'type'];

  categories: Category[] = [];
  filteredCategories: Category[] = [];

  constructor(private itemsService: ItemsService) {
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

  categoryImageChanged(file: File): void {
    console.log(file);
    const formData = new FormData();
    formData.set('file', file, file.name);
    console.log(formData);
  }

  categoryImageRemoved(): void {}

  addNewCategory(): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '70%',
      data: {
        uploadType: 'remote',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((a) => this.itemsService.createCategory(a.category, a.image))
      )
      .subscribe((a) => {
        console.log(a);
      });
  }

  editCategory(category: Category) {
    // Implement edit functionality
    console.log('Edit category:', category);
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '70%',
      data: {
        category,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((a) => this.itemsService.createCategory(a.category, a.image))
      )
      .subscribe((a) => {
        console.log(a);
      });
  }

  deleteCategory(category: Category) {
    this.itemsService.deleteCategory(category).subscribe((a) => {
      console.log(a);
    });
  }
}
