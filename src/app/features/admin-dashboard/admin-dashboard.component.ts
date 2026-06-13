import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../products/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductFormComponent } from '../products/product-form/product-form.component';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductFormComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  showModal = false;
  isEditing = false;
  currentProduct: Product = this.getEmptyProduct();

  constructor(
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
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
