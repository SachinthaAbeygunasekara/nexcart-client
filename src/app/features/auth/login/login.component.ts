import { Component, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @Output() onLoginSuccess = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  login() {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (response: any) => {
          this.authService.saveToken(response.token);
          this.onLoginSuccess.emit();
        },

        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
        },
      });
  }

  continueAsGuest() {
    this.router.navigate(['/home']);
  }

  onSwitchToRegister() {
    this.switchToRegister.emit();
  }

  onClose() {
    this.close.emit();
  }
}
