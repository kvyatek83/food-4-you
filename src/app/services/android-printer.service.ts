import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormattedReceiptData } from './kitchen-receipt.service';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    AndroidPrinter: {
      setAuthToken(token: string): string;
      clearAuthToken(): string;
      getAuthStatus(): string;
      printReceipt(receiptData: string): string;
      testPrinter(): string;
      getPrinterStatus(): string;
    };
  }
}

export interface PrinterStatus {
  available: boolean;
  enabled: boolean;
  ip: string;
  lastError: string | null;
  authenticated: boolean;
  timestamp: number;
}

export interface AuthStatus {
  hasToken: boolean;
  isMonitoring: boolean;
  timestamp: number;
}

export interface PrintResult {
  success: boolean;
  message: string;
  errorCode?: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AndroidPrinterService {
  private _isAndroidEnvironment$ = new BehaviorSubject<boolean>(false);
  private _printerStatus$ = new BehaviorSubject<PrinterStatus | null>(null);
  private _authStatus$ = new BehaviorSubject<AuthStatus | null>(null);

  constructor() {
    this.detectEnvironment();
    this.setupTokenExpirationListener();
  }

  get isAndroidEnvironment$(): Observable<boolean> {
    return this._isAndroidEnvironment$.asObservable();
  }

  get printerStatus$(): Observable<PrinterStatus | null> {
    return this._printerStatus$.asObservable();
  }

  get authStatus$(): Observable<AuthStatus | null> {
    return this._authStatus$.asObservable();
  }

  get isAndroidEnvironment(): boolean {
    return this._isAndroidEnvironment$.value;
  }

  private detectEnvironment(): void {
    const isAndroid = !!(window as any).AndroidPrinter;
    this._isAndroidEnvironment$.next(isAndroid);
    
    if (isAndroid) {
      console.log('Android printer bridge detected');
      this.updateAuthStatus();
      this.updatePrinterStatus();
    } else {
      console.log('Running in browser environment - Android printer not available');
    }
  }

  private setupTokenExpirationListener(): void {
    // Listen for token expiration events from Android
    window.addEventListener('androidTokenExpired', () => {
      console.log('Android reported token expiration - user needs to re-authenticate');
      this.updateAuthStatus();
      // Emit event to notify components that re-authentication is needed
    });
  }

  /**
   * Pass authentication token to Android
   * Call this after successful login
   */
  setAuthToken(token: string): boolean {
    if (!this.isAndroidEnvironment) {
      console.warn('Android bridge not available');
      return false;
    }

    try {
      const result = window.AndroidPrinter.setAuthToken(token);
      const response = JSON.parse(result);
      
      if (response.status === 'success') {
        console.log('Auth token successfully passed to Android');
        this.updateAuthStatus();
        this.updatePrinterStatus();
        return true;
      } else {
        console.error('Failed to set auth token:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
      return false;
    }
  }

  /**
   * Clear authentication token from Android
   * Call this on logout
   */
  clearAuthToken(): boolean {
    if (!this.isAndroidEnvironment) {
      console.warn('Android bridge not available');
      return false;
    }

    try {
      const result = window.AndroidPrinter.clearAuthToken();
      const response = JSON.parse(result);
      
      if (response.status === 'success') {
        console.log('Auth token cleared from Android');
        this.updateAuthStatus();
        this._printerStatus$.next(null);
        return true;
      } else {
        console.error('Failed to clear auth token:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error clearing auth token:', error);
      return false;
    }
  }

  /**
   * Update authentication status from Android
   */
  updateAuthStatus(): void {
    if (!this.isAndroidEnvironment) {
      return;
    }

    try {
      const result = window.AndroidPrinter.getAuthStatus();
      const authStatus: AuthStatus = JSON.parse(result);
      this._authStatus$.next(authStatus);
    } catch (error) {
      console.error('Error getting auth status:', error);
      this._authStatus$.next(null);
    }
  }

  /**
   * Update printer status from Android
   */
  updatePrinterStatus(): void {
    if (!this.isAndroidEnvironment) {
      return;
    }

    try {
      const result = window.AndroidPrinter.getPrinterStatus();
      const printerStatus: PrinterStatus = JSON.parse(result);
      this._printerStatus$.next(printerStatus);
    } catch (error) {
      console.error('Error getting printer status:', error);
      this._printerStatus$.next(null);
    }
  }

  /**
   * Test printer connection
   */
  testPrinter(): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      if (!this.isAndroidEnvironment) {
        observer.next({ success: false, message: 'Android environment not available' });
        observer.complete();
        return;
      }

      try {
        const result = window.AndroidPrinter.testPrinter();
        const response = JSON.parse(result);
        observer.next({
          success: response.status === 'success',
          message: response.message
        });
      } catch (error) {
        observer.next({
          success: false,
          message: `Test failed: ${error}`
        });
      }
      observer.complete();
    });
  }

  /**
   * Print receipt - now expects FormattedReceiptData from KitchenReceiptService
   */
  printReceipt(receiptData: FormattedReceiptData): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      if (!this.isAndroidEnvironment) {
        observer.next({ success: false, message: 'Android environment not available' });
        observer.complete();
        return;
      }

      try {
        // The receiptData is already formatted by KitchenReceiptService
        const result = window.AndroidPrinter.printReceipt(JSON.stringify(receiptData));
        const response = JSON.parse(result);
        observer.next({
          success: response.status === 'success',
          message: response.message
        });
      } catch (error) {
        observer.next({
          success: false,
          message: `Print failed: ${error}`
        });
      }
      observer.complete();
    });
  }

  /**
   * Check if user is authenticated in Android
   */
  isAuthenticated(): boolean {
    const authStatus = this._authStatus$.value;
    return authStatus?.hasToken ?? false;
  }

  /**
   * Check if printer monitoring is active
   */
  isMonitoring(): boolean {
    const authStatus = this._authStatus$.value;
    return authStatus?.isMonitoring ?? false;
  }
} 