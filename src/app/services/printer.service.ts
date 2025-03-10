// TODO: edit this to the right format + add more error catch
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

export interface ReceiptData {
  headerInfo?: {
    storeName?: string;
    storeAddress?: string;
    storeCity?: string;
    logo?: string;
  };
  date?: string;
  referenceNumber?: string;
  transactionType?: string;
  items?: Array<{
    sku?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    price?: number;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentInfo?: {
    method?: string;
    amount?: string;
    cardNumber?: string;
    authCode?: string;
  };
  footerInfo?: {
    refundPolicy?: string;
    returnPolicy?: string;
    additionalInfo?: string;
    thankYouMessage?: string;
  };
}

export interface PrintResult {
  success: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReceiptPrinterService {
  private readonly androidPrinter: any;

  constructor() {
    // Check if the Android interface is available
    this.androidPrinter = (window as any).AndroidPrinter;

    // Setup callback function for print results
    if (!('angularPrintCallback' in window)) {
      (window as any).angularPrintCallback = (result: PrintResult) => {
        this.handlePrintResult(result);
      };
    }
  }

  /**
   * Check if printer is available
   */
  isPrinterAvailable(): Observable<boolean> {
    return new Observable((observer) => {
      if (!this.androidPrinter) {
        observer.next(false);
        observer.complete();
        return;
      }

      try {
        const result = JSON.parse(this.androidPrinter.isPrinterAvailable());
        observer.next(result.available);
        observer.complete();
      } catch (error) {
        console.error('Error checking printer availability:', error);
        observer.next(false);
        observer.complete();
      }
    });
  }

  /**
   * Print a receipt using the connected printer
   * @param receiptData The data for the receipt
   */
  printReceipt(receiptData: ReceiptData): Observable<boolean> {
    return new Observable((observer) => {
      if (!this.androidPrinter) {
        console.error('Android printer interface not available');
        observer.next(false);
        observer.complete();
        return;
      }

      try {
        // Store the observer for callback response
        this.currentPrintObserver = observer;

        // Send print request to Android
        const response = JSON.parse(
          this.androidPrinter.printReceipt(JSON.stringify(receiptData))
        );

        console.log('Print job submitted:', response);

        // We don't complete the observer here, it will be completed when
        // the callback is received from Android
      } catch (error) {
        console.error('Error sending print request:', error);
        observer.next(false);
        observer.complete();
      }
    });
  }

  // Keep track of current print job observer
  private currentPrintObserver: any = null;

  /**
   * Handle the print result callback from Android
   */
  private handlePrintResult(result: PrintResult): void {
    console.log('Print result received:', result);

    if (this.currentPrintObserver) {
      this.currentPrintObserver.next(result.success);
      this.currentPrintObserver.complete();
      this.currentPrintObserver = null;
    }
  }
}
