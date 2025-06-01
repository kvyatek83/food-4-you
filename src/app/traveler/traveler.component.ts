import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from '../material.module';
import { LanguagePickerComponent } from '../components/language-picker/language-picker.component';
import { LanguageDirectionDirective } from '../directives/language-direction.directive';
import { HeaderActionsComponent } from './header-actions/header-actions.component';
import { CommonModule } from '@angular/common';
import { AndroidPrinterService } from '../services/android-printer.service';

// TODO: need to test
@Component({
  selector: 'app-traveler',
  imports: [
    CommonModule,
    RouterOutlet,
    MaterialModule,
    HeaderActionsComponent,
    LanguageDirectionDirective,
    LanguagePickerComponent,
  ],
  templateUrl: './traveler.component.html',
  styleUrl: './traveler.component.scss',
})
export class TravelerComponent {
  // Easter egg properties
  private candleClickCount = 0;
  private readonly CLICKS_TO_ACTIVATE = 7; // Number of clicks to activate easter egg
  showTestPrinter = false;
  isTestingPrinter = false;
  testResult: { success: boolean; message: string } | null = null;

  constructor(private androidPrinterService: AndroidPrinterService) {}

  onCandleClick() {
    this.candleClickCount++;
    
    if (this.candleClickCount >= this.CLICKS_TO_ACTIVATE) {
      this.showTestPrinter = true;
      this.candleClickCount = 0; // Reset counter
    }
    
    // Reset counter after 3 seconds if not enough clicks
    setTimeout(() => {
      if (this.candleClickCount < this.CLICKS_TO_ACTIVATE) {
        this.candleClickCount = 0;
      }
    }, 3000);
  }

  hideTestPrinter() {
    this.showTestPrinter = false;
    this.testResult = null;
  }

  testPrinter() {
    if (!this.androidPrinterService.isAndroidEnvironment) {
      this.testResult = {
        success: false,
        message: 'Not running in Android environment'
      };
      return;
    }

    if (!this.androidPrinterService.isAuthenticated()) {
      this.testResult = {
        success: false,
        message: 'Not authenticated - please log in first'
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
          message: `Test failed: ${error}`
        };
        this.isTestingPrinter = false;
      }
    });
  }
}
