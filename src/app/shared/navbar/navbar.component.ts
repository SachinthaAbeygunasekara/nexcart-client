import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  @Input() cartCount: number = 0;
  @Input() isLoggedIn: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() username: string | null = null;
  @Input() searchQuery: string = '';

  @Output() onLoginClick = new EventEmitter<void>();
  @Output() onRegisterClick = new EventEmitter<void>();
  @Output() onCartClick = new EventEmitter<void>();
  @Output() onLogout = new EventEmitter<void>();
  @Output() onSearch = new EventEmitter<string>();

  showUserDropdown: boolean = false;

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  openLogin() {
    this.onLoginClick.emit();
  }

  openRegister() {
    this.onRegisterClick.emit();
  }

  openCart() {
    // Prevent customers from opening cart when logged in as admin
    if (this.isAdmin) {
      return;
    }
    this.onCartClick.emit();
  }

  logout() {
    this.showUserDropdown = false;
    this.onLogout.emit();
  }

  search() {
    this.onSearch.emit(this.searchQuery);
  }

  isCustomer(): boolean {
    return this.isLoggedIn && !this.isAdmin;
  }
}

