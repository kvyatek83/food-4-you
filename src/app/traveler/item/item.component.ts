import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Item } from '../traveler.models';
import { Observable } from 'rxjs';
import { LanguageService, LanguageType } from '../../services/lang.service';
import { CommonModule } from '@angular/common';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { MaterialModule } from '../../material.module';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { CartService } from '../../services/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { ItemsSummaryModalComponent } from '../items-summary-modal/items-summary-modal.component';
import { ItemAddOnsSelectionsComponent } from '../item-add-ons-selections/item-add-ons-selections.component';

@Component({
  selector: 'app-item',
  imports: [
    CommonModule,
    MaterialModule,
    LanguageDirectionDirective,
    PropertiesTranslationPipe,
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent implements OnInit {
  @Input() item: Item | undefined;

  readonly dialog = inject(MatDialog);

  public lang$: Observable<LanguageType> | undefined;
  public itemCounter$: Observable<number> | undefined;

  constructor(
    private languageService: LanguageService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.lang$ = this.languageService.currentLanguage$;
    this.itemCounter$ = this.cartService.getItemCount(this.item?.uuid || '');
  }

  addItemToCart(item?: Item): void {
    if (item?.availableAddOnUuids && item.availableAddOnUuids.length) {
      const dialogRef = this.dialog.open(ItemAddOnsSelectionsComponent, {
        // width: '80%',
        data: {
          availableAddOnUuids: item?.availableAddOnUuids,
          addOnPrice: item?.addOnPrice,
          freeAvailableAddOns: item?.freeAvailableAddOns,
        },
      });

      dialogRef.afterClosed().subscribe((selectedAddOnUuids?: string[]) => {
        if (selectedAddOnUuids) {
          // Handle the selected add-ons UUIDs
          console.log('Selected Add-Ons:', selectedAddOnUuids);
          this.cartService.addItem(item, selectedAddOnUuids);
        }
      });
    } else if (item) {
      this.cartService.addItem(item);
    }
  }

  showSelectedItems() {
    if (!this.item) {
      return;
    }
    const itemUuid = this.item.uuid;

    const cartItem = this.cartService.getCartItem(itemUuid);
    if (cartItem) {
      const dialogRef = this.dialog.open(ItemsSummaryModalComponent, {
        width: '80%',
        data: cartItem,
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log(`Dialog result: ${result}`);
      });
    }
  }
}
