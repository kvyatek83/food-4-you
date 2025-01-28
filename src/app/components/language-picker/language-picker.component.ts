import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  LanguageService,
  SupportedLanguages,
} from '../../services/lang.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { ClickOutsideDirective } from '../../directives/outside.directive';

@Component({
  selector: 'app-language-picker',
  imports: [CommonModule, LanguageDirectionDirective, ClickOutsideDirective],
  templateUrl: './language-picker.component.html',
  styleUrl: './language-picker.component.scss',
})
export class LanguagePickerComponent implements OnInit {
  isOpen = false;
  languages: SupportedLanguages[] | undefined;
  currentLanguage: SupportedLanguages | undefined;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languages = this.languageService.supportedLanguages;
    this.currentLanguage = this.languageService.activeSupportedLanguages;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  selectLanguage(lang: SupportedLanguages): void {
    this.currentLanguage = lang;
    this.isOpen = false;
    localStorage.setItem('locale', lang.languageType);
    this.translate.use(lang.languageType);
  }
}
