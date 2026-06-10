import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @Input() cartCount: number = 0;
  @Input() isLoggedIn: boolean = false;
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
    this.onCartClick.emit();
  }

  logout() {
    this.showUserDropdown = false;
    this.onLogout.emit();
  }

  search() {
    this.onSearch.emit(this.searchQuery);
  }
}

