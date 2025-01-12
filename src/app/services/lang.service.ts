import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type LanguageType = 'en' | 'es' | 'he';
type LanguageDirection = 'rtl' | 'ltr';

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

  get rtl$(): Observable<boolean> {
    return this._rtl$.asObservable();
  }

  get rtl(): boolean {
    return this._rtl$.value;
  }

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const langDirection = this.languageMap.get(event.lang as LanguageType);
      this._rtl$.next(langDirection === 'rtl');
    });
  }

  getActiveLanguage(): LanguageType {
    return this.translate.currentLang as LanguageType;
  }
}
