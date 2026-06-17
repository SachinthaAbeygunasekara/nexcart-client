import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../auth/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ReviewService } from '../../core/services/review.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Order, OrderItem } from '../../core/models/order.model';
import { Review } from '../../core/models/review.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly reviewService = inject(ReviewService);
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

  // Review modal state
  showReviewModal = false;
  selectedItem: OrderItem | null = null;
  selectedOrderId: number | null = null;
  reviewRating = 0;
  reviewComment = '';
  isEditingReview = false;
  isSubmittingReview = false;

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

  // Review functionality
  hasReview(item: OrderItem): boolean {
    return !!(item.reviewId && item.rating && item.comment);
  }

  openReviewModal(item: OrderItem, orderId: number) {
    this.selectedItem = item;
    this.selectedOrderId = orderId;

    // Check if editing existing review
    if (this.hasReview(item)) {
      this.isEditingReview = true;
      this.reviewRating = item.rating || 0;
      this.reviewComment = item.comment || '';
    } else {
      this.isEditingReview = false;
      this.reviewRating = 0;
      this.reviewComment = '';
    }

    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedItem = null;
    this.selectedOrderId = null;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.isEditingReview = false;
  }

  submitReview() {
    if (!this.selectedItem || !this.selectedOrderId || this.reviewRating === 0 || !this.reviewComment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Review',
        text: 'Please provide both rating and comment',
      });
      return;
    }

    if (this.reviewComment.trim().length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Comment Too Short',
        text: 'Please provide at least 10 characters',
      });
      return;
    }

    this.isSubmittingReview = true;

    if (this.isEditingReview && this.selectedItem.reviewId) {
      // Update existing review
      this.reviewService.updateReview(this.selectedItem.reviewId, {
        rating: this.reviewRating,
        comment: this.reviewComment,
      }).subscribe({
        next: () => {
          this.selectedItem!.rating = this.reviewRating;
          this.selectedItem!.comment = this.reviewComment;
          this.isSubmittingReview = false;
          this.closeReviewModal();
          Swal.fire({
            icon: 'success',
            title: 'Review Updated',
            text: 'Your review has been updated successfully!',
            timer: 1500,
            showConfirmButton: false,
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error updating review:', err);
          this.isSubmittingReview = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update review. Please try again.',
          });
        },
      });
    } else {
      // Add new review
      this.reviewService.addReview(this.selectedItem.productId, {
        rating: this.reviewRating,
        comment: this.reviewComment,
      }).subscribe({
        next: (review: Review) => {
          this.selectedItem!.reviewId = review.id;
          this.selectedItem!.rating = this.reviewRating;
          this.selectedItem!.comment = this.reviewComment;
          this.isSubmittingReview = false;
          this.closeReviewModal();
          Swal.fire({
            icon: 'success',
            title: 'Review Added',
            text: 'Your review has been added successfully!',
            timer: 1500,
            showConfirmButton: false,
          });
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error adding review:', err);
          this.isSubmittingReview = false;

          // Check if duplicate review error
          if (err.status === 400 || (err.error && err.error.message && err.error.message.includes('already'))) {
            Swal.fire({
              icon: 'warning',
              title: 'Review Already Exists',
              text: 'You have already reviewed this product. You can edit it instead.',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to add review. Please try again.',
            });
          }
        },
      });
    }
  }

  deleteReview(item: OrderItem) {
    if (!item.reviewId) return;

    Swal.fire({
      title: 'Delete Review?',
      text: 'Are you sure you want to delete this review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reviewService.deleteReview(item.reviewId!).subscribe({
          next: () => {
            item.reviewId = undefined;
            item.rating = undefined;
            item.comment = undefined;
            Swal.fire({
              icon: 'success',
              title: 'Review Deleted',
              text: 'Your review has been deleted successfully!',
              timer: 1500,
              showConfirmButton: false,
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error deleting review:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete review. Please try again.',
            });
          },
        });
      }
    });
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(5)
      .fill(0)
      .map((_, i) => (i < fullStars ? 1 : 0));
  }

  setRating(value: number) {
    this.reviewRating = value;
  }
}


