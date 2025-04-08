import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { AddOn, Category, Item } from '../travler/travler.models';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from './notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private _allItems$ = new BehaviorSubject<Category[]>([]);
  private _addOns$ = new BehaviorSubject<Map<string, AddOn>>(
    new Map<string, AddOn>()
  );

  get allItems$(): Observable<Category[]> {
    return this._allItems$.asObservable();
  }

  get allItems(): Category[] {
    return this._allItems$.value;
  }

  setAllItems(allItems: Category[]): void {
    this._allItems$.next(allItems);
  }

  get addOns$(): Observable<Map<string, AddOn>> {
    return this._addOns$.asObservable();
  }

  get addOns(): Map<string, AddOn> {
    return this._addOns$.value;
  }

  setAllAddOns(addOns: AddOn[]): void {
    const addOnsMap = new Map<string, AddOn>();
    addOns.forEach((addOn) => {
      addOnsMap.set(addOn.uuid, addOn);
    });

    this._addOns$.next(addOnsMap);
  }

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {
    combineLatest([this.fetchAllItems(), this.fetchAddOns()])
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translate.instant(
                `notifications.errors.${error.error.message}`,
                { user: error.error.params }
              ),
            });
          } else if (error.status === 401) {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translate.instant(
                `notifications.errors.${error.error.message}`,
                { user: error.error.params }
              ),
            });
          } else {
            this.notificationsService.setNotification({
              type: 'ERROR',
              message: this.translate.instant('notifications.errors.general'),
            });
          }

          console.error(error);
          return of([]);
        })
      )
      .subscribe(([categories, addOns]) => {
        this.setAllAddOns(addOns);
        this.setAllItems(categories);
      });
  }

  fetchAllItems(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/travler/categories');
  }

  fetchAddOns(): Observable<AddOn[]> {
    return this.http.get<AddOn[]>('/api/travler/add-ons');
  }

  getAddOnByUuid(addOnUuid: string): AddOn | undefined {
    return this._addOns$.value.get(addOnUuid);
  }

  createCategory(
    category: Partial<Category>,
    imageFile: File
  ): Observable<Category[]> {
    const formData = new FormData();
    formData.append('category', JSON.stringify(category));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .post<Category[]>(`api/admin/category`, formData)
      .pipe(tap((categories: Category[]) => this.setAllItems(categories)));
  }

  editCategory(
    category: Partial<Category>,
    imageFile?: File
  ): Observable<Category[]> {
    const formData = new FormData();
    formData.append('category', JSON.stringify(category));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .put<Category[]>(`api/admin/category`, formData)
      .pipe(tap((categories: Category[]) => this.setAllItems(categories)));
  }

  deleteCategory(category: Category): Observable<Category[]> {
    return this.http
      .delete<Category[]>(`api/admin/category/${category.uuid}`)
      .pipe(tap((categories: Category[]) => this.setAllItems(categories)));
  }

  createItem(item: Partial<Item>, imageFile: File): Observable<Category[]> {
    const formData = new FormData();
    formData.append('item', JSON.stringify(item));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .post<Category[]>(`api/admin/item`, formData)
      .pipe(tap((categories: Category[]) => this.setAllItems(categories)));
  }

  editItem(item: Partial<Item>, imageFile?: File): Observable<Category[]> {
    const formData = new FormData();
    formData.append('item', JSON.stringify(item));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .put<Category[]>(`api/admin/item/${item.uuid}`, formData)
      .pipe(tap((categories: Category[]) => this.setAllItems(categories)));
  }

  deleteItem(item: Item): Observable<Category[]> {
    return this.http
      .delete<Category[]>(`api/admin/item/${item.uuid}`)
      .pipe(tap((categories: Category[]) => this.setAllItems(categories)));
  }

  createAddOn(addOn: Partial<AddOn>): Observable<AddOn[]> {
    return this.http
      .post<AddOn[]>(`api/admin/add-on`, addOn)
      .pipe(tap((adOns: AddOn[]) => this.setAllAddOns(adOns)));
  }

  editAddOn(addOn: Partial<AddOn>): Observable<AddOn[]> {
    return this.http
      .put<AddOn[]>(`api/admin/add-on/${addOn.uuid}`, addOn)
      .pipe(tap((adOns: AddOn[]) => this.setAllAddOns(adOns)));
  }

  deleteAddOn(addOn: Partial<AddOn>): Observable<Category[]> {
    return this.http.delete<AddOn[]>(`api/admin/add-on/${addOn.uuid}`).pipe(
      tap((adOns: AddOn[]) => this.setAllAddOns(adOns)),
      switchMap(() => this.fetchAllItems()),
      tap((categories: Category[]) => this.setAllItems(categories))
    );
  }
}
