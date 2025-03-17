import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { AddOn, Category } from '../../travler/travler.models';
import { ItemsService } from '../../services/items.service';
import { combineLatest } from 'rxjs';
import { LoadFileComponent } from '../../components/load-file/load-file.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-item-form',
  imports: [MaterialModule, LoadFileComponent],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
})
export class ItemFormComponent {
  // readonly dialog = inject(MatDialog);

  // a: Item;
  categories: Category[] = [];
  addOns = new Map<string, AddOn>();

  constructor(private itemsService: ItemsService) {
    combineLatest([this.itemsService.addOns$, this.itemsService.allItems$])
      // .pipe(filter(([addOns, allItems]) => !!addOns?.size))
      .subscribe(([addOns, allItems]) => {
        this.categories = allItems;
        this.addOns = addOns;
      });

    // const dialogRef = this.dialog.open(LoadFileComponent, {
    //   width: '70%',
    //   data: {
    //     uploadType: 'remote',
    //   },
    // });

    // dialogRef
    //   .afterClosed()

    //   .subscribe((a) => {
    //     console.log(a);
    //   });
  }

  fileChanged(file: File): void {
    console.log(file);
    const formData = new FormData();
    formData.set('file', file, file.name);
    console.log(formData);
  }

  fileRemoved(): void {}

  saveNewItem(): void {
    // this.itemsService.createNewItem()
  }
}
