import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { Observable } from 'rxjs';
import { LanguageType, LanguageService } from '../../services/lang.service';
import { TranslateModule } from '@ngx-translate/core';
import { AddOnUuidsToAddOnsPipe } from '../../pipes/add-on-uuids-to-add-ons.pipe';
import { PreviewItemCostPipe } from '../../pipes/preview-item-cost.pipe';

interface GroupedCartItem {
  addOns: string[];
  permutationUuids: string[];
  items: CartItemPermutation[];
  count: number;
}

interface CartItemPermutation {
  id: string;
  addOns: string[];
}

@Component({
  selector: 'app-item-preview',
  imports: [
    CommonModule,
    MaterialModule,
    LanguageDirectionDirective,
    PropertiesTranslationPipe,
    AddOnUuidsToAddOnsPipe,
    PreviewItemCostPipe,
    TranslateModule,
  ],
  templateUrl: './item-preview.component.html',
  styleUrl: './item-preview.component.scss',
})
export class ItemPreviewComponent {
  // TODO: change to group by add-ons uuids
  private _cartItem: CartItem | undefined;
  @Input() set cartItem(value: CartItem) {
    this._cartItem = value;
    this.groupedCartItem = this.groupSimilarItems();
  }
  get cartItem(): CartItem | undefined {
    return this._cartItem;
  }
  @Input() expanded = false;

  @Output() opened = new EventEmitter<number>();

  public lang$: Observable<LanguageType> = new Observable<LanguageType>();
  public groupedCartItem: GroupedCartItem[] = [];

  constructor(
    private languageService: LanguageService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.lang$ = this.languageService.currentLanguage$;
  }

  groupSimilarItems(): GroupedCartItem[] {
    if (!this.cartItem?.items) return [];

    const groupMap = new Map<string, GroupedCartItem>();

    this.cartItem.items.forEach((addOns: string[], id: string) => {
      console.log(id, addOns);

      const sortedKey = [...addOns].sort().join(',');
      console.log(sortedKey);

      if (!groupMap.has(sortedKey)) {
        groupMap.set(sortedKey, {
          addOns: [...addOns].sort(),
          permutationUuids: [id],
          items: [],
          count: 0,
        });
      }

      const group = groupMap.get(sortedKey)!;
      group.items.push({ id, addOns });
      group.count++;
      group.permutationUuids.push(id);
    });

    return Array.from(groupMap.values());
  }

  removeItemGroup(group: GroupedCartItem): void {
    if (!this.cartItem?.itemUuid) return;

    group.items.forEach((item) => {
      this.cartService.removeVariant(this.cartItem!.itemUuid, item.id);
    });
    this.groupedCartItem = this.groupSimilarItems();
  }
}
