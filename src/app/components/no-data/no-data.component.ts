import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type DataTyep = 'category' | 'item' | 'add-on';

@Component({
  selector: 'app-no-data',
  imports: [CommonModule, TranslateModule],
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.scss',
})
export class NoDataComponent {
  @Input() type: DataTyep = 'category';
}
