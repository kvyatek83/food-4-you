import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { OrdersService } from '../../services/orders.service';
import { Order } from '../../travler/travler.models';
import { Observable } from 'rxjs';
import { LanguageService, LanguageType } from '../../services/lang.service';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { AddOnUuidsToAddOnsPipe } from '../../pipes/add-on-uuids-to-add-ons.pipe';

@Component({
  templateUrl: './order-details.component.html',
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    LanguageDirectionDirective,
    AddOnUuidsToAddOnsPipe,
  ],
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent {
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  // TODO: break down the add-ons
  constructor(
    public dialogRef: MatDialogRef<OrderDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: Order },
    private languageService: LanguageService,
    private ordersService: OrdersService
  ) {
    this.lang$ = this.languageService.currentLanguage$;
  }

  markAsPrinted(): void {
    this.ordersService
      .updateOrderPrintStatus(this.data.order.uuid, true)
      .subscribe(() => {
        this.data.order.printed = true;
        this.dialogRef.close({ printed: true });
      });
  }
}
