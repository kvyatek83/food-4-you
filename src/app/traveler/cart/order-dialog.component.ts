import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [CommonModule, FormsModule, MaterialModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'cart.orderDialog.title' | translate }}</h2>
    
    <mat-dialog-content class="order-dialog-content">
      <!-- Order Type Selection -->
      <div class="order-type-section">
        <label class="section-label">{{ 'cart.orderDialog.orderType' | translate }}</label>
        <mat-button-toggle-group [hideSingleSelectionIndicator]="true"
          [(ngModel)]="orderType" 
          name="orderType" 
          class="order-type-toggle">
          <mat-button-toggle value="takeaway">
            <mat-icon>takeout_dining</mat-icon>
            {{ 'cart.orderDialog.takeaway' | translate }}
          </mat-button-toggle>
          <mat-button-toggle value="sitdown">
            <mat-icon>restaurant</mat-icon>
            {{ 'cart.orderDialog.sitdown' | translate }}
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <!-- Customer Name Input -->
      <div class="customer-name-section">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ 'cart.orderDialog.customerName' | translate }}</mat-label>
          <input 
            matInput 
            [(ngModel)]="customerName" 
            [placeholder]="'cart.orderDialog.customerNamePlaceholder' | translate"
            required>
          <mat-icon matSuffix>person</mat-icon>
        </mat-form-field>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h3>{{ 'cart.orderDialog.orderSummary' | translate }}</h3>
        <div class="summary-items">
          <div *ngFor="let item of data.items" class="summary-item">
            <span class="item-name">{{ item.itemName }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
            <span class="item-price">{{ item.itemTotalPrice | currency:'GTQ':'symbol':'1.2-2' }}</span>
          </div>
        </div>
        <mat-divider></mat-divider>
        <div class="total-section">
          <span class="total-label">{{ 'cart.orderDialog.total' | translate }}</span>
          <span class="total-amount">{{ data.totalAmount | currency:'GTQ':'symbol':'1.2-2' }}</span>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        {{ 'cart.orderDialog.cancel' | translate }}
      </button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onConfirm()"
        [disabled]="!isValid()">
        <mat-icon>print</mat-icon>
        {{ 'cart.orderDialog.finishOrder' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .order-dialog-content {
      min-width: 400px;
      padding: 20px 0;
    }

    .order-type-section, .customer-name-section {
      margin-bottom: 24px;
    }

    .section-label {
      display: block;
      font-weight: 500;
      margin-bottom: 12px;
      color: rgba(0, 0, 0, 0.87);
    }

    .order-type-toggle {
      width: 100%;
    }

    .order-type-toggle mat-button-toggle {
      flex: 1;
      height: 56px;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .full-width {
      width: 100%;
    }

    .order-summary {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .order-summary h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .item-name {
      flex: 1;
      font-weight: 400;
    }

    .item-quantity {
      margin: 0 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .item-price {
      font-weight: 500;
      min-width: 80px;
      text-align: right;
    }

    .total-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .total-amount {
      color: #1976d2;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    mat-button-toggle mat-icon {
      margin-right: 8px;
    }
  `]
})
export class OrderDialogComponent {
  customerName = '';
  orderType: 'takeaway' | 'sitdown' = 'takeaway';

  constructor(
    public dialogRef: MatDialogRef<OrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderDialogData
  ) {}

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
} 