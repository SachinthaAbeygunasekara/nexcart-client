import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PaymentService } from '../../core/services/payment.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { OrderService } from '../../core/services/order.service';
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
  private readonly paymentService = inject(PaymentService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(OrderService);
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

  async onSubmit() {
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

    // First, create the order on the backend
    this.orderService.checkout(request).subscribe({
      next: (order) => {
        // Then request a checkout session for that order (order.id as path variable)
        this.paymentService.createCheckoutSession(order.id).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.checkoutUrl) {
              // Redirect browser to the checkout URL provided by backend
              window.location.href = response.checkoutUrl;
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Payment Error',
                text: 'Payment service did not return a checkout URL. Please try again later.',
              });
            }
          },
          error: (err) => {
            this.isLoading = false;
            if (err.status === 401) {
              Swal.fire({ icon: 'warning', title: 'Unauthorized', text: 'Please login to complete payment.' });
            } else if (err.status === 403) {
              Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission.' });
            } else if (err.status === 500) {
              Swal.fire({ icon: 'error', title: 'Server Error', text: 'Payment server error. Please try later.' });
            } else {
              Swal.fire({ icon: 'error', title: 'Payment Error', text: err.error?.message || 'Failed to create payment session.' });
            }
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          Swal.fire({ icon: 'warning', title: 'Unauthorized', text: 'Please login to place an order.' });
        } else if (err.status === 403) {
          Swal.fire({ icon: 'error', title: 'Access Denied', text: 'You do not have permission.' });
        } else if (err.status === 500) {
          Swal.fire({ icon: 'error', title: 'Server Error', text: 'Order service error. Please try later.' });
        } else {
          Swal.fire({ icon: 'error', title: 'Checkout Failed', text: err.error?.message || 'An error occurred while placing the order' });
        }
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


