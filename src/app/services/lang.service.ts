import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, startWith } from 'rxjs';

export type LanguageType = 'en' | 'es' | 'he';
export type LanguageCode = 'EN' | 'ES' | 'HE';
export type LanguageName = 'English' | 'Español' | 'עברית';
export type LanguageIcon = '🇺🇸' | '🇪🇸' | '🇮🇱';
export type LanguageDirection = 'rtl' | 'ltr';

export interface SupportedLanguages {
  languageType: LanguageType;
  languageCode: LanguageCode;
  languageName: LanguageName;
  languageIcon: LanguageIcon;
}
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly languageMap = new Map<LanguageType, LanguageDirection>([
    ['en', 'ltr'],
    ['es', 'ltr'],
    ['he', 'rtl'],
  ]);
  private _rtl$ = new BehaviorSubject<boolean>(false);
  private _currentLanguage$ = new BehaviorSubject<LanguageType>(
    (localStorage.getItem('locale') as LanguageType) || 'en'
  );
  private _supportedLanguages = new Map<LanguageType, SupportedLanguages>([
    [
      'en',
      {
        languageType: 'en',
        languageCode: 'EN',
        languageName: 'English',
        languageIcon: '🇺🇸',
      },
    ],
    [
      'es',
      {
        languageType: 'es',
        languageCode: 'ES',
        languageName: 'Español',
        languageIcon: '🇪🇸',
      },
    ],
    [
      'he',
      {
        languageType: 'he',
        languageCode: 'HE',
        languageName: 'עברית',
        languageIcon: '🇮🇱',
      },
    ],
  ]);

  get rtl$(): Observable<boolean> {
    return this._rtl$.asObservable();
  }

  get rtl(): boolean {
    return this._rtl$.value;
  }

  get currentLanguage$(): Observable<LanguageType> {
    return this._currentLanguage$.asObservable();
  }

  get currentLanguage(): LanguageType {
    return this._currentLanguage$.value;
  }

  get supportedLanguages(): SupportedLanguages[] {
    return [...this._supportedLanguages.values()];
  }

  get activeSupportedLanguages(): SupportedLanguages | undefined {
    return this._supportedLanguages.get(
      (this.translate.currentLang ||
        localStorage.getItem('locale') ||
        'en') as LanguageType
    );
  }

  constructor(private translate: TranslateService) {
    const lang =
      this.translate.currentLang || localStorage.getItem('locale') || 'en';
    const translations = this.translate.translations[lang];
    this.translate.onLangChange
      .pipe(startWith({ lang, translations }))
      .subscribe((event: LangChangeEvent) => {
        const langDirection = this.languageMap.get(event.lang as LanguageType);
        this._rtl$.next(langDirection === 'rtl');
        this._currentLanguage$.next(event.lang as LanguageType);
      });
  }

  getActiveLanguage(): LanguageType {
    return this.translate.currentLang as LanguageType;
  }
}
