import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthGuard } from '../auth.guard';
import { ItemFormComponent } from './item-form/item-form.component';
import { CategoriesOverviewComponent } from './categories-overview/categories-overview.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: CategoriesOverviewComponent,
      },
      {
        path: 'categories-overview',
        component: CategoriesOverviewComponent,
      },
      {
        path: 'item-form',
        component: ItemFormComponent,
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
})
export class AdminModule {}
