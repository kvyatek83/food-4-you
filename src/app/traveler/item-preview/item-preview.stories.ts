import { type Meta, type StoryObj } from '@storybook/angular';
import { ItemPreviewComponent } from './item-preview.component';

const meta: Meta<ItemPreviewComponent> = {
  title: 'Components/Item Preview',
  component: ItemPreviewComponent,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<ItemPreviewComponent>;

export const Info: Story = {
  args: {
    cartItem: {
      itemUuid: 'abf10e00-db83-4e24-a94a-37ec3d3a6b2c',
      item: {
        uuid: 'abf10e00-db83-4e24-a94a-37ec3d3a6b2c',
        enName: 'Shakshuka',
        heName: 'שקשוקה',
        esName: 'Shakshuka',
        enDetails:
          'Includes homemade bread, hummus, tahini, and Israeli salad.',
        heDetails: 'כולל לחם ביתי, חומוס, טחינה וסלט ישראלי.',
        esDetails: 'Incluye pan casero, hummus, tahini y ensalada israelí.',
        imageUrl: '/items/shakshuka.jpg',
        price: 6.99,
      },
      items: new Map<string, string[]>([
        ['1738244030592_ax4iyjk8m', []],
        ['1738244032763_i0fs1ujyp', []],
      ]),
    },
  },
};
