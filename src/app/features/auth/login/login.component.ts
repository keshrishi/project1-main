import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SharedButtonComponent } from '@shared/ui/button/button.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedButtonComponent],
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Welcome Back</h2>
        <p class="subtitle">Sign in to continue to MemeBazaar</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              placeholder="Enter your email"
              [class.error]="isFieldInvalid('email')">
            <div class="error-msg" *ngIf="isFieldInvalid('email')">
              Valid email is required
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              placeholder="Enter your password"
              [class.error]="isFieldInvalid('password')">
            <div class="error-msg" *ngIf="isFieldInvalid('password')">
              Password is required
            </div>
          </div>

          <div class="form-actions">
            <app-shared-button 
              type="submit" 
              variant="primary" 
              [disabled]="loginForm.invalid" 
              [isLoading]="isLoading">
              Sign In
            </app-shared-button>
          </div>

          <p class="auth-link">
            Don't have an account? <a routerLink="/auth/register">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .auth-card {
      background: var(--card-bg);
      padding: 2.5rem;
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-color);
      width: 100%;
      max-width: 400px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    h2 {
      margin-bottom: 0.5rem;
      text-align: center;
      color: var(--text-color);
    }

    .subtitle {
      text-align: center;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    input {
      width: 100%;
    }

    input.error {
      border-color: var(--danger-color);
    }

    .error-msg {
      color: var(--danger-color);
      font-size: 0.8rem;
      margin-top: 0.4rem;
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
    }

    .auth-link {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .auth-link a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]]
        });
    }

    isFieldInvalid(field: string): boolean {
        const control = this.loginForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            const { email, password } = this.loginForm.value;

            this.authService.login({ email, password }).subscribe({
                next: () => {
                    this.isLoading = false;
                    // Router navigate is handled in Login response handler or manually here?
                    // AuthService login doesn't navigate. Let's navigate here.
                    const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/feed';
                    this.router.navigateByUrl(returnUrl);
                },
                error: (err) => {
                    this.isLoading = false;
                    alert('Login failed: ' + (typeof err.error === 'string' ? err.error : 'Invalid credentials'));
                }
            });
        }
    }
}
