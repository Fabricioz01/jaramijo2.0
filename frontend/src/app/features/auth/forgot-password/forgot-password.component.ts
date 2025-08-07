import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  emailSent = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = false;

      this.authService.requestPasswordReset(this.forgotPasswordForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = true;
            this.emailSent = this.forgotPasswordForm.value.email;
          } else {
            this.error = response.message || 'Error al procesar la solicitud';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al procesar la solicitud';
        },
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
