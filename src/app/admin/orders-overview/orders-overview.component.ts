import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable, Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';
import { NoDataComponent } from '../../components/no-data/no-data.component';
import { NoResultsComponent } from '../../components/no-results/no-results.component';
import { Order } from '../../travler/travler.models';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailsComponent } from '../order-details/order-details.component';

@Component({
  selector: 'app-orders-overview',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LanguageDirectionDirective,
    NoDataComponent,
    NoResultsComponent,
  ],
  templateUrl: './orders-overview.component.html',
  styleUrls: ['./orders-overview.component.scss'],
})
export class OrdersOverviewComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  public lang$: Observable<LanguageType> = new Observable<LanguageType>();

  searchTerm = new FormControl('');
  printedFilter = new FormControl<boolean | null>(null);
  dateFilter = new FormControl<Date | null>(null);

  displayedColumns: string[] = [
    'orderNumber',
    'date',
    'customer',
    'items',
    'total',
    'printed',
    'actions',
  ];

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  dir: LanguageDirection = 'ltr';
  loadingData = false;
  viewMode: 'table' = 'table';

  private pollingSubscription: Subscription | undefined;
  private readonly POLLING_INTERVAL = 5000; // 30 seconds

  constructor(
    private ordersService: OrdersService,
    private languageService: LanguageService
  ) {
    this.lang$ = this.languageService.currentLanguage$;
  }

  ngOnInit(): void {
    this.loadingData = true;
    this.loadOrders();

    // Setup filtering
    combineLatest([
      this.printedFilter.valueChanges.pipe(startWith(null)),
      this.searchTerm.valueChanges.pipe(startWith('')),
      this.dateFilter.valueChanges.pipe(startWith(null)),
    ]).subscribe(([printed, term, date]) => {
      this.filterOrders(term || '', printed, date);
    });

    // Setup polling for new orders
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(switchMap(() => this.ordersService.getOrders()))
      .subscribe((orders) => {
        if (JSON.stringify(orders) !== JSON.stringify(this.orders)) {
          this.orders = orders;
          this.filterOrders(
            this.searchTerm.value || '',
            this.printedFilter.value,
            this.dateFilter.value
          );
        }
      });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private loadOrders(): void {
    this.ordersService.getOrders().subscribe((orders) => {
      this.orders = orders;
      this.filteredOrders = orders;
      this.loadingData = false;
    });
  }

  private filterOrders(
    term: string,
    printed: boolean | null,
    date: Date | null
  ): void {
    const value = term.toLowerCase();

    this.filteredOrders = this.orders.filter((order) => {
      // Filter by printed status
      let printedFilter = true;
      if (printed !== null) {
        printedFilter = order.printed === printed;
      }

      // Filter by date
      let dateFilter = true;
      if (date) {
        const orderDate = new Date(order.orderDate);
        dateFilter = orderDate.toDateString() === date.toDateString();
      }

      // Filter by search term
      const searchFilter =
        order.uuid.toLowerCase().includes(value) ||
        (order.customerName &&
          order.customerName.toLowerCase().includes(value)) ||
        (order.customerPhone &&
          order.customerPhone.toLowerCase().includes(value));

      return searchFilter && printedFilter && dateFilter;
    });
  }

  viewOrderDetails(order: Order): void {
    const dialogRef = this.dialog.open(OrderDetailsComponent, {
      width: '600px',
      height: '80%',
      data: { order },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.printed !== undefined) {
        // If the order was marked as printed in the dialog, update our local data
        const index = this.orders.findIndex((o) => o.uuid === order.uuid);
        if (index !== -1) {
          this.orders[index].printed = result.printed;
          this.filterOrders(
            this.searchTerm.value || '',
            this.printedFilter.value,
            this.dateFilter.value
          );
        }
      }
    });
  }

  markAsPrinted(order: Order): void {
    this.ordersService
      .updateOrderPrintStatus(order.uuid, true)
      .subscribe(() => {
        const index = this.orders.findIndex((o) => o.uuid === order.uuid);
        if (index !== -1) {
          this.orders[index].printed = true;
          this.filterOrders(
            this.searchTerm.value || '',
            this.printedFilter.value,
            this.dateFilter.value
          );
        }
      });
  }

  calculateOrderItemCount(order: Order): number {
    return order.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}
