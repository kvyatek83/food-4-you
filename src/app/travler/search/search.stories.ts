import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NotificationsService } from '../../services/notifications.service';
import { BehaviorSubject } from 'rxjs';
import { SearchComponent } from './search.component';

const meta: Meta<SearchComponent> = {
  title: 'Components/Search',
  component: SearchComponent,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<SearchComponent>;

export const Info: Story = {};
