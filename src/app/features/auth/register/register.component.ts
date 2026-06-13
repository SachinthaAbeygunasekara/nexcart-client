import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  @Output() onRegisterSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  agreeToTerms = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  register() {
    // Validate inputs
    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email';
      return;
    }

    if (!this.username.trim()) {
      this.errorMessage = 'Please enter a username';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Please enter a password';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (!this.agreeToTerms) {
      this.errorMessage = 'Please agree to the Terms of Service and Privacy Policy';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .register({
        email: this.email,
        username: this.username,
        password: this.password
      })
      .subscribe({
        next: (response: any) => {
          // Attempt to login immediately after successful registration
          this.authService
            .login({
              username: this.username,
              password: this.password,
            })
            .subscribe({
              next: (loginResponse: any) => {
                this.authService.saveToken(loginResponse.token);
                this.onRegisterSuccess.emit();
              },
              error: (loginErr) => {
                this.isLoading = false;
                // If login fails, we still registered successfully, but maybe redirect to login page
                this.errorMessage = 'Registration successful, but automatic login failed. Please login manually.';
              },
            });
        },

        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        },
      });
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }

  onClose() {
    this.close.emit();
  }
}
