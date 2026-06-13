import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth-guard';

import { adminGuard } from './core/guards/admin-guard';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { AccessDeniedComponent } from './features/access-denied/access-denied.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
