import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/lang.service';
import {
  NotificationsService,
  NotificationType,
  Notification,
} from '../../services/notifications.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

type NotificationTitle = 'info' | 'success' | 'warning' | 'error';
type NotificationIcon =
  | 'info_outline'
  | 'done'
  | 'warning_amber_outline'
  | 'close_outline';
type NotificationColor = '#4070f4' | '#12c99b' | '#f2a600' | '#e41749';

interface NotificationConfigurations {
  title: NotificationTitle;
  icon: NotificationIcon;
  color: NotificationColor;
}

@Component({
  selector: 'app-notification',
  imports: [CommonModule, MaterialModule, TranslateModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('showHideNotification', [
      state(
        'hide',
        style({
          transform: 'translateX(calc(100vw + 30px))',
        })
      ),
      state(
        'show',
        style({
          transform: 'translateX(0)',
        })
      ),
      transition('show => hide', [animate('0.5s')]),
      transition('hide => show', [animate('0.2s')]),
    ]),
  ],
})
// export class NotificationComponent {
export class NotificationComponent implements OnDestroy {
  private readonly NOTIFICATIONS = new Map<
    NotificationType,
    NotificationConfigurations
  >([
    [
      'INFO',
      {
        title: 'info',
        color: '#4070f4',
        icon: 'info_outline',
      },
    ],
    [
      'ERROR',
      {
        title: 'error',
        color: '#e41749',
        icon: 'close_outline',
      },
    ],
    [
      'SUCCESS',
      {
        title: 'success',
        color: '#12c99b',
        icon: 'done',
      },
    ],
    [
      'WARNING',
      {
        title: 'warning',
        color: '#f2a600',
        icon: 'warning_amber_outline',
      },
    ],
  ]);
  show = false;
  initNotificationBox: boolean = false;
  showNotification: 'hide' | 'show' = 'hide';
  isRtl = false;
  title: NotificationTitle | undefined;
  icon: NotificationIcon | undefined;
  color: NotificationColor | undefined;
  message: string | undefined;
  private notificationShowId: NodeJS.Timeout | undefined;
  private destroy$: Subject<void> = new Subject();
  constructor(
    private languageService: LanguageService,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {
    // TODO: fix notification should override the previous one
    setTimeout(() => {
      this.initNotificationBox = true;
    }, 0);
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => (this.isRtl = rtl));
    this.notificationsService.notification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification: Notification | null) => {
        if (!!notification) {
          const currentNotification = this.NOTIFICATIONS.get(notification.type);
          this.message = notification.message;
          this.title = this.translate.instant(
            `notifications.title.${currentNotification?.title}`
          );
          this.icon = currentNotification?.icon;
          this.color = currentNotification?.color;
          this.show = true;
          setTimeout(() => (this.showNotification = 'show'), 100);
          this.notificationShowId = setTimeout(() => {
            this.showNotification = 'hide';
            this.notificationsService.setNotification(null);
            setTimeout(() => (this.show = false), 1000);
          }, 5000);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    this.showNotification = 'hide';
    setTimeout(() => (this.show = false), 1000);
    clearTimeout(this.notificationShowId);
    this.notificationsService.setNotification(null);
  }
}
