import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../auth/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly cartService = inject(CartService);

  orders: Order[] = [];
  isLoading = false;
  expandedOrderId: number | null = null;

  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  cartCount = 0;

  ngOnInit() {
    this.initializeAuthState();
    this.loadOrders();
    // subscribe to cart updates for navbar
    this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cartCount = (cart?.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
        try {
          this.cdr.detectChanges();
        } catch {}
      },
    });
    this.cartService.getCart().subscribe({});
  }

  private initializeAuthState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.username = this.authService.getUsername();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getCustomerOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        try {
          this.cdr.detectChanges();
        } catch {}
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load orders',
        });
      },
    });
  }

  toggleExpandOrder(orderId: number) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
}


