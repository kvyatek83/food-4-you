import { type Meta, type StoryObj } from '@storybook/angular';
import { ItemsPreviewComponent } from './items-preview.component';

const meta: Meta<ItemsPreviewComponent> = {
  title: 'Components/Items Preview',
  component: ItemsPreviewComponent,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<ItemsPreviewComponent>;

export const Default: Story = {
  args: {
    cartItems: [
      {
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
      {
        itemUuid: '547cb56d-7cfc-41f5-a1ba-dc3cbb186841',
        item: {
          uuid: '547cb56d-7cfc-41f5-a1ba-dc3cbb186841',
          enName: 'The Avocado Show',
          heName: 'מופע האבוקדו',
          esName: 'El Espectáculo del Aguacate',
          enDetails: 'Bagel with avocado, hard-boiled egg, and Israeli salad.',
          heDetails: 'באגט עם אבוקדו, ביצה קשה וסלט ישראלי.',
          esDetails: 'Bagel con aguacate, huevo duro y ensalada israelí.',
          imageUrl: '/items/avocado-show.jpg',
          price: 7.99,
        },
        items: new Map<string, string[]>([['1738244031709_r0eg062hq', []]]),
      },
      {
        itemUuid: 'd89eae5e-9e4b-4f02-b6ea-c6e81185b986',
        item: {
          uuid: 'd89eae5e-9e4b-4f02-b6ea-c6e81185b986',
          enName: 'Classic Burger',
          heName: 'המבורגר קלאסי',
          esName: 'Hamburguesa Clásica',
          enDetails: 'Juicy beef patty with fresh toppings',
          heDetails: 'קציצת בשר עסיסית עם תוספות טריות',
          esDetails: 'Hamburguesa jugosa con coberturas frescas',
          imageUrl: '/items/burger.jpg',
          price: 2.99,
        },
        items: new Map<string, string[]>([['1738244034370_6mgs9cjsm', []]]),
      },
    ],
  },
};
