import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';
import { LanguageDirection, LanguageService } from '../services/lang.service';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appLanguageDirection]',
})
export class LanguageDirectionDirective {
  @HostBinding('class.rtl') rtl: boolean | undefined;
  @HostBinding('class.ltr') ltr: boolean | undefined;
  @Output() languageChanged = new EventEmitter<LanguageDirection>();

  private destroy$: Subject<void> = new Subject();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.rtl$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rtl) => {
        if (rtl) {
          this.rtl = true;
          this.ltr = false;
        } else {
          this.ltr = true;
          this.rtl = false;
        }

        if (this.languageChanged) {
          this.languageChanged.emit(rtl ? 'rtl' : 'ltr');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
