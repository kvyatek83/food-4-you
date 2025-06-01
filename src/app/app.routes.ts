import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'traveler',
    loadChildren: () =>
      import('./traveler/traveler.module').then((m) => m.TravelerModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'traveler', pathMatch: 'full' },
  { path: '**', redirectTo: 'traveler' },
];
