import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
