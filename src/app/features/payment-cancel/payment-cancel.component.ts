import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PaymentCancelComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }

  retryCheckout() {
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/home']);
  }
}



