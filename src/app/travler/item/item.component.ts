import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../travler.model';
import { Observable } from 'rxjs';
import { LanguageService, LanguageType } from '../../services/lang.service';
import { CommonModule } from '@angular/common';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { MaterialModule } from '../../material.module';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-item',
  imports: [
    CommonModule,
    MaterialModule,
    LanguageDirectionDirective,
    PropertiesTranslationPipe,
  ],
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
})
export class ItemComponent implements OnInit {
  @Input() item: Item | undefined;

  public lang$: Observable<LanguageType> | undefined;

  constructor(
    private languageService: LanguageService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.lang$ = this.languageService.currentLanguage$;
  }

  addItemToCart(item?: Item): void {
    // TODO: for complex item need popup for selection
    if (item) {
      this.cartService.addItem(item);
    }
  }
}
