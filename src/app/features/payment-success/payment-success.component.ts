import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PaymentSuccessComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }

  viewOrders() {
    this.router.navigate(['/orders']);
  }

  continueShopping() {
    this.router.navigate(['/home']);
  }
}



