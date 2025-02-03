import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from '../material.module';
import { LanguagePickerComponent } from '../components/language-picker/language-picker.component';
import { LanguageDirectionDirective } from '../directives/language-direction.directive';
import { HeaderActionsComponent } from './header-actions/header-actions.component';

@Component({
  selector: 'app-travler',
  imports: [
    RouterOutlet,
    MaterialModule,
    HeaderActionsComponent,
    LanguageDirectionDirective,
    LanguagePickerComponent,
  ],
  templateUrl: './travler.component.html',
  styleUrl: './travler.component.scss',
})
export class TravlerComponent {}
