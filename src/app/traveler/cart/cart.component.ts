import { Component, OnInit } from '@angular/core';
import { CartItem, CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import {
  PrintResult,
  ReceiptData,
  ReceiptPrinterService,
} from '../../services/printer.service';
import { ItemsPreviewComponent } from '../items-preview/items-preview.component';
import { combineLatest, filter, Observable, take } from 'rxjs';
import { ItemsService } from '../../services/items.service';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialogComponent, OrderDialogData, OrderDialogResult } from './order-dialog.component';
import { KitchenReceiptService, KitchenReceiptData } from '../../services/kitchen-receipt.service';
import { AndroidPrinterService } from '../../services/android-printer.service';
import { NotificationsService } from '../../services/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomerDetails } from '../traveler.models';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    ItemsPreviewComponent,
    TranslateModule,
    MaterialModule,
    RouterModule,
    LanguageDirectionDirective,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  itemCount = 0;
  printerAvailable = false;
  printResult: boolean | null = null;
  public lang$: Observable<LanguageType>;
  dir: LanguageDirection = 'ltr';
  isProcessingOrder = false;

  constructor(
    private cartService: CartService,
    private itemsService: ItemsService,
    private printerService: ReceiptPrinterService,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private kitchenReceiptService: KitchenReceiptService,
    private androidPrinterService: AndroidPrinterService,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private propertiesTranslationPipe: PropertiesTranslationPipe
  ) {
    this.lang$ = this.languageService.currentLanguage$;
  }

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

      // TODO: optimize for Android
    // this.checkPrinter();
  }

  processOrder(): void {
    if (this.cartItems.length === 0) {
      this.notificationsService.setNotification({
        type: 'ERROR',
        message: this.translate.instant('cart.errors.emptyCart')
      });
      return;
    }

    const totalAmount = this.calculateTotalAmount();

    // Create simplified items for dialog display
    const dialogItems = this.createDialogItems();

    // Open order dialog
    const dialogData: OrderDialogData = {
      totalAmount: totalAmount,
      items: dialogItems
    };

    const dialogRef = this.dialog.open(OrderDialogComponent, {
      width: '500px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: OrderDialogResult) => {
      if (result && result.confirmed) {
        this.createAndProcessOrder(result, totalAmount);
      }
    });
  }

  calculateTotalAmount(): number {
    const total = this.cartItems.reduce((sum, cartItem) => {
      return sum + this.calculateCartItemTotal(cartItem);
    }, 0);
    return Number(total.toFixed(2));
  }

  private createDialogItems(): any[] {
    const currentLang = this.languageService.currentLanguage;
    return this.cartItems.map(cartItem => ({
      itemName: this.propertiesTranslationPipe.transform(cartItem.item, currentLang, 'Name'),
      quantity: cartItem.items.size,
      price: cartItem.item.price,
      itemTotalPrice: this.calculateCartItemTotal(cartItem)
    }));
  }

  private calculateCartItemTotal(cartItem: CartItem): number {
    const costString = this.cartService.calcCartItemCost(cartItem);
    // Extract number from "XX.XX GTQ" format
    return parseFloat(costString.replace(' GTQ', ''));
  }


  private createAndProcessOrder(orderDetails: OrderDialogResult, totalAmount: number): void {
    this.isProcessingOrder = true;

    // Generate order number
    const orderNumber = this.kitchenReceiptService.generateOrderNumber();

    // Create kitchen receipt data with proper format
    const kitchenReceiptData: KitchenReceiptData = {
      customerName: orderDetails.customerName,
      orderType: orderDetails.orderType,
      items: this.createKitchenItems(),
      totalAmount: totalAmount,
      orderNumber: orderNumber,
      isPaid: false // Assuming not paid yet
    };

    // Format receipt for kitchen (in Spanish)
    const formattedReceipt = this.kitchenReceiptService.formatForKitchen(kitchenReceiptData);

    // Print to kitchen if Android environment
    if (this.androidPrinterService.isAndroidEnvironment) {
      this.printKitchenReceipt(formattedReceipt, orderDetails, orderNumber);
    } else {
      // For browser testing, just save the order
      this.saveOrderToDatabase(orderDetails, orderNumber);
    }
  }

  private createKitchenItems(): any[] {
    return this.cartItems.flatMap(cartItem => {
      const items: any[] = [];
      cartItem.items.forEach((addOns, cartItemId) => {
        items.push({
          uuid: cartItemId,
          itemName: cartItem.item.enName, // English name for fallback
          esName: cartItem.item.esName, // Spanish name for kitchen
          quantity: 1, // Each variant is quantity 1
          price: cartItem.item.price,
          selectedAddOns: addOns, // Add-ons selected for this item
          itemTotalPrice: this.calculateSingleItemCost(cartItem, addOns)
        });
      });
      return items;
    });
  }

  private calculateSingleItemCost(cartItem: CartItem, addOns: string[]): number {
    const basePrice = cartItem.item.price;
    const freeAddons = cartItem.item.freeAvailableAddOns || 0;
    const pricePerAddOn = cartItem.item.addOnPrice || 0;
    
    let totalPrice = basePrice;
    if (addOns.length > 0) {
      const addOnsNeedsPay = Math.max(0, addOns.length - freeAddons);
      totalPrice += addOnsNeedsPay * pricePerAddOn;
    }
    
    return totalPrice;
  }

  private printKitchenReceipt(receiptData: any, orderDetails: OrderDialogResult, orderNumber: string): void {
    this.androidPrinterService.printReceipt(receiptData).subscribe({
      next: (printResult) => {
        if (printResult.success) {
          console.log('Kitchen receipt printed successfully');
          this.saveOrderToDatabase(orderDetails, orderNumber);
          
          this.notificationsService.setNotification({
            type: 'SUCCESS',
            message: this.translate.instant('cart.success.orderPrinted', { orderNumber })
          });
        } else {
          console.error('Failed to print kitchen receipt:', printResult.message);
          this.notificationsService.setNotification({
            type: 'ERROR',
            message: this.translate.instant('cart.errors.printFailed', { error: printResult.message })
          });
        }
        this.isProcessingOrder = false;
      },
      error: (error) => {
        console.error('Error printing kitchen receipt:', error);
        this.notificationsService.setNotification({
          type: 'ERROR',
          message: this.translate.instant('cart.errors.printError')
        });
        this.isProcessingOrder = false;
      }
    });
  }

  private saveOrderToDatabase(orderDetails: OrderDialogResult, orderNumber: string): void {
    // Prepare order data for database using CustomerDetails interface
    const customerDetails: CustomerDetails = {
      name: orderDetails.customerName,
      phone: '' // We don't collect phone in this flow
    };

    // Save order to database
    this.cartService.placeOrder(customerDetails).pipe(take(1)).subscribe({
      next: (response) => {
        console.log('Order saved to database:', response);
        
        // Clear cart after successful order
        // TODO: nav to menu
        // TODO: order number should be in the order details
        // TODO: print receipt should be before the order is saved
        this.cartService.clearCart();
        
        this.notificationsService.setNotification({
          type: 'SUCCESS',
          message: this.translate.instant('cart.success.orderPlaced', { orderNumber })
        });
        
        this.isProcessingOrder = false;
      },
      error: (error) => {
        console.error('Error saving order to database:', error);
        this.notificationsService.setNotification({
          type: 'ERROR',
          message: this.translate.instant('cart.errors.orderSaveFailed')
        });
        this.isProcessingOrder = false;
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart();
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

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }

  // Helper method to get total amount
  getTotalAmount(): number {
    return this.calculateTotalAmount();
  }

  // Helper method to check if order can be processed
  canProcessOrder(): boolean {
    return this.cartItems.length > 0 && !this.isProcessingOrder;
  }
}