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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
