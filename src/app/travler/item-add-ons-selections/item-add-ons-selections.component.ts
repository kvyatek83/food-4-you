import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AddOn, Item } from '../travler.models';
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

    console.log(data);

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

  onCheckboxChange(addOn: ModalAddOn) {
    if (addOn.selected) {
      this.selectedAddOnUuids.push(addOn.uuid);
      // TODO: display current cost
      // if (
      //   this.selectedFreeAddOnUuids.length !== this.freeAvailableAddOns &&
      //   !this.selectedFreeAddOnUuids.includes(addOn.uuid)
      // ) {
      //   this.selectedFreeAddOnUuids.push(addOn.uuid);
      // }
    } else {
      const index = this.selectedAddOnUuids.indexOf(addOn.uuid);
      if (index >= 0) {
        this.selectedAddOnUuids.splice(index, 1);
      }
    }
  }

  onSave() {
    this.dialogRef.close(this.selectedAddOnUuids);
  }
}
