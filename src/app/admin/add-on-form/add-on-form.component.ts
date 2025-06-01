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
import { Observable, take } from 'rxjs';
import { MaterialModule } from '../../material.module';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { AddOn } from '../../traveler/traveler.models';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-on-form',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    LanguageDirectionDirective,
    TranslateModule,
  ],
  templateUrl: './add-on-form.component.html',
  styleUrl: './add-on-form.component.scss',
})
export class AddOnFormComponent {
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();
  public addOnForm!: FormGroup;
  public dir: LanguageDirection = 'ltr';
  cbPennding = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      addOn?: AddOn;
      cb: (data: { addOn: AddOn }) => Observable<any>;
    },
    private dialogRef: MatDialogRef<AddOnFormComponent>,
    private languageService: LanguageService,
    private fb: FormBuilder
  ) {
    this.lang$ = this.languageService.currentLanguage$;
    this.initForm();
  }

  private initForm(): void {
    this.addOnForm = this.fb.group({
      uuid: [this.data.addOn?.uuid || ''],
      enName: [this.data.addOn?.enName || '', Validators.required],
      heName: [this.data.addOn?.heName || '', Validators.required],
      esName: [this.data.addOn?.esName || '', Validators.required],
      inStock: [this.data.addOn?.inStock || true],
    });
  }

  onSubmit(): void {
    if (this.addOnForm.valid) {
      this.cbPennding = true;
      this.dialogRef.disableClose = true;

      console.log(this.addOnForm.value);

      this.data
        .cb(this.addOnForm.value)
        .pipe(take(1))
        .subscribe(() => {
          this.dialogRef.close(true);
        });
    }
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}