import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { AndroidPrinterService } from './android-printer.service';

interface AuthResponse {
  auth: boolean;
  token: string;
}

export interface GuestDetails {
  confirmation: boolean;
  email?: string;
  hebrewname: string;
  id: string;
  participants: string;
  phone: string;
  transport: boolean;
  username?: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _currentUser$ = new BehaviorSubject<User | null>(null);

  get currentUser$(): Observable<User | null> {
    return this._currentUser$.asObservable();
  }

  get currentUser(): User | null {
    return this._currentUser$.value;
  }

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private androidPrinterService: AndroidPrinterService
  ) {
    this.checkExistingAuth();
  }

  private checkExistingAuth(): void {
    const authUser = window.localStorage.getItem('auth-user');
    if (authUser) {
      try {
        const token = JSON.parse(authUser);
        if (token && this.isTokenValid(token)) {
          const user = this.decodeToken(token);
          this._currentUser$.next(user);
          
          // Pass token to Android if in Android environment
          if (this.androidPrinterService.isAndroidEnvironment) {
            this.androidPrinterService.setAuthToken(token);
          }
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error checking existing auth:', error);
        this.logout();
      }
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return {
        id: payload.id,
        username: payload.username || 'Unknown',
        role: payload.role
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>('/api/login', { username, password })
      .pipe(
        tap((authResponse: AuthResponse) => {
          // Store token in localStorage
          window.localStorage.removeItem('auth-user');
          window.localStorage.setItem(
            'auth-user',
            JSON.stringify(authResponse.token)
          );

          // Decode and set current user
          const user = this.decodeToken(authResponse.token);
          this._currentUser$.next(user);

          // Pass token to Android if in Android environment
          if (this.androidPrinterService.isAndroidEnvironment) {
            const success = this.androidPrinterService.setAuthToken(authResponse.token);
            if (success) {
              console.log('Token successfully passed to Android');
            } else {
              console.warn('Failed to pass token to Android');
            }
          }
        }),
        map((authResponse: AuthResponse) => {
          return authResponse.auth;
        }),
        catchError((error) => {
          if (error.status === 404) {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translate.instant(
                `notifications.errors.${error.error.message}`,
                { user: error.error.params }
              ),
            });
          } else if (error.status === 401) {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translate.instant(
                `notifications.errors.${error.error.message}`,
                { user: error.error.params }
              ),
            });
          } else {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translate.instant('notifications.errors.general'),
            });
          }

          console.error(error);
          return of(false);
        })
      );
  }

  logout(): void {
    // Clear token from localStorage
    window.localStorage.removeItem('auth-user');
    
    // Clear current user
    this._currentUser$.next(null);

    // Clear token from Android if in Android environment
    if (this.androidPrinterService.isAndroidEnvironment) {
      const success = this.androidPrinterService.clearAuthToken();
      if (success) {
        console.log('Token successfully cleared from Android');
      } else {
        console.warn('Failed to clear token from Android');
      }
    }
  }

  isAuthenticated(): boolean {
    return this._currentUser$.value !== null;
  }

  hasRole(role: string): boolean {
    const user = this._currentUser$.value;
    return user?.role === role;
  }

  getToken(): string | null {
    const authUser = window.localStorage.getItem('auth-user');
    if (authUser) {
      try {
        return JSON.parse(authUser);
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}
