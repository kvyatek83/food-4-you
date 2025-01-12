import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './components/notification/notification.component';
import { MaterialModule } from './material.module';
import { NotificationsService } from './services/notifications.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NotificationComponent,
    TranslateModule,
    CommonModule,
    MaterialModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'food-4-you';

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit() {
    setTimeout(() => {
      this.notificationsService.setNotification({
        type: 'ERROR',
        message: 'Test test 123',
      });
    }, 2000);
  }
}
