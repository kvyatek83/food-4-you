import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'travler',
    loadChildren: () =>
      import('./travler/travler.module').then((m) => m.TravlerModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'travler', pathMatch: 'full' },
  { path: '**', redirectTo: 'travler' },
];
