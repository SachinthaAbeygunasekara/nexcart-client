import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../products/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../auth/services/auth.service';
import { Product } from '../../core/models/product.model';
import { CartItem } from '../../core/models/cart.model';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoginComponent,
    RegisterComponent,
    NavbarComponent,
    SweetAlert2Module,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  cart: CartItem[] = [];
  cartCount: number = 0;
  searchQuery: string = '';
  selectedCategory: string = 'all';
  isLoggedIn: boolean = false;
  username: string | null = null;

  showLoginModal: boolean = false;
  showRegisterModal: boolean = false;
  showCartModal: boolean = false;

  categories = ['all', 'Electronics', 'Accessories', 'Fashion', 'Home & Living'];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.checkLoginStatus();
    this.cartService.getCart().subscribe((cart) => {
      this.cart = cart;
      this.cartCount = this.cartService.getCartCount();
    });

    this.route.queryParams.subscribe(params => {
      if (params['auth'] === 'login') {
        this.showLoginModal = true;
        this.showRegisterModal = false;
        this.showCartModal = false;
      } else if (params['auth'] === 'register') {
        this.showRegisterModal = true;
        this.showLoginModal = false;
        this.showCartModal = false;
      } else {
        this.showLoginModal = false;
        this.showRegisterModal = false;
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((products) => {
      this.products = products;
      this.filteredProducts = products;
    });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
  }

  openLoginModal(): void {
    this.showLoginModal = true;
    this.showRegisterModal = false;
    this.showCartModal = false;
    this.updateAuthParam('login');
  }

  openRegisterModal(): void {
    this.showRegisterModal = true;
    this.showLoginModal = false;
    this.showCartModal = false;
    this.updateAuthParam('register');
  }

  openCartModal(): void {
    this.showCartModal = true;
    this.showLoginModal = false;
    this.showRegisterModal = false;
  }

  closeModals(): void {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.showCartModal = false;
    this.updateAuthParam(null);
  }

  private updateAuthParam(value: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { auth: value },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onLoginSuccess(): void {
    this.checkLoginStatus();
    this.closeModals();
  }

  onRegisterSuccess(): void {
    this.checkLoginStatus();
    this.closeModals();
  }

  switchToRegister(): void {
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  switchToLogin(): void {
    this.showRegisterModal = false;
    this.showLoginModal = true;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter((p) => p.category === category);
    }
  }

  searchProducts(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(
        (p) =>
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    }
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    Swal.fire({
      title: 'Added!',
      text: `${product.name} added to cart!`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  attemptCheckout(): void {
    if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please login to checkout',
        icon: 'info',
        confirmButtonText: 'Go to Login'
      }).then((result) => {
        if (result.isConfirmed) {
          this.openLoginModal();
        }
      });
      return;
    }
    Swal.fire({
      title: 'Checkout',
      text: 'Proceeding to checkout...',
      icon: 'success'
    });
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  logout(): void {
    this.authService.logout();
    this.checkLoginStatus();
    Swal.fire({
      title: 'Logged Out',
      text: 'Logged out successfully',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }
}
