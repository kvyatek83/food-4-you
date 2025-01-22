import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../travler/travler.model';

const CATEGORIES: Category[] = [
  {
    uuid: '1',
    type: 'Burgers',
    enName: 'Burgers',
    heName: 'המבורגר',
    esName: 'Hamburguesa',
    imageUrl: '/items/burgers.jpg',
    items: [
      {
        uuid: '1-1',
        enName: 'Clasic Burger',
        heName: 'המבורגר קלאסי',
        esName: 'Clasic Burger',
        enDetails: 'Freshly brewed coffee',
        heDetails: 'המבורגר קלאסי',
        esDetails: 'Café recién hecho',
        imageUrl: '/items/burger.jpg',
        price: 2.99,
      },
      {
        uuid: '1-2',
        enName: 'Asado Burger',
        heName: 'המבורגר אסדו',
        esName: 'Asado Burger',
        enDetails: 'Asado Burger',
        heDetails: 'המבורגר אסדו',
        esDetails: 'Asado Burger',
        imageUrl: '/items/asado-burger.jpeg',
        price: 2.49,
      },
      {
        uuid: '1-3',
        enName: 'Double Burger',
        heName: 'המבורגר כפול',
        esName: 'Double Burger',
        enDetails: 'Double Burger',
        heDetails: 'המבורגר כפול',
        esDetails: 'Double Burger',
        imageUrl: '/items/burger.jpg',
        price: 4.49,
      },
      {
        uuid: '1-4',
        enName: 'Asado Burger',
        heName: 'המבורגר אסדו',
        esName: 'Asado Burger',
        enDetails: 'Asado Burger',
        heDetails: 'המבורגר אסדו',
        esDetails: 'Asado Burger',
        imageUrl: '/items/asado-burger.jpeg',
        price: 2.49,
      },
    ],
  },
  {
    uuid: '2',
    type: 'Beverage',
    enName: 'Beverages',
    heName: 'שתייה',
    esName: 'Bebidas',
    imageUrl: '/items/beverages.jpg',
    items: [
      {
        uuid: '2-1',
        enName: 'Coffee',
        heName: 'קפה',
        esName: 'Café',
        enDetails: 'Freshly brewed coffee',
        heDetails: 'קפה טרי',
        esDetails: 'Café recién hecho',
        imageUrl: '/items/coffee.jpeg',
        price: 2.99,
      },
      {
        uuid: '2-2',
        enName: 'Tea',
        heName: 'תה',
        esName: 'Té',
        enDetails: 'Refreshing tea',
        heDetails: 'תה מרענן',
        esDetails: 'Té refrescante',
        imageUrl: '/items/tea.jpg',
        price: 2.49,
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private _allItems$ = new BehaviorSubject<Category[]>(CATEGORIES);

  get allItems$(): Observable<Category[]> {
    return this._allItems$.asObservable();
  }

  get allItems(): Category[] {
    return this._allItems$.value;
  }

  setAllItems(allItems: Category[]): void {
    this._allItems$.next(allItems);
  }
}
