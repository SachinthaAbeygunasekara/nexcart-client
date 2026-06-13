
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../products/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../auth/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductListComponent } from '../products/product-list/product-list.component';
import { CartItem } from '../../core/models/cart_item.model';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductListComponent, NavbarComponent, LoginComponent, RegisterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  searchQuery: string = '';

  showLoginModal = false;
  showRegisterModal = false;
  showCartModal = false;

  cartItems: CartItem[] = [];
  cartTotal = 0;
  cartCount = 0;

  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // load categories and products immediately on init; order doesn't strictly matter because
    // loadProducts() will derive categories from products if the categories endpoint is empty.
    this.loadCategories();
    this.loadProducts();
    this.checkLoginStatus();
    this.loadCart();

    // react to query params (open login/register modal)
    this.route.queryParams.subscribe((qp) => {
      const auth = qp['auth'];
      if (auth === 'login') {
        this.showLoginModal = true;
      } else if (auth === 'register') {
        this.showRegisterModal = true;
      } else {
        this.showLoginModal = false;
        this.showRegisterModal = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories || [];

        // After categories load, ensure product category names are populated
        if (this.products && this.products.length > 0) {
          this.populateProductCategoryNames();
        }

        // If products already loaded, update product.category names when possible
        if (this.products && this.products.length > 0 && this.categories.length > 0) {
          this.products.forEach((p) => {
            const cat = (p as any).category;
            if (cat && (cat.name == null || String(cat.name).trim() === '') && cat.id != null) {
              const found = this.categories.find((c) => c.id === Number(cat.id));
              if (found && p.category) {
                (p.category as any).name = found.name;
              }
            }
          });
          // re-run filters so UI updates immediately when categories arrive
          this.applyFilters();
          // ensure Angular runs change detection so standalone child components update
          try {
            this.cdr.detectChanges();
          } catch (err) {
            // detectChanges can occasionally throw if called at certain lifecycle moments; ignore
            console.warn('[Home] detectChanges failed after categories update', err);
          }
        }
      },
      error: (err) => {
        console.error('[Home] Error loading categories:', err);
      },
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe((products) => {
      this.products = (products || []).filter((p) => p.status === 'ACTIVE');

      // Normalize categories on products and derive categories if needed
      this.products.forEach((p) => {
        const cat = (p as any).category;
        if (cat == null) {
          if ((p as any).categoryId != null) {
            p.category = { id: Number((p as any).categoryId), name: '' } as any;
          } else if ((p as any).categoryName) {
            p.category = { id: 0, name: String((p as any).categoryName) } as any;
          } else {
            p.category = undefined as any;
          }
        } else if (typeof cat === 'string') {
          p.category = { id: 0, name: cat } as any;
        } else if (typeof cat === 'number') {
          p.category = { id: cat, name: '' } as any;
        } else if (typeof cat === 'object') {
          if ((!cat.name || String(cat.name).trim() === '') && cat.id != null && this.categories.length > 0) {
            const found = this.categories.find((c) => c.id === cat.id);
                if (found && p.category) {
                  (p.category as any).name = found.name;
                }
          }
        }
      });

      if ((!this.categories || this.categories.length === 0) && this.products.length > 0) {
        const map = new Map<number, Category>();
        this.products.forEach((p) => {
          const c = p.category as any;
          if (c && c.id != null) {
            map.set(Number(c.id), { id: Number(c.id), name: c.name || '' });
          } else if (c && c.name) {
            const existing = Array.from(map.values()).find((x) => x.name === c.name);
            if (!existing) {
              const syntheticId = -(map.size + 1);
              map.set(syntheticId, { id: syntheticId, name: c.name });
            }
          }
        });
        this.categories = Array.from(map.values());
      }

      // After deriving categories, populate product category names if still empty
      this.populateProductCategoryNames();

      this.applyFilters();
      // ensure UI refresh after products load and potential category derivation
      try {
        this.cdr.detectChanges();
      } catch (err) {
        console.warn('[Home] detectChanges failed after products load', err);
      }
    });
  }

  private populateProductCategoryNames(): void {
    if (this.categories.length === 0) {
      return;
    }

    this.products.forEach((p) => {
      const cat = p.category as any;
      if (cat && cat.id != null && (!cat.name || String(cat.name).trim() === '')) {
        const found = this.categories.find((c) => c.id === cat.id);
        if (found) {
          cat.name = found.name;
        }
      }
    });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
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
      replaceUrl: true,
    });
  }

  onLoginSuccess(): void {
    this.checkLoginStatus();
    this.loadCart();
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

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.applyFilters();
  }

  onSearchFromNavbar(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  searchProducts(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let results = this.products.slice();

    if (this.selectedCategoryId !== null) {
      results = results.filter((p) => {
        const categoryId = typeof p.category?.id === 'string' ? parseInt(p.category.id, 10) : p.category?.id;
        return categoryId === this.selectedCategoryId;
      });
    }

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    this.filteredProducts = results;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.loadCart();

        Swal.fire({
          title: 'Added!',
          text: `${product.name} added to cart`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      },
    });
  }

  // New: handle add-to-cart clicks from product list. Check if user is admin first,
  // then if not logged in, prompt them to login. Otherwise proceed to add the product to cart.
  handleAddToCart(product: Product): void {
    if (this.isAdmin) {
      Swal.fire({
        title: 'Admin Restriction',
        text: 'Admins cannot purchase products. Only customers can add items to cart.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Please Login',
        text: 'You must be logged in to add items to your cart.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.openLoginModal();
          // Trigger change detection to ensure the login modal appears immediately
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.addToCart(product);
  }

  attemptCheckout(): void {
    if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please login to checkout',
        icon: 'info',
        confirmButtonText: 'Go to Login',
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
      icon: 'success',
    });
  }

  removeFromCart(cartItemId: number): void {
    this.cartService.removeFromCart(cartItemId).subscribe(() => {
      this.loadCart();
    });
  }

  updateQuantity(cartItemId: number, quantity: number): void {
    if (quantity <= 0) {
      return;
    }

    this.cartService.updateQuantity(cartItemId, quantity).subscribe(() => {
      this.loadCart();
    });
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
      position: 'top-end',
    });
  }

  getCartTotal(): number {
    return this.cartTotal;
  }

  loadCart(): void {
    if (!this.isLoggedIn) {
      return;
    }

    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cartItems = cart.items || [];
        this.cartTotal = cart.total || 0;
        this.cartCount = (cart.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      },
    });
  }
}



