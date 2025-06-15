import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AndroidPrinterService } from '../../services/android-printer.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-printer-test-dialog',
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule
  ],
  templateUrl: './printer-test-dialog.component.html',
  styleUrls: ['./printer-test-dialog.component.scss']
})
export class PrinterTestDialogComponent {
  isTestingPrinter = false;
  testResult: { success: boolean; message: string } | null = null;

  constructor(
    private dialogRef: MatDialogRef<PrinterTestDialogComponent>,
    private androidPrinterService: AndroidPrinterService,
    public translate: TranslateService
  ) {}

  testPrinter() {
    if (!this.androidPrinterService.isAndroidEnvironment) {
      this.testResult = {
        success: false,
        message: this.translate.instant('printerTest.notAndroid')
      };
      return;
    }
    if (!this.androidPrinterService.isAuthenticated()) {
      this.testResult = {
        success: false,
        message: this.translate.instant('printerTest.notAuthenticated')
      };
      return;
    }
    this.isTestingPrinter = true;
    this.testResult = null;
    this.androidPrinterService.testPrinter().subscribe({
      next: (result) => {
        this.testResult = result;
        this.isTestingPrinter = false;
      },
      error: (error) => {
        this.testResult = {
          success: false,
          message: this.translate.instant('printerTest.testFailed', { error })
        };
        this.isTestingPrinter = false;
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
} 