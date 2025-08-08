import { Component, Input, signal, Output, EventEmitter } from '@angular/core';
import { CartItem } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { ItemPreviewComponent } from '../item-preview/item-preview.component';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-items-preview',
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    ItemPreviewComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './items-preview.component.html',
  styleUrl: './items-preview.component.scss',
})
export class ItemsPreviewComponent {
  @Input() cartItems: CartItem[] | undefined;
  @Output() allItemsRemoved = new EventEmitter<void>();

  expandedItem = signal<number | null>(null);

  setExpandedItem(index: number) {
    this.expandedItem.set(index);
  }

  ngOnInit(): void {}
}
