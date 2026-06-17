import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

import { adminGuard } from './core/guards/admin-guard';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { AdminReviewsComponent } from './features/admin-reviews/admin-reviews.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { HomeComponent } from './features/home/home.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrdersComponent } from './features/orders/orders.component';
import { AdminOrdersComponent } from './features/admin-orders/admin-orders.component';
import { PaymentSuccessComponent } from './features/payment-success/payment-success.component';
import { PaymentCancelComponent } from './features/payment-cancel/payment-cancel.component';
import { CustomerProfileComponent } from './features/customer-profile/customer-profile.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'customer/profile', component: CustomerProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'admin/reviews', component: AdminReviewsComponent, canActivate: [adminGuard] },
  { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [authGuard] },
  { path: 'payment-cancel', component: PaymentCancelComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' }
];
