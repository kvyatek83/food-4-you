import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { Observable } from 'rxjs';
import { LanguageType, LanguageService, LanguageDirection } from '../../services/lang.service';

// TODO: split to FileSystem, notification, i18n, and tests
export interface OrderDialogData {
  totalAmount: number;
  items: any[];
}

export interface OrderDialogResult {
  customerName: string;
  orderType: 'takeaway' | 'sitdown';
  confirmed: boolean;
}

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MaterialModule, 
    TranslateModule,
    LanguageDirectionDirective
  ],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent {
  customerName = '';
  orderType: 'takeaway' | 'sitdown' = 'takeaway';
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();
  public dir: LanguageDirection = 'ltr';

  constructor(
    public dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDialogData,
    private languageService: LanguageService
  ) {
    this.lang$ = this.languageService.currentLanguage$;
  }

  isValid(): boolean {
    return this.customerName.trim().length > 0 && !!this.orderType;
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }

  onConfirm(): void {
    if (this.isValid()) {
      const result: OrderDialogResult = {
        customerName: this.customerName.trim(),
        orderType: this.orderType,
        confirmed: true
      };
      this.dialogRef.close(result);
    }
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
} 