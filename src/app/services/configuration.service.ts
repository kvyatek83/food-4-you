import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { TranslateService } from '@ngx-translate/core';

interface Configuration {
  id?: number;
  printerIp: string | null;
  printerEnabled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private _configurations$ = new BehaviorSubject<Configuration | null>(null);

  get configurations$(): Observable<Configuration | null> {
    return this._configurations$.asObservable();
  }

  get configurations(): Configuration | null {
    return this._configurations$.value;
  }

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {}

  getVariables(): Observable<boolean> {
    return this.http.get<Configuration>('/api/admin/config').pipe(
      tap((config: Configuration) => {
        this._configurations$.next(config);
      }),
      map((_: Configuration) => {
        return true;
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

  setVariables(config: Configuration): Observable<boolean> {
    return this.http.post<Configuration>('/api/admin/config', config).pipe(
      tap((config: Configuration) => {
        this._configurations$.next(config);
      }),
      map((_: Configuration) => {
        return true;
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
}