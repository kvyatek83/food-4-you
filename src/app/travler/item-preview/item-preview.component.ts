import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { Observable } from 'rxjs';
import { LanguageType, LanguageService } from '../../services/lang.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-item-preview',
  imports: [
    CommonModule,
    MaterialModule,
    LanguageDirectionDirective,
    PropertiesTranslationPipe,
    TranslateModule,
  ],
  templateUrl: './item-preview.component.html',
  styleUrl: './item-preview.component.scss',
})
export class ItemPreviewComponent {
  @Input() cartItem: CartItem | undefined;
  @Input() expanded = true;

  @Output() opened = new EventEmitter<number>();

  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.lang$ = this.languageService.currentLanguage$;
  }
}
