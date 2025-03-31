import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, take } from 'rxjs';
import { LanguageType, LanguageService } from '../../services/lang.service';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { CommonModule } from '@angular/common';
import { Category, Item } from '../../travler/travler.models';

type DeleteTyep = 'category' | 'item' | 'add-on';

@Component({
  selector: 'app-delete-confirmation-modal',
  imports: [
    CommonModule,
    TranslateModule,
    MaterialModule,
    PropertiesTranslationPipe,
    LanguageDirectionDirective,
  ],
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrl: './delete-confirmation-modal.component.scss',
})
export class DeleteConfirmationModalComponent {
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();
  public type: DeleteTyep | undefined;
  public usedAmund: number | undefined;
  public objectToDelete: Category | Item | undefined;
  public cbPennding = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type?: DeleteTyep;
      cb: (obj?: Category | Item) => Observable<any>;
      objectToDelete: Category | Item;
      usedAmund?: number;
    },
    private dialogRef: MatDialogRef<DeleteConfirmationModalComponent>,
    private languageService: LanguageService
  ) {
    this.type = this.data.type;
    this.objectToDelete = this.data.objectToDelete;
    this.usedAmund = this.data.usedAmund;
    this.lang$ = this.languageService.currentLanguage$;
  }

  onSubmit(): void {
    this.cbPennding = true;
    this.dialogRef.disableClose = true;

    this.data
      .cb(this.objectToDelete)
      .pipe(take(1))
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }
}
