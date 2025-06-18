import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../auth.guard';
import { CategoriesOverviewComponent } from './categories-overview/categories-overview.component';
import { AddOnsOverviewComponent } from './add-ons-overview/add-ons-overview.component';
import { ItemsOverviewComponent } from './items-overview/items-overview.component';
import { OrdersOverviewComponent } from './orders-overview/orders-overview.component';
import { ScheduleOverviewComponent } from './schedule-overview/schedule-overview.component';
import { GeneralOverviewComponent } from './general-overview/general-overview.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'general-overview',
        component: GeneralOverviewComponent,
      },
      {
        path: 'categories-overview',
        component: CategoriesOverviewComponent,
      },
      {
        path: 'items-overview',
        component: ItemsOverviewComponent,
      },
      {
        path: 'add-ons-overview',
        component: AddOnsOverviewComponent,
      },
      {
        path: 'orders-overview',
        component: OrdersOverviewComponent,
      },
      {
        path: 'schedule-overview',
        component: ScheduleOverviewComponent,
      },
      { path: '', redirectTo: 'general-overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
