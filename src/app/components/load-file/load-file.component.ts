import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { DndDirective } from '../../directives/dnd.directive';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';

@Component({
  selector: 'load-file',
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    DndDirective,
    ImagePreviewComponent,
  ],
  templateUrl: './load-file.component.html',
  styleUrls: ['./load-file.component.scss'],

  animations: [
    trigger('slideState', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate(
          '0.5s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '0.2s ease-in',
          style({ opacity: 0, transform: 'translateX(-100%)' })
        ),
      ]),
    ]),
  ],
})
export class LoadFileComponent implements OnDestroy {
  showPreview = false;
  currentFile: any = null;
  doneUploadFiles = true;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  constructor(private translate: TranslateService) {
    // Subscribe to your RTL service if needed or set a default value.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileDropped(event: any) {
    if (event && event.length > 0) {
      this.prepareFile(event[0]); // Only take the first file
    }
  }

  fileBrowseHandler(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.prepareFile(event.target.files[0]); // Only take the first file
    }
  }

  deleteFile() {
    this.showPreview = false;
    setTimeout(() => {
      this.currentFile = null;
      this.doneUploadFiles = true;
    }, 200);
    this.fileRemoved.emit();
  }

  simulateUpload() {
    if (!this.currentFile) return;

    this.doneUploadFiles = false;
    this.currentFile.progress = 0;

    const progressInterval = setInterval(() => {
      if (this.currentFile && this.currentFile.progress < 100) {
        this.currentFile.progress += 5;
      } else {
        clearInterval(progressInterval);
        this.doneUploadFiles = true;

        if (this.currentFile) {
          this.fileSelected.emit(this.currentFile);
        }
      }
    }, 100);
  }

  prepareFile(file: File) {
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if (acceptedTypes.includes(file.type)) {
      // Replace any existing file
      this.currentFile = file;
      setTimeout(() => {
        this.showPreview = true;
      }, 200);
      this.currentFile.progress = 0;
      this.simulateUpload();
    } else {
      // Show error notification
      console.error(this.translate.instant('notifications.errors.fileFormat'));
      // You can add a toast notification here
    }
  }

  formatBytes(bytes: number, decimals: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
