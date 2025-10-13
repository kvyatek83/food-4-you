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
import { AndroidPrinterService, DetailedPrinterStatus } from '../../services/android-printer.service';
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
    this.checkPrinter();
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

    // Always save order to database first (ensures manager can see it even if printing fails)
    this.saveOrderToDatabase(orderDetails, orderNumber, () => {
      // After successful save, attempt to print
      if (this.androidPrinterService.isAndroidEnvironment) {
        this.checkPrinterAndPrint(orderDetails, orderNumber, totalAmount);
      } else {
        // For browser testing, order is already saved - just show success
        this.notificationsService.setNotification({
          type: 'SUCCESS',
          message: this.translate.instant('cart.success.orderPlaced', { orderNumber })
        });
        this.isProcessingOrder = false;
      }
    });
  }

  private checkPrinterAndPrint(orderDetails: OrderDialogResult, orderNumber: string, totalAmount: number): void {
    // Check printer status before attempting to print
    this.androidPrinterService.getDetailedPrinterStatus().subscribe({
      next: (printerStatus) => {
        if (!printerStatus.printerEnabled) {
          this.showPrinterDisabledMessage(orderNumber);
          this.isProcessingOrder = false;
          return;
        }

        if (!printerStatus.printerAvailable || printerStatus.printerErrorType) {
          this.showPrinterErrorMessage(printerStatus, orderNumber);
          this.isProcessingOrder = false;
          return;
        }

        // Printer is available, proceed with printing
        this.proceedWithPrinting(orderDetails, orderNumber, totalAmount);
      },
      error: (error) => {
        console.error('Error checking printer status:', error);
        // Proceed with printing attempt even if status check failed
        this.proceedWithPrinting(orderDetails, orderNumber, totalAmount);
      }
    });
  }

  private proceedWithPrinting(orderDetails: OrderDialogResult, orderNumber: string, totalAmount: number): void {
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

    // Attempt to print
    this.printKitchenReceipt(formattedReceipt, orderNumber);
  }

  private showPrinterDisabledMessage(orderNumber: string): void {
    this.notificationsService.setNotification({
      type: 'WARNING',
      message: this.translate.instant('cart.warnings.printerDisabled', { orderNumber })
    });
  }

  private showPrinterErrorMessage(printerStatus: DetailedPrinterStatus, orderNumber: string): void {
    const errorMessage = printerStatus.userFriendlyError || 
      this.translate.instant('cart.errors.printerUnavailable');
    
    this.notificationsService.setNotification({
      type: 'ERROR',
      message: this.translate.instant('cart.errors.printingIssue', { 
        orderNumber, 
        error: errorMessage 
      })
    });
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

  private printKitchenReceipt(receiptData: any, orderNumber: string): void {
    this.androidPrinterService.printReceipt(receiptData).subscribe({
      next: (printResult) => {
        if (printResult.success) {
          console.log('Kitchen receipt printed successfully');
          this.notificationsService.setNotification({
            type: 'SUCCESS',
            message: this.translate.instant('cart.success.orderPrintedAndSaved', { orderNumber })
          });
        } else {
          console.error('Failed to print kitchen receipt:', printResult.message);
          this.notificationsService.setNotification({
            type: 'WARNING',
            message: this.translate.instant('cart.warnings.orderSavedPrintFailed', { 
              orderNumber, 
              error: printResult.message 
            })
          });
        }
        this.isProcessingOrder = false;
      },
      error: (error) => {
        console.error('Error printing kitchen receipt:', error);
        this.notificationsService.setNotification({
          type: 'WARNING',
          message: this.translate.instant('cart.warnings.orderSavedPrintError', { orderNumber })
        });
        this.isProcessingOrder = false;
      }
    });
  }

  private saveOrderToDatabase(orderDetails: OrderDialogResult, orderNumber: string, onSuccess?: () => void): void {
    // Prepare order data for database using CustomerDetails interface
    const customerDetails: CustomerDetails = {
      name: orderDetails.customerName,
      phone: '' // We don't collect phone in this flow
    };

    // Save order to database
    this.cartService.placeOrder(customerDetails).pipe(take(1)).subscribe({
      next: (response) => {
        console.log('Order saved to database successfully');
        
        // Clear cart after successful order
        this.cartService.clearCart();
        
        // Call success callback if provided (for continuing with printing)
        if (onSuccess) {
          onSuccess();
        } else {
          // If no callback, just show success and finish
          this.notificationsService.setNotification({
            type: 'SUCCESS',
            message: this.translate.instant('cart.success.orderPlaced', { orderNumber })
          });
          this.isProcessingOrder = false;
        }
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
      } else {  
        
      }
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