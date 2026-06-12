import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../../../core/models/product.model';
import { CartItem } from '../../../core/models/cart.model';
import { CartService } from '../../../core/services/cart.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  cartCount = 0;
  isLoggedIn = false;
  username: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
    }

    // Subscribe to cart changes (CartService exposes getCart())
    this.cartService.getCart().subscribe((cart: CartItem[]) => {
      this.cartCount = cart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
    });

    // AuthService does not expose a currentUser$ observable in this project;
    // use synchronous helpers instead
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        // ProductService may return undefined; normalize to null for the
        // component's Product | null type
        this.product = product ?? null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
      }
    });
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
      Swal.fire({
        title: 'Success!',
        text: `${this.product.name} added to cart`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
