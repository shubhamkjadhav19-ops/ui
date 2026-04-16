import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public authService: AuthService, public toastService: ToastService) {
    if (this.authService.logoutIfTokenExpired()) {
      this.toastService.showError('Session expired. Please login again.');
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastService.showSuccess('Logged out successfully.');
  }

  dismissAlert(): void {
    this.toastService.dismissCurrent();
  }
}
