import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { NotificationsService } from './notifications.service';
import { TranslateService } from '@ngx-translate/core';

interface Backup {
  printerId: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private _backup$ = new BehaviorSubject<string[] | null>(null);

  get backup$(): Observable<string[] | null> {
    return this._backup$.asObservable();
  }

  get backup(): string[] | null {
    return this._backup$.value;
  }

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {
    this.getBackups().subscribe();
  }

  getBackups(): Observable<boolean> {
    return this.http.get<any>('/api/admin/backups').pipe(
      tap((a: any) => {
        console.log(a);
        this._backup$.next(a.map((b: any) => b.Key));
      }),
      map((a: any) => {
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

  setBackup(): Observable<boolean> {
    return this.http
      .post('/api/admin/backup', null, { responseType: 'text' })
      .pipe(
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
        }),
        switchMap(() => this.getBackups())
      );
  }

  restoreBackup(backupKey: string): Observable<boolean> {
    return this.http
      .post(
        '/api/admin/restore',
        {
          backupKey,
        },
        { responseType: 'text' }
      )
      .pipe(
        map(() => true),
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
