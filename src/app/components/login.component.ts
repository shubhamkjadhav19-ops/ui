import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-shell">
      <div class="card auth-card app-card">
        <h2>Login</h2>
        <p class="muted">Sign in to your account</p>
        <input [(ngModel)]="username" placeholder="Username" />
        <div class="error" *ngIf="submitted && username.trim().length < 3">
          Username must be at least 3 characters.
        </div>
        <input [(ngModel)]="password" placeholder="Password" type="password" />
        <div class="error" *ngIf="submitted && password.length < 6">
          Password must be at least 6 characters.
        </div>
        <button [disabled]="loading" (click)="login()">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <div class="error" *ngIf="error">{{ error }}</div>
        <p>No account? <a routerLink="/register">Register</a></p>
      </div>

      <div class="card auth-side-panel">
        <h3>Blog Admin</h3>
        <p>Manage posts, search content, and control your dashboard in one place.</p>
        <a routerLink="/register" class="auth-side-link">Register now</a>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  submitted = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  login(): void {
    this.submitted = true;
    this.error = '';
    if (!this.isFormValid()) {
      return;
    }

    this.loading = true;
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.showSuccess('Login successful.');
        this.router.navigate(['/blogs']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Invalid username or password';
        this.toastService.showError('Login failed.');
      }
    });
  }

  isFormValid(): boolean {
    return this.username.trim().length >= 3 && this.password.length >= 6;
  }
}
