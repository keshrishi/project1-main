import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SharedButtonComponent } from '@shared/ui/button/button.component';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedButtonComponent],
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Create Account</h2>
        <p class="subtitle">Join the community</p>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              placeholder="Choose a username"
              [class.error]="isFieldInvalid('username')">
            <div class="error-msg" *ngIf="isFieldInvalid('username')">
              Username is required
            </div>
          </div>

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
              placeholder="Create a password"
              [class.error]="isFieldInvalid('password')">
            <div class="error-msg" *ngIf="isFieldInvalid('password')">
              Password must be at least 6 characters
            </div>
          </div>

          <div class="form-actions">
            <app-shared-button 
              type="submit" 
              variant="primary" 
              [disabled]="registerForm.invalid" 
              [isLoading]="isLoading">
              Sign Up
            </app-shared-button>
          </div>

          <p class="auth-link">
            Already have an account? <a routerLink="/auth/login">Sign in</a>
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
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    isFieldInvalid(field: string): boolean {
        const control = this.registerForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.isLoading = true;
            const { username, email, password } = this.registerForm.value;

            this.authService.register({ username, email, password, role: 'user' as const }).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/feed']);
                },
                error: (err) => {
                    this.isLoading = false;
                    alert('Registration failed: ' + (typeof err.error === 'string' ? err.error : 'Email likely already in use'));
                }
            });
        }
    }
}
