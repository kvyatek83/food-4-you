import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import {
  CustomerDetails,
  Item,
  OrderResponse,
} from '../traveler/traveler.models';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  itemUuid: string;
  item: Item;
  items: Map<string, string[]>;
}

interface SerializableCartItem {
  itemUuid: string;
  item: Item;
  items: Array<[string, string[]]>;
}

interface CartState {
  items: SerializableCartItem[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly CART_KEY = 'shopping_cart';
  private readonly EXPIRY_TIME = 15 * 60 * 1000;

  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  constructor(private http: HttpClient) {
    this.initializeCart();
    this.setupExpiryCheck();
  }

  private serializeCartItems(items: CartItem[]): SerializableCartItem[] {
    return items.map((item) => ({
      itemUuid: item.itemUuid,
      item: item.item,
      items: Array.from(item.items.entries()),
    }));
  }

  private deserializeCartItems(items: SerializableCartItem[]): CartItem[] {
    return items.map((item) => ({
      itemUuid: item.itemUuid,
      item: item.item,
      items: new Map(item.items),
    }));
  }

  private initializeCart(): void {
    const savedCart = localStorage.getItem(this.CART_KEY);
    if (savedCart) {
      try {
        const cartState: CartState = JSON.parse(savedCart);
        const now = Date.now();

        if (now - cartState.timestamp <= this.EXPIRY_TIME) {
          const items = this.deserializeCartItems(cartState.items);
          this.cartItems.next(items);
        } else {
          this.clearCart();
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        this.clearCart();
      }
    }
  }

  private setupExpiryCheck(): void {
    setInterval(() => {
      const savedCart = localStorage.getItem(this.CART_KEY);
      if (savedCart) {
        const cartState: CartState = JSON.parse(savedCart);
        const now = Date.now();

        if (now - cartState.timestamp > this.EXPIRY_TIME) {
          this.clearCart();
        }
      }
    }, 60000);
  }

  private saveToLocalStorage(items: CartItem[]): void {
    const cartState: CartState = {
      items: this.serializeCartItems(items),
      timestamp: Date.now(),
    };
    localStorage.setItem(this.CART_KEY, JSON.stringify(cartState));
  }

  private generateCartItemId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addItem(item: Item, selectedAddOns: string[] = []): void {
    const currentItems = this.cartItems.value;
    const cartItemId = this.generateCartItemId();

    const existingItemIndex = currentItems.findIndex(
      (i) => i.itemUuid === item.uuid
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].items.set(cartItemId, selectedAddOns);
      this.cartItems.next(updatedItems);
      this.saveToLocalStorage(updatedItems);
    } else {
      const newCartItem: CartItem = {
        itemUuid: item.uuid,
        item: item,
        items: new Map([[cartItemId, selectedAddOns]]),
      };
      this.cartItems.next([...currentItems, newCartItem]);
      this.saveToLocalStorage([...currentItems, newCartItem]);
    }
  }

  removeVariant(itemUuid: string, cartItemId: string): void {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex((i) => i.itemUuid === itemUuid);

    if (itemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex].items.delete(cartItemId);

      if (updatedItems[itemIndex].items.size === 0) {
        updatedItems.splice(itemIndex, 1);
      }

      this.cartItems.next(updatedItems);
      this.saveToLocalStorage(updatedItems);
    }
  }

  updateVariantAddOns(
    itemUuid: string,
    cartItemId: string,
    newAddOns: string[]
  ): void {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex((i) => i.itemUuid === itemUuid);

    if (itemIndex > -1 && currentItems[itemIndex].items.has(cartItemId)) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex].items.set(cartItemId, newAddOns);
      this.cartItems.next(updatedItems);
      this.saveToLocalStorage(updatedItems);
    }
  }

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem(this.CART_KEY);
  }

  getCartItem(itemUuid: string): CartItem | undefined {
    return this.cartItems.value.find(
      (cartItem) => cartItem.itemUuid === itemUuid
    );
  }

  getItemCount(itemUuid: string): Observable<number> {
    if (!itemUuid) {
      return of(0);
    }

    return this.cartItems$.pipe(
      map((items) => {
        const item = items.find((i) => i.itemUuid === itemUuid);
        return item ? item.items.size : 0;
      })
    );
  }

  getTotalItemsCount(): Observable<number> {
    return this.cartItems$.pipe(
      map((items) => items.reduce((total, item) => total + item.items.size, 0))
    );
  }

  getVariantsForItem(
    itemUuid: string
  ): Observable<Map<string, string[]> | undefined> {
    return this.cartItems$.pipe(
      map((items) => items.find((i) => i.itemUuid === itemUuid)?.items)
    );
  }

  calcCartItemCost(cartItem: CartItem, permutationUuids?: string[]): string {
    const basePrice = cartItem.item.price;
    const freeAddons = cartItem.item.freeAvailableAddOns || 0;
    const pricePerAddOn = cartItem.item.addOnPrice || 0;
    let totalPrice = 0;
    cartItem.items.forEach((value, permutationUuid) => {
      if (permutationUuids) {
        if (permutationUuids.includes(permutationUuid)) {
          totalPrice += basePrice;
          if (value.length) {
            const addOnsNeedsPay = value.length - freeAddons;
            totalPrice += addOnsNeedsPay * pricePerAddOn;
          }
        }
      } else {
        totalPrice += basePrice;
        if (value.length) {
          const addOnsNeedsPay = value.length - freeAddons;
          totalPrice += addOnsNeedsPay * pricePerAddOn;
        }
      }
    });

    return `${totalPrice.toFixed(2)} GTQ`;
  }

  placeOrder(customerDetails: CustomerDetails): Observable<OrderResponse> {
    // Get current cart items
    const cartItems = this.cartItems.value.map((cartItem) => {
      return {
        ...cartItem,
        items: Array.from(cartItem.items.values()),
      };
    });

    console.log(cartItems);

    // Prepare order payload
    const orderPayload = {
      customerDetails,
      cartItems,
    };

    // Send order to server
    return this.http.post<OrderResponse>(`/api/traveler/orders`, orderPayload);
  }
}
