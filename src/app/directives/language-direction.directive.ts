import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';
import { LanguageService } from '../services/lang.service';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appLanguageDirection]',
})
export class LanguageDirectionDirective {
  @HostBinding('class.rtl') rtl: boolean | undefined;
  @HostBinding('class.ltr') ltr: boolean | undefined;
  @Output() fileDropped = new EventEmitter<any>();

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
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
