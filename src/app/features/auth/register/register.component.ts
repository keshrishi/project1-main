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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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
