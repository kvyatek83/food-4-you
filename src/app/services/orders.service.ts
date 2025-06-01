import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from '../traveler/traveler.models';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  constructor(private http: HttpClient) {}

  getOrders(page = 1, limit = 20): Observable<Order[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<any>(`/api/admin/orders`, { params })
      .pipe(map((response) => response.orders || []));
  }

  getOrdersByDateRange(
    startDate: Date,
    endDate: Date,
    page = 1,
    limit = 20
  ): Observable<Order[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString())
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<any>(`/api/admin/orders/byDate`, { params })
      .pipe(map((response) => response.orders || []));
  }

  getOrderStats(startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }

    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }

    return this.http.get<any>(`/api/admin/orders/stats`, { params });
  }

  // TODO: move to cart service
  updateOrderPrintStatus(orderId: string, printed: boolean): Observable<any> {
    return this.http.put(`/api/traveler/orders/${orderId}/printed`, { printed });
  }
}
