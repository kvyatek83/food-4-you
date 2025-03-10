import { Component } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import {
  PrintResult,
  ReceiptData,
  ReceiptPrinterService,
} from '../../services/printer.service';
import { ItemsPreviewComponent } from '../items-preview/items-preview.component';
import { combineLatest, filter } from 'rxjs';
import { ItemsService } from '../../services/items.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, ItemsPreviewComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  cartItems: CartItem[] = [];
  itemCount = 0;
  printerAvailable = false;
  printResult: boolean | null = null;

  constructor(
    private cartService: CartService,
    private itemsService: ItemsService,
    private printerService: ReceiptPrinterService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.itemsService.addOns$,
      this.cartService.cartItems$,
      this.cartService.getTotalItemsCount(),
    ])
      .pipe(filter(([addOns, _, _1]) => !!addOns?.size))
      .subscribe(([_, cartItems, count]) => {
        this.cartItems = cartItems;
        this.itemCount = count;
      });

    this.checkPrinter();
  }

  checkPrinter(): void {
    this.printerService.isPrinterAvailable().subscribe((available) => {
      this.printerAvailable = available;
      if (available) {
        this.printSampleReceipt();
      }
    });
  }

  // TODO: change to kitchen order
  printSampleReceipt(): void {
    const sampleReceipt: ReceiptData = {
      headerInfo: {
        storeName: 'My Angular Store',
        storeAddress: '123 Web Avenue',
        storeCity: 'Internet City, Web 54321',
      },
      date: new Date().toLocaleString(),
      transactionType: 'SALE',
      items: [
        {
          sku: 'ANG001',
          description: 'Angular Book',
          price: 29.99,
        },
        {
          sku: 'TS002',
          description: 'TypeScript Guide',
          price: 19.99,
        },
      ],
      subtotal: 49.98,
      tax: 3.0,
      total: 52.98,
      paymentInfo: {
        method: 'Credit Card',
        amount: '52.98',
        cardNumber: 'Visa XXXX-XXXX-XXXX-4321',
      },
      footerInfo: {
        refundPolicy: 'Return Policy',
        returnPolicy: 'Returns accepted within 14 days',
        thankYouMessage: 'Thank you for your purchase!',
      },
    };

    this.printerService.printReceipt(sampleReceipt).subscribe((result) => {
      this.printResult = result;
      console.log('Print completed with result:', result);
    });
  }
}
