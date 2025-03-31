import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { combineLatest, map, Observable, of, startWith, tap } from 'rxjs';
import { MaterialModule } from '../../material.module';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { AddOn, Category, Item } from '../../travler/travler.models';
import { LoadFileComponent } from '../../components/load-file/load-file.component';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { TranslateModule } from '@ngx-translate/core';
import { ItemsService } from '../../services/items.service';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-item-form',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    LoadFileComponent,
    LanguageDirectionDirective,
    TranslateModule,
    PropertiesTranslationPipe,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
})
export class ItemFormComponent implements OnInit {
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();
  public itemForm!: FormGroup;
  public itemImage: File | undefined;
  public dir: LanguageDirection = 'ltr';
  public availableAddOns: AddOn[] = [];
  public categories: Category[] = [];

  public addOnCtrl = new FormControl();
  public filteredAddOns: Observable<AddOn[]> | undefined;
  cbPennding = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      item?: Item;
      categoryUuid?: string;
      cb: (data: { item: Item; image?: File }) => Observable<any>;
    },
    private dialogRef: MatDialogRef<ItemFormComponent>,
    private languageService: LanguageService,
    private itemsService: ItemsService,
    private fb: FormBuilder
  ) {
    this.lang$ = this.languageService.currentLanguage$;

    this.filteredAddOns = this.addOnCtrl.valueChanges.pipe(
      startWith(null),
      map((addOn: string | null) =>
        addOn
          ? this._filterAddOns(addOn)
          : this.availableAddOns
              .slice()
              .filter(
                (addOn) =>
                  !this.itemForm
                    .get('availableAddOnUuids')
                    ?.value?.includes(addOn.uuid)
              )
      )
    );
  }

  ngOnInit(): void {
    this.loadAddOns();
    this.initForm();
  }

  private loadAddOns(): void {
    combineLatest([
      this.itemsService.addOns$,
      this.itemsService.allItems$,
    ]).subscribe(([addOns, categories]) => {
      this.categories = categories;

      this.availableAddOns = Array.from(addOns.values());
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      const addOn = this.availableAddOns.find((addOn) => addOn.uuid === value);
      if (addOn) {
        this.itemForm.get('availableAddOnUuids')?.value?.push(addOn.uuid);
        this.addOnCtrl.setValue(null);
      }
    }
  }

  remove(addOnUuid: string): void {
    const selectedAddOns = this.itemForm.get('availableAddOnUuids')?.value;
    const index = selectedAddOns.indexOf(addOnUuid);

    if (index >= 0) {
      selectedAddOns.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const addOnUuid = event.option.value;
    if (!this.itemForm.get('availableAddOnUuids')?.value?.includes(addOnUuid)) {
      this.itemForm.get('availableAddOnUuids')?.value.push(addOnUuid);
    }
    this.addOnCtrl.setValue(null);
  }

  onSubmit(): void {
    if (
      this.itemForm.valid &&
      (this.itemForm.controls['imageUrl'].value || this.itemImage)
    ) {
      const formData = {
        item: this.itemForm.value,
        image: this.itemImage,
      };
      this.cbPennding = true;
      console.log(formData);

      this.dialogRef.disableClose = true;

      this.data
        .cb(formData)
        .pipe(tap(console.log))
        .subscribe(() => {
          this.dialogRef.close(true);
        });
    }
  }

  imageChanged(file: File): void {
    const formData = new FormData();
    formData.set('file', file, file.name);
    this.itemImage = file;
  }

  imageRemoved(): void {
    this.itemImage = undefined;
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }

  getAddOnName(uuid: string): AddOn | undefined {
    const addOn = this.availableAddOns.find((addOn) => addOn.uuid === uuid);
    return addOn;
  }

  private initForm(): void {
    console.log(this.data);

    this.itemForm = this.fb.group({
      uuid: [this.data.item?.uuid || ''],
      categoryId: [this.data.categoryUuid || '', Validators.required],
      enName: [this.data.item?.enName || '', Validators.required],
      heName: [this.data.item?.heName || '', Validators.required],
      esName: [this.data.item?.esName || '', Validators.required],
      enDetails: [this.data.item?.enDetails || '', Validators.required],
      heDetails: [this.data.item?.heDetails || '', Validators.required],
      esDetails: [this.data.item?.esDetails || '', Validators.required],
      imageUrl: [this.data.item?.imageUrl || ''],
      price: [
        this.data.item?.price || 0,
        [Validators.required, Validators.min(0)],
      ],
      availableAddOnUuids: [this.data.item?.availableAddOnUuids || []],
      addOnPrice: [this.data.item?.addOnPrice || 0],
      freeAvailableAddOns: [this.data.item?.freeAvailableAddOns || 0],
    });
  }

  private _filterAddOns(value: string): AddOn[] {
    const filterValue = value.toLowerCase();
    return this.availableAddOns.filter(
      (addOn) =>
        addOn.enName.toLowerCase().includes(filterValue) ||
        addOn.heName.toLowerCase().includes(filterValue) ||
        addOn.esName.toLowerCase().includes(filterValue)
    );
  }
}
