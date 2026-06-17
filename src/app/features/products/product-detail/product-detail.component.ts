import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../auth/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';
import { ProductRating } from '../../../core/models/product-rating.model';
import { CreateReviewRequest } from '../../../core/models/create-review-request.model';
import { UpdateReviewRequest } from '../../../core/models/update-review-request.model';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  cartCount = 0;
  isLoggedIn = false;
  username: string | null = null;
  userRole: string | null = null;

  // Review related properties
  reviews: Review[] = [];
  rating: ProductRating | null = null;
  isLoadingReviews = false;
  isSubmittingReview = false;
  userReview: Review | null = null;
  isEditingReview = false;

  // Form properties
  formRating = 5;
  formComment = '';
  formErrorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly reviewService: ReviewService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
      this.loadReviewsAndRating(id);
    }

    // Subscribe to cart changes
    this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cartCount = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
        try {
          this.cdr.detectChanges();
        } catch {}
      },
    });

    // Get auth info
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getRole();
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadReviewsAndRating(productId: number): void {
    this.isLoadingReviews = true;
    forkJoin({
      reviews: this.reviewService.getProductReviews(productId),
      rating: this.reviewService.getProductRating(productId),
    }).subscribe({
      next: ({ reviews, rating }) => {
        this.reviews = reviews.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.rating = rating;

        // Check if current user already reviewed
        if (this.isLoggedIn && this.username) {
          this.userReview = this.reviews.find((r) => r.customerName === this.username) || null;
          if (this.userReview) {
            this.isEditingReview = true;
            this.formRating = this.userReview.rating;
            this.formComment = this.userReview.comment;
          }
        }

        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      },
    });
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id, 1).subscribe({
        next: () => {
          Swal.fire({
            title: 'Success!',
            text: `${this.product?.name} added to cart`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        },
      });
    }
  }

  // Review form methods
  getRatingStars(): number[] {
    return Array(this.formRating).fill(0);
  }

  setFormRating(rating: number): void {
    this.formRating = rating;
  }

  isFormValid(): boolean {
    if (this.formRating < 1) {
      this.formErrorMessage = 'Please select a rating';
      return false;
    }
    if (!this.formComment.trim()) {
      this.formErrorMessage = 'Comment is required';
      return false;
    }
    if (this.formComment.trim().length > 500) {
      this.formErrorMessage = 'Comment must be 500 characters or less';
      return false;
    }
    this.formErrorMessage = '';
    return true;
  }

  submitReview(): void {
    if (!this.isFormValid()) {
      return;
    }

    if (!this.product) {
      return;
    }

    if (this.isEditingReview && this.userReview) {
      this.updateExistingReview();
    } else {
      this.createNewReview();
    }
  }

  createNewReview(): void {
    if (!this.product) {
      return;
    }

    this.isSubmittingReview = true;
    const reviewData: CreateReviewRequest = {
      rating: this.formRating,
      comment: this.formComment.trim(),
    };

    this.reviewService.addReview(this.product.id, reviewData).subscribe({
      next: () => {
        Swal.fire('Success!', 'Review submitted successfully', 'success');
        this.clearForm();
        this.loadReviewsAndRating(this.product!.id);
        this.isSubmittingReview = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingReview = false;
        const errorMessage = err.error?.message || 'Failed to submit review. Please try again.';
        Swal.fire('Error', errorMessage, 'error');
        this.cdr.detectChanges();
      },
    });
  }

  updateExistingReview(): void {
    if (!this.userReview) {
      return;
    }

    this.isSubmittingReview = true;
    const reviewData: UpdateReviewRequest = {
      rating: this.formRating,
      comment: this.formComment.trim(),
    };

    this.reviewService.updateReview(this.userReview.id, reviewData).subscribe({
      next: () => {
        Swal.fire('Success!', 'Review updated successfully', 'success');
        this.clearForm();
        if (this.product) {
          this.loadReviewsAndRating(this.product.id);
        }
        this.isSubmittingReview = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingReview = false;
        const errorMessage = err.error?.message || 'Failed to update review. Please try again.';
        Swal.fire('Error', errorMessage, 'error');
        this.cdr.detectChanges();
      },
    });
  }

  deleteUserReview(): void {
    if (!this.userReview) {
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed && this.userReview) {
        this.reviewService.deleteReview(this.userReview.id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Review has been deleted.', 'success');
            this.clearForm();
            this.userReview = null;
            this.isEditingReview = false;
            if (this.product) {
              this.loadReviewsAndRating(this.product.id);
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            const errorMessage = err.error?.message || 'Failed to delete review. Please try again.';
            Swal.fire('Error', errorMessage, 'error');
          },
        });
      }
    });
  }

  clearForm(): void {
    this.formRating = 5;
    this.formComment = '';
    this.formErrorMessage = '';
  }

  getDisplayRating(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(5).fill(0).map((_, i) => i < fullStars ? 1 : 0);
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

  onLogout(): void {
    this.authService.logout();
  }
}
