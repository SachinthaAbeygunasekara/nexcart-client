import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../auth/services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CustomerProfile } from '../../core/models/customer-profile.model';
import { UpdateProfileRequest } from '../../core/models/update-profile-request.model';
import { ChangePasswordRequest } from '../../core/models/change-password-request.model';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css'],
})
export class CustomerProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  profile: CustomerProfile | null = null;
  isLoadingProfile = false;
  isSubmittingProfile = false;
  isSubmittingPassword = false;

  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  cartCount = 0;

  showPasswordField = false;
  showNewPasswordField = false;
  showConfirmPasswordField = false;

  constructor() {
    this.initializeForms();
    this.initializeAuthState();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^07\d{8}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator.bind(this),
      }
    );
  }

  private initializeAuthState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.username = this.authService.getUsername();
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (newPassword.value === confirmPassword.value) {
      // Clear the error only if it's the passwordMismatch one
      if (confirmPassword.errors) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    } else {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  loadProfile(): void {
    this.isLoadingProfile = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.patchFormValues(profile);
        this.isLoadingProfile = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoadingProfile = false;
        const errorMessage = err.error?.message || 'Failed to load profile';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
        this.cdr.markForCheck();
      },
    });
  }

  private patchFormValues(profile: CustomerProfile): void {
    this.profileForm.patchValue({
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      address: profile.address,
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly',
      });
      return;
    }

    this.isSubmittingProfile = true;
    const request: UpdateProfileRequest = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      phoneNumber: this.profileForm.get('phoneNumber')?.value,
      address: this.profileForm.get('address')?.value,
    };

    this.profileService.updateProfile(request).subscribe({
      next: (updatedProfile) => {
        this.isSubmittingProfile = false;
        this.profile = updatedProfile;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Profile updated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        this.isSubmittingProfile = false;
        const errorMessage = err.error?.message || 'Failed to update profile';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
        this.cdr.markForCheck();
      },
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly',
      });
      return;
    }

    this.isSubmittingPassword = true;
    const request: ChangePasswordRequest = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
    };

    this.profileService.changePassword(request).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.passwordForm.reset();
        this.showPasswordField = false;
        this.showNewPasswordField = false;
        this.showConfirmPasswordField = false;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Password changed successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        this.isSubmittingPassword = false;
        const errorMessage = err.error?.message || 'Failed to change password';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
        this.cdr.markForCheck();
      },
    });
  }

  togglePasswordVisibility(field: 'password' | 'newPassword' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPasswordField = !this.showPasswordField;
    } else if (field === 'newPassword') {
      this.showNewPasswordField = !this.showNewPasswordField;
    } else if (field === 'confirmPassword') {
      this.showConfirmPasswordField = !this.showConfirmPasswordField;
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  onLogout(): void {
    this.authService.logout();
    Swal.fire({
      title: 'Logged Out',
      text: 'Logged out successfully',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      this.router.navigate(['/home']);
    });
  }

  get firstName() {
    return this.profileForm.get('firstName');
  }

  get lastName() {
    return this.profileForm.get('lastName');
  }

  get phoneNumber() {
    return this.profileForm.get('phoneNumber');
  }

  get address() {
    return this.profileForm.get('address');
  }

  get currentPassword() {
    return this.passwordForm.get('currentPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }
}








