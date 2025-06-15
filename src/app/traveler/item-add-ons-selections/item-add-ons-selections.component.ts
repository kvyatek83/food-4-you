import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AddOn, Item } from '../traveler.models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ItemsService } from '../../services/items.service';
import { FormsModule } from '@angular/forms';
import { LanguageService, LanguageType } from '../../services/lang.service';
import { Observable } from 'rxjs';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { TranslateModule } from '@ngx-translate/core';

interface CheckboxState {
  selected: boolean;
}
type ModalAddOn = CheckboxState & AddOn;

@Component({
  selector: 'app-item-add-ons-selections',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    LanguageDirectionDirective,
    PropertiesTranslationPipe,
    TranslateModule,
  ],
  templateUrl: './item-add-ons-selections.component.html',
  styleUrls: ['./item-add-ons-selections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemAddOnsSelectionsComponent {
  public lang$: Observable<LanguageType> | undefined;
  public availableAddOns: ModalAddOn[] = [];
  public selectedAddOnUuids: string[] = [];
  public pricePerAddOn: number | undefined;
  public freeAvailableAddOns: number | undefined;
  public selectedFreeAddOnUuids: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<Item>,
    private languageService: LanguageService,
    private itemsService: ItemsService,
    private dialogRef: MatDialogRef<ItemAddOnsSelectionsComponent>
  ) {
    this.lang$ = this.languageService.currentLanguage$;

    this.pricePerAddOn = data?.addOnPrice;
    this.freeAvailableAddOns = data?.freeAvailableAddOns;
    this.availableAddOns = (data.availableAddOnUuids as string[])
      .map((addOnUuid) => this.itemsService.getAddOnByUuid(addOnUuid))
      .filter((addOn) => !!addOn)
      .map((addOn) => ({
        selected: false,
        ...addOn,
      }));
  }

  shouldShowPrice(addOn: ModalAddOn, index: number): boolean {
    // Show price if pricePerAddOn is defined (even if 0)
    if (this.pricePerAddOn == null) return false;
    // If no free add-ons, always show price
    if (this.freeAvailableAddOns === 0) return true;
    if (this.freeAvailableAddOns == null) return false;
    // Get all selected add-ons
    const selected = this.availableAddOns.filter(addOn => addOn.selected);
    // If there are more selected than free, show price for the ones above the free limit
    if (selected.length > this.freeAvailableAddOns) {
      // Show price for this add-on if it's selected and its index is after the free ones
      const selectedIndexes = this.availableAddOns
        .map((addOn, index) => addOn.selected ? index : -1)
        .filter(i => i !== -1);
      const paidIndexes = selectedIndexes.slice(this.freeAvailableAddOns);
      if (paidIndexes.includes(index)) return true;
    }
    // If not selected, and all free are taken, show price
    if (!addOn.selected && selected.length >= this.freeAvailableAddOns) {
      return true;
    }
    return false;
  }

  onCheckboxChange(addOn: ModalAddOn) {
    this.selectedAddOnUuids = this.availableAddOns.filter(a => a.selected).map(a => a.uuid);
  }

  onSave() {
    this.dialogRef.close(this.selectedAddOnUuids);
  }
}
