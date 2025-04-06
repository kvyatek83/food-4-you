// schedule-overview.component.ts
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, debounceTime, Observable, startWith } from 'rxjs';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { MaterialModule } from '../../material.module';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { Item } from '../../travler/travler.models';
import { ItemsService } from '../../services/items.service';
import { NoDataComponent } from '../../components/no-data/no-data.component';
import { NoResultsComponent } from '../../components/no-results/no-results.component';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';

@Component({
  selector: 'app-schedule-overview',
  templateUrl: './schedule-overview.component.html',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PropertiesTranslationPipe,
    LanguageDirectionDirective,
    NoDataComponent,
    NoResultsComponent,
  ],
  styleUrls: ['./schedule-overview.component.scss'],
})
export class ScheduleOverviewComponent implements OnInit {
  dataSource = new MatTableDataSource<Item>([]);
  displayedColumns: string[] = [
    'name',
    'allDays',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'actions',
  ];
  searchTerm = new FormControl('');
  availabilityFilter = new FormControl('all');
  dayFilter = new FormControl('all');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterOptions = [
    { value: 'all', viewValue: 'scheduleOverview.filterOptions.all' },
    {
      value: 'available',
      viewValue: 'scheduleOverview.filterOptions.available',
    },
    {
      value: 'unavailable',
      viewValue: 'scheduleOverview.filterOptions.unavailable',
    },
  ];

  dayOptions = [
    { value: 'all', viewValue: 'scheduleOverview.dayOptions.all' },
    { value: 'monday', viewValue: 'scheduleOverview.dayOptions.monday' },
    { value: 'tuesday', viewValue: 'scheduleOverview.dayOptions.tuesday' },
    { value: 'wednesday', viewValue: 'scheduleOverview.dayOptions.wednesday' },
    { value: 'thursday', viewValue: 'scheduleOverview.dayOptions.thursday' },
    { value: 'friday', viewValue: 'scheduleOverview.dayOptions.friday' },
    { value: 'saturday', viewValue: 'scheduleOverview.dayOptions.saturday' },
    { value: 'sunday', viewValue: 'scheduleOverview.dayOptions.sunday' },
  ];

  public lang$: Observable<LanguageType>;
  dir: LanguageDirection = 'ltr';
  loadingData = false;
  filteredItems: Item[] = [];
  allDaysMap: { [key: string]: boolean } = {};

  days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  constructor(
    private itemsService: ItemsService,
    private languageService: LanguageService
  ) {
    this.lang$ = this.languageService.currentLanguage$;
  }

  ngOnInit(): void {
    this.loadingData = true;
    this.loadItems();

    combineLatest([
      this.searchTerm.valueChanges.pipe(debounceTime(300), startWith('')),
      this.availabilityFilter.valueChanges.pipe(startWith('')),
      this.dayFilter.valueChanges.pipe(startWith('')),
    ]).subscribe(() => {
      this.applyFilters();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadItems(): void {
    this.itemsService.allItems$.subscribe((categories) => {
      // Initialize availability if not present
      const items = categories.map((category) => category.items).flat();
      const itemsWithAvailability = items.map((item) => {
        if (!item.availability) {
          item.availability = {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
          };
        }

        // Initialize allDays status
        this.updateAllDaysStatus(item);
        return item;
      });

      this.dataSource.data = itemsWithAvailability;
      this.filteredItems = itemsWithAvailability;
      this.loadingData = false;
    });
  }

  toggleAllDays(item: Item): void {
    if (!item.availability) return;

    const currentStatus = this.allDaysMap[item.uuid] || false;
    const newStatus = !currentStatus;

    // Update all days
    this.days.forEach((day) => {
      item.availability![day as keyof typeof item.availability] = newStatus;
    });

    // Update the allDays status
    this.allDaysMap[item.uuid] = newStatus;

    this.saveItemAvailability(item);
  }

  updateAllDaysStatus(item: Item): void {
    if (!item.availability || !item.uuid) return;

    const allEnabled = this.days.every(
      (day) => item.availability![day as keyof typeof item.availability]
    );

    this.allDaysMap[item.uuid] = allEnabled;
  }

  toggleAvailability(item: Item, day: string): void {
    if (item.availability) {
      item.availability[day as keyof typeof item.availability] =
        !item.availability[day as keyof typeof item.availability];

      // Update allDays status
      this.updateAllDaysStatus(item);

      this.saveItemAvailability(item);
    }
  }

  saveItemAvailability(item: Item): void {
    // this.itemsService.updateItem(item).subscribe({
    //   next: () => {
    //     // You might want to show a snackbar confirmation here
    //   },
    //   error: (err) => {
    //     console.error('Error updating item availability:', err);
    //     // Handle error, maybe revert the change in UI
    //   }
    // });
  }

  applyFilters(): void {
    this.dataSource.filterPredicate = (data: Item, filter: string) => {
      const availabilityFilterValue = this.availabilityFilter.value;
      const dayFilterValue = this.dayFilter.value;
      const term = this.searchTerm.value?.toLowerCase() || '';

      // First apply term filter
      const matchesTerm =
        term === '' ||
        data.enName.toLowerCase().includes(term) ||
        data.esName?.toLowerCase().includes(term) ||
        data.heName?.toLowerCase().includes(term);

      if (!matchesTerm) return false;

      // Then apply day filter
      if (dayFilterValue !== 'all' && data.availability) {
        if (availabilityFilterValue === 'available') {
          return data.availability[
            dayFilterValue as keyof typeof data.availability
          ];
        } else if (availabilityFilterValue === 'unavailable') {
          return !data.availability[
            dayFilterValue as keyof typeof data.availability
          ];
        }
        // If 'all availability' is selected, just return true when filtering by day
        return true;
      }

      // Handle availability filter across all days
      if (availabilityFilterValue !== 'all' && data.availability) {
        const isAvailableOnAnyDay = Object.values(data.availability).some(
          (value) => value
        );

        if (availabilityFilterValue === 'available') {
          return isAvailableOnAnyDay;
        } else {
          return !isAvailableOnAnyDay;
        }
      }

      // Default case: no filtering
      return true;
    };

    // This triggers the filter
    this.dataSource.filter = 'trigger';
    this.filteredItems = this.dataSource.filteredData;
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}
