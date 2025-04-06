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
import { DaysInWeek, Item } from '../../travler/travler.models';
import { ItemsService } from '../../services/items.service';
import { NoDataComponent } from '../../components/no-data/no-data.component';
import { NoResultsComponent } from '../../components/no-results/no-results.component';
import {
  LanguageDirection,
  LanguageService,
  LanguageType,
} from '../../services/lang.service';

const INIT_WEEK: DaysInWeek = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
};

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

  originalItemsState: { [key: string]: DaysInWeek } = {};
  modifiedRows: Set<string> = new Set();
  savingRows: { [key: string]: boolean } = {};

  days = Object.keys(INIT_WEEK) as (keyof DaysInWeek)[];

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
    this.loadingData = true;
    this.itemsService.allItems$.subscribe((categories) => {
      const items = categories.map((category) => category.items).flat();
      const itemsWithAvailability = items.map((item) => {
        if (!item.availability) {
          item.availability = INIT_WEEK;
        }

        this.originalItemsState[item.uuid] = {
          ...item.availability,
        };

        this.updateAllDaysStatus(item);
        return item;
      });

      this.dataSource.data = itemsWithAvailability;
      this.filteredItems = itemsWithAvailability;
      this.loadingData = false;
    });
  }

  toggleAllDays(item: Item): void {
    if (!item.availability || !item.uuid) return;

    const currentStatus = this.allDaysMap[item.uuid] || false;
    const newStatus = !currentStatus;

    this.days.forEach((day) => {
      item.availability![day as keyof typeof item.availability] = newStatus;
    });

    this.allDaysMap[item.uuid] = newStatus;

    this.checkForChanges(item);
  }

  toggleAvailability(item: Item, day: string): void {
    if (item.availability) {
      item.availability[day as keyof typeof item.availability] =
        !item.availability[day as keyof typeof item.availability];

      this.updateAllDaysStatus(item);

      this.checkForChanges(item);
    }
  }

  checkForChanges(item: Item): void {
    if (!item.uuid || !this.originalItemsState[item.uuid]) return;

    const originalAvailability = this.originalItemsState[item.uuid];
    const currentAvailability = item.availability;

    const hasChanges = this.days.some(
      (day) => originalAvailability[day] !== currentAvailability?.[day]
    );

    if (hasChanges) {
      this.modifiedRows.add(item.uuid);
    } else {
      this.modifiedRows.delete(item.uuid);
    }
  }

  revertItemChanges(item: Item): void {
    if (!item.uuid || !this.originalItemsState[item.uuid]) return;

    item.availability = { ...this.originalItemsState[item.uuid] };

    this.updateAllDaysStatus(item);

    this.modifiedRows.delete(item.uuid);
  }

  saveItemAvailability(item: Item): void {
    if (!item.uuid) return;

    this.savingRows[item.uuid] = true;

    setTimeout(() => {
      if (item.availability) {
        this.originalItemsState[item.uuid] = { ...item.availability };
      }

      this.modifiedRows.delete(item.uuid);
      this.savingRows[item.uuid] = false;
    }, 1000);

    // If using actual API:
    /*
  this.itemsService.updateItem(item).pipe(
    finalize(() => {
      this.savingRows[item.uuid] = false;
    })
  ).subscribe({
    next: () => {
      // Update original state after successful save
      if (item.availability) {
        this.originalItemsState[item.uuid].availability = { ...item.availability };
      }
      // Remove from modified list
      this.modifiedRows.delete(item.uuid);
    },
    error: (err) => {
      console.error('Error updating item availability:', err);
    }
  });
  */
  }

  updateAllDaysStatus(item: Item): void {
    if (!item.availability || !item.uuid) return;

    const allEnabled = this.days.every(
      (day) => item.availability![day as keyof typeof item.availability]
    );

    this.allDaysMap[item.uuid] = allEnabled;
  }

  applyFilters(): void {
    this.dataSource.filterPredicate = (data: Item, filter: string) => {
      const availabilityFilterValue = this.availabilityFilter.value;
      const dayFilterValue = this.dayFilter.value;
      const term = this.searchTerm.value?.toLowerCase() || '';

      const matchesTerm =
        term === '' ||
        data.enName.toLowerCase().includes(term) ||
        data.esName?.toLowerCase().includes(term) ||
        data.heName?.toLowerCase().includes(term);

      if (!matchesTerm) return false;

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
        return true;
      }

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

      return true;
    };

    this.dataSource.filter = 'trigger';
    this.filteredItems = this.dataSource.filteredData;
  }

  isRowModified(uuid: string): boolean {
    return this.modifiedRows.has(uuid);
  }

  isRowSaving(uuid: string): boolean {
    return this.savingRows[uuid] === true;
  }

  languageChanged(languageDirection: LanguageDirection): void {
    this.dir = languageDirection;
  }
}
