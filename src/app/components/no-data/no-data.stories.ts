import { type Meta, type StoryObj } from '@storybook/angular';
import { NoDataComponent } from './no-data.component';

const meta: Meta<NoDataComponent> = {
  title: 'Components/No Data',
  component: NoDataComponent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<NoDataComponent>;

export const Default: Story = {};
