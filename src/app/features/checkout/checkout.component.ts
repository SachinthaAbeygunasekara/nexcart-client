import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CheckoutRequest } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  checkoutForm: FormGroup;
  isLoading = false;
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  cartCount = 0;

  constructor() {
    this.checkoutForm = this.fb.group({
      deliveryAddress: ['', [Validators.required, Validators.minLength(5)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9\s\-\+\(\)]+$/)]],
    });
    this.initializeAuthState();
  }

  private initializeAuthState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.username = this.authService.getUsername();
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly',
      });
      return;
    }

    this.isLoading = true;
    const request: CheckoutRequest = this.checkoutForm.value;

    this.orderService.checkout(request).subscribe({
      next: (order) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Order Successful!',
          text: `Order #${order.id} has been placed successfully.`,
          confirmButtonText: 'View Orders',
        }).then((result) => {
          if (result.isConfirmed) {
            // Clear cart after successful checkout
            this.cartService.clearCart().subscribe(() => {
              this.router.navigate(['/orders']);
            });
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Checkout Failed',
          text: error.error?.message || 'An error occurred during checkout',
        });
      },
    });
  }

  onLogout() {
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

  get deliveryAddress() {
    return this.checkoutForm.get('deliveryAddress');
  }

  get phoneNumber() {
    return this.checkoutForm.get('phoneNumber');
  }
}


