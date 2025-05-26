import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { TravelerComponent } from './traveler.component';
import { CartComponent } from './cart/cart.component';

// TODO: add canActivate: [AuthGuard] for traveler
const routes: Routes = [
  {
    path: '',
    component: TravelerComponent,
    children: [
      { path: '', component: MenuComponent },
      { path: 'cart', component: CartComponent },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TravelerModule {}
