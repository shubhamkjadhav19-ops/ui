import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="card auth-card app-card">
        <h2>Register</h2>
        <p class="muted">Create your account to start blogging.</p>
        <input [(ngModel)]="username" placeholder="Username" />
        <div class="error" *ngIf="submitted && username.trim().length < 3">
          Username must be at least 3 characters.
        </div>
        <input [(ngModel)]="email" placeholder="Email" />
        <div class="error" *ngIf="submitted && !isEmailValid()">
          Enter a valid email address.
        </div>
        <input [(ngModel)]="password" placeholder="Password" type="password" />
        <div class="error" *ngIf="submitted && password.length < 6">
          Password must be at least 6 characters.
        </div>
        <button [disabled]="loading" (click)="register()">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        <div class="error" *ngIf="error">{{ error }}</div>
        <p>Already registered? <a routerLink="/login">Login</a></p>
      </div>

      <div class="card auth-side-panel">
        <h3>Welcome</h3>
        <p>Get access to create, filter, and manage your own blog posts securely.</p>
        <a routerLink="/login" class="auth-side-link">Go to login</a>
      </div>
    </div>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  error = '';
  submitted = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  register(): void {
    this.submitted = true;
    this.error = '';
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;
    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('Registration successful. Please login.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Registration failed';
        this.toastService.showError('Registration failed.');
      }
    });
  }

  isFormValid(): boolean {
    return this.username.trim().length >= 3
      && this.isEmailValid()
      && this.password.length >= 6;
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
