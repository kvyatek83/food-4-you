import { type Meta, type StoryObj } from '@storybook/angular';
import { NoResultsComponent } from './no-results.component';

const meta: Meta<NoResultsComponent> = {
  title: 'Components/No Results',
  component: NoResultsComponent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<NoResultsComponent>;

export const Default: Story = {};

export const WithParams: Story = {
  args: {
    titleParams: 'Hi',
  },
};
