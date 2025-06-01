import { Component, inject } from '@angular/core';
import { combineLatest, delay, Observable, startWith, take } from 'rxjs';
import { ItemsService } from '../../services/items.service';
import { AddOn, Item } from '../../traveler/traveler.models';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { AddOnFormComponent } from '../add-on-form/add-on-form.component';
import { DeleteConfirmationModalComponent } from '../delete-confirmation-modal/delete-confirmation-modal.component';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { NoDataComponent } from '../../components/no-data/no-data.component';
import { NoResultsComponent } from '../../components/no-results/no-results.component';

@Component({
  selector: 'app-add-ons-overview',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PropertiesTranslationPipe,
    LanguageDirectionDirective,
    NoDataComponent,
    NoResultsComponent,
  ],
  templateUrl: './add-ons-overview.component.html',
  styleUrl: './add-ons-overview.component.scss',
})
export class AddOnsOverviewComponent {
  readonly dialog = inject(MatDialog);
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  searchTerm = new FormControl('');
  inStockFilter = new FormControl<boolean | null>(null);
  displayedColumns: string[] = ['name', 'inStock', 'actions'];
  addOns: AddOn[] = [];
  filteredAddOns: AddOn[] = [];
  dir: LanguageDirection = 'ltr';
  loadingData = false;
  viewMode: 'grid' | 'table' = 'grid';
  items: Item[] = [];

  constructor(
    private itemsService: ItemsService,
    private languageService: LanguageService
  ) {
    this.loadingData = true;
    this.lang$ = this.languageService.currentLanguage$;
    this.loadAddOns();

    combineLatest([
      this.inStockFilter.valueChanges.pipe(startWith(null)),
      this.searchTerm.valueChanges.pipe(startWith('')),
    ]).subscribe(([inStock, term]) => {
      this.filterAddOns(term || '', inStock);
    });
  }

  private loadAddOns(): void {
    combineLatest([
      this.itemsService.addOns$,
      this.itemsService.allItems$,
    ]).subscribe(([addOns, categories]) => {
      this.items = categories.map((category) => category.items).flat();
      const v = Array.from(addOns.values());
      this.addOns = v;
      this.filteredAddOns = v;
      this.loadingData = false;
    });
  }

  private filterAddOns(term: string, inStock: boolean | null): void {
    const value = term.toLowerCase();
    this.filteredAddOns = this.addOns.filter((addOn) => {
      let inStockFilter = true;

      if (inStock !== null) {
        inStockFilter = addOn.inStock === inStock;
      }

      return (
        (addOn.enName.toLowerCase().includes(value) ||
          addOn.esName.toLowerCase().includes(value) ||
          addOn.heName.toLowerCase().includes(value)) &&
        inStockFilter
      );
    });
  }

  addNewAddOn(): void {
    const dialogRef = this.dialog.open(AddOnFormComponent, {
      data: {
        cb: (addOn: AddOn) => this.itemsService.createAddOn(addOn),
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  editAddOn(addOn: AddOn): void {
    const dialogRef = this.dialog.open(AddOnFormComponent, {
      data: {
        addOn,
        cb: (addOn: AddOn) => this.itemsService.editAddOn(addOn),
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  deleteAddOn(addOn: AddOn): void {
    const usedAmund = this.items.reduce(
      (acc, currItem) =>
        currItem.availableAddOnUuids?.includes(addOn.uuid) ? ++acc : acc,
      0
    );

    const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
      autoFocus: false,
      data: {
        type: 'add-on',
        objectToDelete: addOn,
        usedAmund,
        cb: (addOn: AddOn) =>
          this.itemsService.deleteAddOn(addOn).pipe(delay(2000)),
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe();
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}
