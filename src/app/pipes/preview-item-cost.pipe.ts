import { Pipe, PipeTransform } from '@angular/core';
import { CartItem, CartService } from '../services/cart.service';

@Pipe({
  name: 'previewItemCost',
  pure: false,
})
export class PreviewItemCostPipe implements PipeTransform {
  constructor(private cartService: CartService) {}
  transform(value?: CartItem, permutationUuids?: string[]): string {
    return value
      ? this.cartService.calcCartItemCost(value, permutationUuids)
      : '0.0 GTQ';
  }
}
