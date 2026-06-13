import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../auth/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  isLoading = false;
  selectedStatus: { [key: number]: string } = {};
  expandedOrderId: number | null = null;

  statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  cartCount = 0;
  // Filters for server-side search
  filterOrderId: number | null = null;
  filterDate: string = '';
  filterStatus: string = '';

  ngOnInit() {
    this.initializeAuthState();
    this.loadOrders();
    // subscribe to cart updates so navbar badge shows correct count
    this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cartCount = (cart?.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
        try {
          this.cdr.detectChanges();
        } catch {}
      },
    });
    // fetch current cart once
    this.cartService.getCart().subscribe({});
  }

  private initializeAuthState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.username = this.authService.getUsername();
  }

  loadOrders() {
    this.isLoading = true;
    // Use server-side getOrders with empty filters to fetch all orders
    this.orderService.getOrders({}).subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.orders.forEach((order) => {
          this.selectedStatus[order.id] = order.status;
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
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

  // Search orders using server-side filtering (orderId, status, date)
  searchOrders() {
    this.isLoading = true;

    const filters: { orderId?: number; status?: string; date?: string } = {};
    if (this.filterOrderId !== null && this.filterOrderId !== undefined && this.filterOrderId !== 0) {
      filters.orderId = this.filterOrderId;
    }
    if (this.filterStatus) {
      filters.status = this.filterStatus;
    }
    if (this.filterDate) {
      filters.date = this.filterDate;
    }

    this.orderService.getOrders(filters).subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.orders.forEach((order) => {
          this.selectedStatus[order.id] = order.status;
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error searching orders:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to search orders',
        });
      },
    });
  }

  clearFilters() {
    this.filterOrderId = null;
    this.filterDate = '';
    this.filterStatus = '';
    this.loadOrders();
  }

  updateStatus(orderId: number) {
    const newStatus = this.selectedStatus[orderId];
    const oldOrder = this.orders.find((o) => o.id === orderId);
    const oldStatus = oldOrder?.status;

    if (newStatus === oldStatus) {
      return;
    }

    // Ask for confirmation before updating the order status
    Swal.fire({
      title: 'Confirm status change',
      text: `Change order #${orderId} status from ${oldStatus} to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, update',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (!result.isConfirmed) {
        // Revert selection if user cancels
        this.selectedStatus[orderId] = oldStatus!;
        this.cdr.detectChanges();
        return;
      }

      this.isLoading = true;
      this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
        next: (updated: Order) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Order status updated to ${newStatus}`,
            timer: 1500,
            showConfirmButton: false,
          });
          // Update local order to avoid full reload when possible
          const idx = this.orders.findIndex((o) => o.id === orderId);
          if (idx !== -1) {
            this.orders[idx].status = updated.status;
            this.selectedStatus[orderId] = updated.status;
          }
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.selectedStatus[orderId] = oldStatus!;
          console.error('Error updating order status:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Failed to update order status',
          });
          this.cdr.detectChanges();
        },
      });
    });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  toggleExpandOrder(orderId: number) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    // ensure view updates
    this.cdr.detectChanges();
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


