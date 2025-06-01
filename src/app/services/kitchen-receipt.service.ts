import { Injectable } from '@angular/core';
import { ItemsService } from './items.service';

export interface KitchenReceiptData {
  customerName: string;
  orderType: 'takeaway' | 'sitdown';
  items: any[];
  totalAmount: number;
  orderNumber?: string;
  isPaid?: boolean;
}

export interface FormattedReceiptData {
  headerInfo: {
    storeName: string;
    storeAddress: string;
    storeCity: string;
  };
  date: string;
  customerInfo: {
    name: string;
    orderType: string;
  };
  orderNumber?: string;
  transactionType: string;
  items: {
    sku?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentInfo: {
    method: string;
    amount: string;
    status: string;
  };
  footerInfo: {
    thankYouMessage: string;
    additionalInfo?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class KitchenReceiptService {

  constructor(private itemsService: ItemsService) { }

  /**
   * Format order data for kitchen printing in Spanish
   */
  formatForKitchen(orderData: KitchenReceiptData): FormattedReceiptData {
    const now = new Date();
    const dateStr = this.formatDateInSpanish(now);
    
    // Translate order type to Spanish
    const orderTypeSpanish = orderData.orderType === 'takeaway' ? 'PARA LLEVAR' : 'COMER AQUÍ';

    return {
      headerInfo: {
        storeName: 'Chabad Antigua',
        storeAddress: 'KOSHER FOOD FOR YOU',
        storeCity: '' // Empty as per format
      },
      date: dateStr,
      customerInfo: {
        name: orderData.customerName.toUpperCase(),
        orderType: orderTypeSpanish
      },
      orderNumber: orderData.orderNumber,
      transactionType: 'PEDIDO',
      items: orderData.items.map(item => ({
        sku: item.uuid?.substring(0, 8),
        description: this.formatItemNameWithAddOns(item),
        quantity: item.quantity,
        unitPrice: item.price,
        price: item.itemTotalPrice
      })),
      subtotal: orderData.totalAmount,
      tax: 0, // No tax for now
      total: orderData.totalAmount,
      paymentInfo: {
        method: 'EFECTIVO',
        amount: `${orderData.totalAmount.toFixed(2)} GTQ`,
        status: orderData.isPaid ? 'PAGADO' : 'NO PAGADO'
      },
      footerInfo: {
        thankYouMessage: 'Buen Provecho',
        additionalInfo: `Orden #${orderData.orderNumber || 'N/A'}`
      }
    };
  }

  /**
   * Format date and time in Spanish
   */
  private formatDateInSpanish(date: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${dayName}, ${day} de ${month} ${year} - ${hours}:${minutes}`;
  }

  /**
   * Format item name in Spanish with add-ons using "con"
   */
  private formatItemNameWithAddOns(item: any): string {
    // Use Spanish name if available, otherwise fall back to English name
    let itemName = item.esName || item.itemName || '';
    
    // If item has selected add-ons, add them with "con"
    if (item.selectedAddOns && item.selectedAddOns.length > 0) {
      const addOnsText = item.selectedAddOns.map((addOnUuid: string) => this.itemsService.getAddOnByUuid(addOnUuid)?.esName).join(', ');
      itemName += ` con ${addOnsText}`;
    }
    
    return itemName;
  }

  /**
   * Generate a simple order number
   */
  generateOrderNumber(): string {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6); // Last 6 digits
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${timestamp}${random}`;
  }

  /**
   * Create a formatted receipt string for debugging/preview
   */
  createReceiptPreview(receiptData: FormattedReceiptData): string {
    let receipt = '';
    
    // Header
    receipt += `${receiptData.headerInfo.storeName}\n`;
    receipt += `${receiptData.headerInfo.storeAddress}\n`;
    receipt += '================================\n';
    
    // Customer and order info
    receipt += `${receiptData.customerInfo.name}`;
    receipt += ' '.repeat(32 - receiptData.customerInfo.name.length - receiptData.customerInfo.orderType.length);
    receipt += `${receiptData.customerInfo.orderType}\n`;
    receipt += `${receiptData.date}\n`;
    receipt += '================================\n';
    
    // Items
    receiptData.items.forEach(item => {
      receipt += `${item.description}\n`;
      receipt += `  ${item.quantity}x ${item.unitPrice.toFixed(2)} = ${item.price.toFixed(2)} GTQ\n`;
    });
    
    receipt += '================================\n';
    
    // Total
    receipt += `TOTAL`;
    receipt += ' '.repeat(32 - 5 - `${receiptData.total.toFixed(2)} GTQ`.length);
    receipt += `${receiptData.total.toFixed(2)} GTQ\n`;
    
    receipt += '================================\n';
    
    // Payment status
    receipt += `${receiptData.paymentInfo.status}\n`;
    receipt += `${receiptData.footerInfo.thankYouMessage}\n`;
    
    return receipt;
  }
} 