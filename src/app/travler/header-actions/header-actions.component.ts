import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Observable, startWith } from 'rxjs';
import { Category, Item } from '../travler.model';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-header-actions',
  imports: [CommonModule, SearchComponent, MaterialModule],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.scss',
})
export class HeaderActionsComponent implements OnInit {
  itemCount = 0;
  currentRoute$: Observable<string> = new Observable<string>();
  searchOpen = false;

  searchQuery: string = '';
  filteredResults: (Category | Item)[] = [];

  constructor(private cartService: CartService, private _router: Router) {}

  ngOnInit(): void {
    this.currentRoute$ = this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects), // Using urlAfterRedirects for more accurate URL
      startWith(this._router.url) // Ensure initial URL is captured
    );

    this.cartService.getTotalItemsCount().subscribe((count) => {
      this.itemCount = count;
    });
  }

  searchCliked(): void {
    this.searchOpen = !this.searchOpen;
  }

  scrollToCategory(uuid: string) {
    const element = document.getElementById(uuid);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  navigateTo(route: string) {
    this._router.navigate([`/travler/${route}`]);
  }
}
