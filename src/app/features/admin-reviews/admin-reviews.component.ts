import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../core/services/review.service';
import { Review } from '../../core/models/review.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css',
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = false;

  constructor(
    private readonly reviewService: ReviewService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

   loadReviews(): void {
     this.loading = true;
     this.reviewService.getAllReviews().subscribe({
       next: (reviews: Review[]) => {
         this.reviews = reviews.sort((a: Review, b: Review) =>
           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         );
         this.loading = false;
         this.cdr.detectChanges();
       },
       error: (err: any) => {
         console.error('Error loading reviews:', err);
         Swal.fire('Error', 'Failed to load reviews', 'error');
         this.loading = false;
         this.cdr.detectChanges();
       },
     });
   }

  deleteReview(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result: any) => {
       if (result.isConfirmed) {
         this.reviewService.deleteReviewByAdmin(id).subscribe({
           next: () => {
             Swal.fire('Deleted!', 'Review has been deleted.', 'success');
             this.loadReviews();
           },
           error: (err: any) => {
             console.error('Error deleting review:', err);
             Swal.fire('Error', 'Failed to delete review. Please try again.', 'error');
           },
         });
       }
     });
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

  getRatingStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    return Array(5)
      .fill(0)
      .map((_, i) => (i < fullStars ? 1 : 0));
  }
}

