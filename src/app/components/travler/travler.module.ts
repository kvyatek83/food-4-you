import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [{ path: '', component: MenuComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class TravlerModule {}
