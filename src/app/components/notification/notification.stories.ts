import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NotificationComponent } from './notification.component';
import { LanguageService } from '../../services/lang.service';
import { NotificationsService } from '../../services/notifications.service';
import { BehaviorSubject } from 'rxjs';

// Mock services
const mockLanguageService = {
  rtl$: new BehaviorSubject<boolean>(false),
};

const mockNotificationsService = {
  notification$: new BehaviorSubject<any>(null),
  setNotification: (notification: any) => {
    mockNotificationsService.notification$.next(notification);
  },
};

const meta: Meta<NotificationComponent> = {
  title: 'Components/Notification',
  component: NotificationComponent,
  decorators: [
    moduleMetadata({
      providers: [
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    show: { control: 'boolean' },
    showNotification: {
      control: 'radio',
      options: ['show', 'hide'],
    },
  },
};

export default meta;
type Story = StoryObj<NotificationComponent>;

// Helper function to trigger notifications
const showNotification = (
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR',
  message: string
) => {
  mockNotificationsService.setNotification({
    type,
    message,
  });
};

export const Info: Story = {
  play: async () => {
    showNotification('INFO', 'This is an information message');
  },
};

export const Success: Story = {
  play: async () => {
    showNotification('SUCCESS', 'Operation completed successfully');
  },
};

export const Warning: Story = {
  play: async () => {
    showNotification('WARNING', 'Please review your input');
  },
};

export const Error: Story = {
  play: async () => {
    showNotification(
      'ERROR',
      'An error occurred while processing your request'
    );
  },
};

export const RTLSupport: Story = {
  play: async () => {
    mockLanguageService.rtl$.next(true);
    showNotification('INFO', 'This notification supports RTL languages');
  },
};

export const LongMessage: Story = {
  play: async () => {
    showNotification(
      'INFO',
      'This is a very long notification message that demonstrates how the component handles extended content. It should wrap properly and maintain its aesthetic appeal.'
    );
  },
};
