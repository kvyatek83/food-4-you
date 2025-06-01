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
import { ConfigurationService } from '../../services/configuration.service';
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

  // Printer status from database
  printerStatusFromDb: any = null;

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
    private fb: FormBuilder,
    private configurationService: ConfigurationService
  ) {
    this.lang$ = this.languageService.currentLanguage$;

    // Initialize form
    this.configForm = this.fb.group({
      printerIp: [''],
      printerEnabled: [true],
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
    
    // Load current configuration
    this.loadConfiguration();
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
    const formValue = this.configForm.value;
    const configToSave = {
      printerIp: formValue.printerIp || null,
      printerEnabled: formValue.printerEnabled,
    };
    
    this.configurationService.setVariables(configToSave).pipe(take(1)).subscribe((success) => {
      if (success) {
        console.log('Configuration saved successfully');
        // Configuration will be picked up by Android automatically
      }
    });
  }

  resetConfig() {
    this.configForm.reset({
      printerIp: '',
      printerEnabled: true,
      taxRate: 18,
      defaultCurrency: 'GTQ',
      allowReservations: true,
      maxItemsPerOrder: 50,
      notifyAdminOnNewOrder: true,
    });
  }

  refreshPrinterStatus() {
    // Refresh configuration to get latest printer status from database
    this.loadConfiguration();
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }

  loadConfiguration() {
    this.configurationService.getVariables().pipe(take(1)).subscribe(() => {
      const config = this.configurationService.configurations;
      if (config) {
        this.configForm.patchValue({
          printerIp: config.printerIp || '',
          printerEnabled: config.printerEnabled,
        });
        
        // Store printer status from database
        this.printerStatusFromDb = {
          available: config.printerAvailable,
          enabled: config.printerEnabled,
          ip: config.printerIp,
          lastError: config.lastPrinterError,
          lastStatusCheck: config.lastStatusCheck,
          lastPrintAttempt: config.lastPrintAttempt,
          lastPrintSuccess: config.lastPrintSuccess,
          lastPrintError: config.lastPrintError
        };
      }
    });
  }

  // TODO: need to test this
  getPrinterStatusIcon(status: any): string {
    if (!status) return 'print_disabled';
    if (!status.enabled) return 'print_disabled';
    if (status.available === true) return 'print';
    if (status.available === false) return 'print_error';
    return 'help_outline'; // Unknown status
  }

  getPrinterStatusColor(status: any): string {
    if (!status) return 'warn';
    if (!status.enabled) return 'warn';
    if (status.available === true) return 'primary';
    if (status.available === false) return 'warn';
    return 'accent'; // Unknown status
  }

  getPrinterStatusMessage(status: any): string {
    if (!status) return 'No status available';
    if (!status.enabled) return 'Printer disabled';
    if (status.available === true) return 'Printer ready';
    if (status.available === false) return status.lastError || 'Printer not available';
    return 'Status unknown';
  }
}