import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CartItem } from '../../services/cart.service';
import { ItemsPreviewComponent } from '../items-preview/items-preview.component';

@Component({
  selector: 'app-items-summary-modal',
  templateUrl: 'items-summary-modal.component.html',
  imports: [CommonModule, MaterialModule, ItemsPreviewComponent],
  styleUrl: 'items-summary-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsSummaryModalComponent {
  public cartItems: CartItem[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: CartItem[]) {
    console.log(data);
    this.cartItems = data;
  }
}
