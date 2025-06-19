import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageDirection } from '../../services/lang.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LanguageDirectionDirective,
    TranslateModule,
    MatProgressSpinnerModule
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  signInForm: FormGroup;
  loading = false;
  showPassword = false;
  stickyLeft = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.signInForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.loading = true;
      this.signInForm.disable();
      this.authService
        .login(
          this.signInForm.get('username')?.value,
          this.signInForm.get('password')?.value
        )
        .pipe(take(1))
        .subscribe((allowed) => {
          if (allowed) {
            const authUser = window.localStorage.getItem('auth-user');
            if (authUser) {
              const token = JSON.parse(authUser);
              if (token) {
                const tokenPayload = JSON.parse(
                  window.atob(token.split('.')[1])
                );

                this.router.navigate([`/${tokenPayload.role}`]);
              }
            }
          } else {
            this.loading = false;
            this.signInForm.enable();
          }
        });
    } else {
      console.error('Form is invalid');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.stickyLeft = languageDirection === 'rtl';
  }
}