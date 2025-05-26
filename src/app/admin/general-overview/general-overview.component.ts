import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, take } from 'rxjs';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { BackupService } from '../../services/backup.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';

@Component({
  selector: 'app-general-overview',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    ReactiveFormsModule,
    LanguageDirectionDirective,
    PropertiesTranslationPipe,
  ],
  templateUrl: './general-overview.component.html',
  styleUrls: ['./general-overview.component.scss'],
})
export class GeneralOverviewComponent implements OnInit {
  public backupList = new Map<string, string>();
  public lang$: Observable<LanguageType>;
  dir: LanguageDirection = 'ltr';

  // System Info
  systemInfo = {
    version: '1.0.0',
    dbVersion: '2.3.1',
    lastUpdated: new Date(),
  };

  // Configuration
  configForm: FormGroup;

  // Statistics
  orderStats = {
    today: {
      count: 45,
      revenue: 2345.5,
      averageValue: 52.12,
    },
    thisWeek: {
      count: 237,
      revenue: 12456.75,
      averageValue: 52.56,
    },
    thisMonth: {
      count: 982,
      revenue: 51234.6,
      averageValue: 52.17,
    },
  };

  // For backup operations
  isCreatingBackup = false;
  isRestoringBackup = false;
  selectedBackup: string | null = null;

  constructor(
    private backupService: BackupService,
    private languageService: LanguageService,
    private fb: FormBuilder
  ) {
    this.lang$ = this.languageService.currentLanguage$;

    // Initialize form
    this.configForm = this.fb.group({
      taxRate: [18],
      defaultCurrency: ['GTQ'],
      allowReservations: [true],
      maxItemsPerOrder: [50],
      notifyAdminOnNewOrder: [true],
    });
  }

  ngOnInit() {
    // Load backups
    this.loadBackups();
  }

  loadBackups() {
    this.backupService.backup$.subscribe((backups) => {
      console.log(backups);
      this.backupList.clear();

      backups?.forEach((backup) => {
        const split = backup.split('-');
        const dateParsed = new Date(Number(split[1]));
        const displayName = `${dateParsed.toLocaleDateString('en-US')} - ${
          dateParsed.getHours().toString().padStart(2, '0') +
          ':' +
          dateParsed.getMinutes().toString().padStart(2, '0')
        }`;
        this.backupList.set(backup, displayName);
      });
    });
  }

  createBackup() {
    this.isCreatingBackup = true;

    this.backupService
      .setBackup()
      .pipe(take(1))
      .subscribe(() => {
        this.isCreatingBackup = false;
      });
  }

  restoreBackup() {
    if (!this.selectedBackup) return;

    this.backupService
      .restoreBackup(this.selectedBackup)
      .pipe(take(1))
      .subscribe(() => {
        this.isRestoringBackup = false;
      });
  }

  saveConfig() {
    console.log('Saving config:', this.configForm.value);
    // Implement your save logic here
  }

  resetConfig() {
    this.configForm.reset({
      taxRate: 18,
      defaultCurrency: 'GTQ',
      allowReservations: true,
      maxItemsPerOrder: 50,
      notifyAdminOnNewOrder: true,
    });
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}