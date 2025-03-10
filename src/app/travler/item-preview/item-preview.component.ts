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
  @Input() cartItem: CartItem | undefined;
  @Input() expanded = false;

  @Output() opened = new EventEmitter<number>();

  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  constructor(
    private languageService: LanguageService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.lang$ = this.languageService.currentLanguage$;
  }

  removeItemPermutation(cartItemId: string, itemUuid = ''): void {
    console.log(itemUuid);
    console.log(cartItemId);
    this.cartService.removeVariant(itemUuid, cartItemId);
  }
}
