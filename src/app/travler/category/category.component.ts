import { Component, Input, OnInit } from '@angular/core';
import { Category } from '../travler.model';
import { CommonModule } from '@angular/common';
import { ItemComponent } from '../item/item.component';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { Observable } from 'rxjs';
import { LanguageService, LanguageType } from '../../services/lang.service';

@Component({
  selector: 'app-category',
  imports: [CommonModule, ItemComponent, PropertiesTranslationPipe],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit {
  @Input() category: Category | undefined;
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.lang$ = this.languageService.currentLanguage$;
  }
}
