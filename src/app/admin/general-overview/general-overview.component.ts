import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, take, Subscription } from 'rxjs';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { BackupService } from '../../services/backup.service';
import { ConfigurationService } from '../../services/configuration.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-general-overview',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    ReactiveFormsModule,
    LanguageDirectionDirective,
  ],
  templateUrl: './general-overview.component.html',
  styleUrls: ['./general-overview.component.scss'],
})
export class GeneralOverviewComponent implements OnInit, OnDestroy {
  public backupList = new Map<string, string>();
  public lang$: Observable<LanguageType>;
  dir: LanguageDirection = 'ltr';

  // Configuration
  configForm: FormGroup;

  // Printer status from database
  printerStatusFromDb: any = null;

  // For backup operations
  isCreatingBackup = false;
  isRestoringBackup = false;
  isDownloadingDatabase = false;
  selectedBackup: string | null = null;

  // For order statistics
  selectedTimeFrame: '1' | '7'| '30' = '7';
  orderStats: any = {
    totalOrders: 0,
    totalItems: 0,
    totalCategories: 0,
    totalRevenue: 0,
    topItems: []
  };
  isLoadingOrderStats = false;

  constructor(
    private backupService: BackupService,
    private languageService: LanguageService,
    private fb: FormBuilder,
    private configurationService: ConfigurationService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.lang$ = this.languageService.currentLanguage$;

    // Initialize form with only printer IP
    this.configForm = this.fb.group({
      printerIp: [''],
    });
  }

  ngOnInit() {
    // Load backups
    this.loadBackups();
    
    // Load current configuration
    this.loadConfiguration();
    
    // Load initial order statistics
    this.loadOrderStatistics(this.selectedTimeFrame);
  }

  ngOnDestroy() {
    // No subscriptions to clean up
  }

  loadBackups() {
    this.backupService.backup$.subscribe((backups) => {
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
      printerEnabled: true, // Keep printer enabled by default
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

  downloadDatabase() {
    this.isDownloadingDatabase = true;
    
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('No authentication token found');
      this.isDownloadingDatabase = false;
      return;
    }
    
    this.http.get('/api/admin/download/database', {
      headers: {
        'Authorization': token
      },
      responseType: 'blob'
    }).pipe(take(1)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const today = new Date().toISOString().split('T')[0];
        a.download = `app-${today}.db`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.isDownloadingDatabase = false;
        console.log('Database downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading database:', error);
        this.isDownloadingDatabase = false;
        // You might want to show a toast/snackbar error message here
      }
    });
  }

  loadOrderStatistics(value: '1' | '7'| '30') {
    this.isLoadingOrderStats = true;
    this.http.get(`/api/admin/order-statistics?timeFrame=${value}`).pipe(take(1)).subscribe({
      next: (data: any) => {
        this.orderStats = data;
      },
      error: (error) => {
        console.error('Error loading order statistics:', error);
      },
      complete: () => {
        this.isLoadingOrderStats = false;
      }
    });
  }

  onTimeFrameSelectionChange(event: any) {
    const newValue = event.value;
    this.selectedTimeFrame = newValue;
    this.loadOrderStatistics(newValue);
    console.log('Time frame selection changed to:', newValue);
  }
}