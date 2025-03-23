import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../material.module';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { Category } from '../../travler/travler.models';
import { LoadFileComponent } from '../../components/load-file/load-file.component';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-category-form',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    LoadFileComponent,
    LanguageDirectionDirective,
    TranslateModule,
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent {
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();
  public categoryForm!: FormGroup;
  public categoryImage: File | undefined;
  public dir: LanguageDirection = 'ltr';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { category?: Category },
    private dialogRef: MatDialogRef<CategoryFormComponent>,
    private languageService: LanguageService,
    private fb: FormBuilder
  ) {
    this.lang$ = this.languageService.currentLanguage$;
    this.initForm();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      uuid: [this.data.category?.uuid || ''],
      type: [this.data.category?.type || ''],
      enName: [this.data.category?.enName || '', Validators.required],
      heName: [this.data.category?.heName || '', Validators.required],
      esName: [this.data.category?.esName || '', Validators.required],
      imageUrl: [this.data.category?.imageUrl || ''],
    });
  }

  onSubmit(): void {
    if (
      this.categoryForm.valid &&
      (this.categoryForm.controls['imageUrl'].value || this.categoryImage)
    ) {
      const formData = {
        category: this.categoryForm.value,
        image: this.categoryImage,
      };
      this.dialogRef.close(formData);
    }
  }

  imageChanged(file: File): void {
    const formData = new FormData();
    formData.set('file', file, file.name);
    this.categoryImage = file;
  }

  imageRemoved(): void {
    this.categoryImage = undefined;
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}
