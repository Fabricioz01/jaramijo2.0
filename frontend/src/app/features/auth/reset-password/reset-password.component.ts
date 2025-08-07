import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  token = '';
  tokenValid = false;
  checkingToken = true;
  userInfo: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    
    if (!this.token) {
      this.error = 'Token no proporcionado';
      this.checkingToken = false;
      return;
    }

    this.verifyToken();
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  verifyToken(): void {
    this.checkingToken = true;
    this.authService.verifyResetToken(this.token).subscribe({
      next: (response) => {
        this.checkingToken = false;
        if (response.success && response.data?.valid) {
          this.tokenValid = true;
          this.userInfo = response.data.user;
        } else {
          this.tokenValid = false;
          this.error = 'Token inválido o expirado';
        }
      },
      error: (error) => {
        this.checkingToken = false;
        this.tokenValid = false;
        this.error = error.error?.message || 'Token inválido o expirado';
      },
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.tokenValid) {
      this.loading = true;
      this.error = '';

      const resetData = {
        token: this.token,
        password: this.resetPasswordForm.value.password,
        confirmPassword: this.resetPasswordForm.value.confirmPassword,
      };

      this.authService.resetPassword(resetData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = true;
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          } else {
            this.error = response.message || 'Error al restablecer la contraseña';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'Error al restablecer la contraseña';
        },
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  get passwordMismatch() {
    return this.resetPasswordForm.hasError('passwordMismatch') && 
           this.confirmPassword?.touched;
  }

  getPasswordStrength(): number {
    const password = this.password?.value || '';
    let strength = 0;
    
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return strength;
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 25) return 'bg-danger';
    if (strength <= 50) return 'bg-warning';
    if (strength <= 75) return 'bg-info';
    return 'bg-success';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 25) return 'Muy débil';
    if (strength <= 50) return 'Débil';
    if (strength <= 75) return 'Buena';
    return 'Muy segura';
  }

  getPasswordStrengthTextClass(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 25) return 'text-danger';
    if (strength <= 50) return 'text-warning';
    if (strength <= 75) return 'text-info';
    return 'text-success';
  }
}
