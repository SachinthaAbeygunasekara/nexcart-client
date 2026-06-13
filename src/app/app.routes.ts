import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth-guard';

import { adminGuard } from './core/guards/admin-guard';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { AccessDeniedComponent } from './features/access-denied/access-denied.component';
import { HomeComponent } from './features/home/home.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrdersComponent } from './features/orders/orders.component';
import { AdminOrdersComponent } from './features/admin-orders/admin-orders.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
