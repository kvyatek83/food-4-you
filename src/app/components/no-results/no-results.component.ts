import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-no-results',
  imports: [CommonModule, TranslateModule],
  templateUrl: './no-results.component.html',
  styleUrl: './no-results.component.scss',
})
export class NoResultsComponent {
  @Input() titleParams: string | null | undefined;
  @Input() subtitle: string | undefined;
}
