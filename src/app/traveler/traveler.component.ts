import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from '../material.module';
import { LanguagePickerComponent } from '../components/language-picker/language-picker.component';
import { LanguageDirectionDirective } from '../directives/language-direction.directive';
import { HeaderActionsComponent } from './header-actions/header-actions.component';

@Component({
  selector: 'app-traveler',
  imports: [
    RouterOutlet,
    MaterialModule,
    HeaderActionsComponent,
    LanguageDirectionDirective,
    LanguagePickerComponent,
  ],
  templateUrl: './traveler.component.html',
  styleUrl: './traveler.component.scss',
})
export class TravelerComponent {}
