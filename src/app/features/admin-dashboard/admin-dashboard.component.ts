import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../products/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductFormComponent } from '../products/product-form/product-form.component';
import { AdminReportsChartComponent } from './admin-reports-chart.component';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard-stats.model';
import { MonthlySales } from '../../core/models/monthly-sales.model';
import { TopProduct } from '../../core/models/top-product.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductFormComponent, AdminReportsChartComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  showModal = false;
  isEditing = false;
  currentProduct: Product = this.getEmptyProduct();
  // Analytics
  stats: DashboardStats | null = null;
  monthlySales: MonthlySales[] = [];
  topProducts: TopProduct[] = [];
  loading = false;
  // view mode: analytics (default) or products
  viewMode: 'analytics' | 'products' = 'analytics';

  constructor(
    private readonly productService: ProductService,
    private readonly dashboardService: DashboardService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products:', err);
      },
    });
  }

  // Charts data (monthlySales and topProducts) are provided to the chart component below.

  openProductManagement(): void {
    this.viewMode = 'products';
    // load products when entering product management view
    this.loadProducts();
  }

  loadAnalytics(): void {
    // switch to analytics view and load data
    this.viewMode = 'analytics';
    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      stats: this.dashboardService.getDashboardStats(),
      sales: this.dashboardService.getMonthlySales(),
      top: this.dashboardService.getTopProducts(),
    }).subscribe({
      next: ({ stats, sales, top }) => {
        this.stats = stats;
        this.monthlySales = sales || [];
        this.topProducts = top || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading analytics:', err);
        Swal.fire('Error', 'Failed to load analytics. Please try again later.', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  getEmptyProduct(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category: undefined,
      imageUrl: '',
      status: 'ACTIVE',
    };
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentProduct = this.getEmptyProduct();
    this.showModal = true;
  }

  openEditModal(product: Product): void {
    this.isEditing = true;
    this.currentProduct = { ...product };
    this.showModal = true;
  }


  closeModal(): void {
    this.showModal = false;
  }

  saveProduct(product: Product): void {
    if (
      !product.name ||
      !product.category?.id ||
      product.price <= 0
    ) {
      Swal.fire(
        'Error',
        'Please fill in all required fields and ensure price is positive.',
        'error',
      );
      return;
    }

    if (this.isEditing) {
      this.productService.updateProduct(product.id, product).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Product updated successfully.', 'success');
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          Swal.fire('Error', 'Failed to update product. Please try again.', 'error');
        },
      });
    } else {
      // Create a copy and ensure id is not sent or set to null if 0
      const { id, ...productData } = product;
      const productToCreate = productData as Product;

      this.productService.createProduct(productToCreate).subscribe({
        next: () => {
          Swal.fire('Created!', 'Product created successfully.', 'success');
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating product:', err);
          Swal.fire('Error', 'Failed to create product. Please try again.', 'error');
        },
      });
    }
  }

  deleteProduct(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Product has been deleted.', 'success');
            this.loadProducts();
          },
          error: (err) => {
            console.error('Error deleting product:', err);
            Swal.fire('Error', 'Failed to delete product. Please try again.', 'error');
          },
        });
      }
    });
  }
}
