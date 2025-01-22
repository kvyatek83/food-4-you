import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item } from '../travler/travler.model';

interface CartState {
  items: Item[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly CART_KEY = 'shopping_cart';
  private readonly EXPIRY_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

  private cartItems = new BehaviorSubject<Item[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  constructor() {
    this.initializeCart();
    this.setupExpiryCheck();
  }

  private initializeCart(): void {
    const savedCart = localStorage.getItem(this.CART_KEY);
    if (savedCart) {
      const cartState: CartState = JSON.parse(savedCart);
      const now = Date.now();

      if (now - cartState.timestamp <= this.EXPIRY_TIME) {
        this.cartItems.next(cartState.items);
      } else {
        this.clearCart();
      }
    }
  }

  private setupExpiryCheck(): void {
    // Check every minute if cart should be expired
    setInterval(() => {
      const savedCart = localStorage.getItem(this.CART_KEY);
      if (savedCart) {
        const cartState: CartState = JSON.parse(savedCart);
        const now = Date.now();

        if (now - cartState.timestamp > this.EXPIRY_TIME) {
          this.clearCart();
        }
      }
    }, 60000); // Check every minute
  }

  private saveToLocalStorage(items: Item[]): void {
    const cartState: CartState = {
      items,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.CART_KEY, JSON.stringify(cartState));
  }

  addItem(item: Item): void {
    const currentItems = this.cartItems.value;
    const newItems = [...currentItems, item];
    this.cartItems.next(newItems);
    this.saveToLocalStorage(newItems);
  }

  removeItem(itemId: string): void {
    const currentItems = this.cartItems.value;
    const newItems = currentItems.filter((item) => item.uuid !== itemId);
    this.cartItems.next(newItems);
    this.saveToLocalStorage(newItems);
  }

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem(this.CART_KEY);
  }

  getItemCount(): Observable<number> {
    return new Observable<number>((observer) => {
      this.cartItems$.subscribe((items) => {
        observer.next(items.length);
      });
    });
  }
}
