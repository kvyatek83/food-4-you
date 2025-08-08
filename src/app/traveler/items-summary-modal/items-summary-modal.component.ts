import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CartItem } from '../../services/cart.service';
import { ItemsPreviewComponent } from '../items-preview/items-preview.component';
import { Observable } from 'rxjs';
import { LanguageService, LanguageType } from '../../services/lang.service';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { TranslateModule } from '@ngx-translate/core';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';

@Component({
  selector: 'app-items-summary-modal',
  templateUrl: 'items-summary-modal.component.html',
  imports: [
    CommonModule,
    MaterialModule,
    ItemsPreviewComponent,
    LanguageDirectionDirective,
    TranslateModule,
  ],
  styleUrl: 'items-summary-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsSummaryModalComponent {
  public cartItems: CartItem;
  public itemName: string | undefined;

  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CartItem,
    private languageService: LanguageService,
    private propertiesTranslationPipe: PropertiesTranslationPipe,
    private dialogRef: MatDialogRef<ItemsSummaryModalComponent>
  ) {
    // TODOL: add sub for cart item remove and close modal
    this.lang$ = this.languageService.currentLanguage$;
    this.cartItems = data;
    this.itemName = this.propertiesTranslationPipe.transform(
      this.cartItems.item,
      this.languageService.currentLanguage,
      'Name'
    );
  }

  onAllItemsRemoved(): void {
    this.dialogRef.close();
  }
}
