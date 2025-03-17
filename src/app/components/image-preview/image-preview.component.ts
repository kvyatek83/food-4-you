import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-image-preview',
  imports: [CommonModule],
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.scss',
})
export class ImagePreviewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() attachment: File | undefined;

  imageLoaded: boolean | null = null;
  imageUrl: string | null = null;

  ngOnInit(): void {
    this.setupPreview();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setupPreview();
  }

  ngOnDestroy(): void {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }

  private setupPreview(): void {
    if (this.attachment && this.attachment.type.startsWith('image/')) {
      this.imageUrl = URL.createObjectURL(this.attachment);

      const img = new Image();
      img.src = this.imageUrl;
      img.onload = () => {
        this.imageLoaded = true;
      };
    } else {
      this.imageUrl = null;
    }
  }
}
