// schedule-overview.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageDirectionDirective } from '../../directives/language-direction.directive';
import { MaterialModule } from '../../material.module';
import { PropertiesTranslationPipe } from '../../pipes/properties-translation.pipe';
import { Item } from '../../travler/travler.models';
import { ItemsService } from '../../services/items.service';

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
  ],
  styleUrls: ['./schedule-overview.component.scss'],
})
export class ScheduleOverviewComponent implements OnInit {
  dataSource = new MatTableDataSource<Item>([]);
  displayedColumns: string[] = [
    'name',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
    'actions',
  ];
  availabilityFilter = new FormControl('all');
  dayFilter = new FormControl('all');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterOptions = [
    { value: 'all', viewValue: 'All Items' },
    { value: 'available', viewValue: 'Available Items' },
    { value: 'unavailable', viewValue: 'Unavailable Items' },
  ];

  dayOptions = [
    { value: 'all', viewValue: 'All Days' },
    { value: 'monday', viewValue: 'Monday' },
    { value: 'tuesday', viewValue: 'Tuesday' },
    { value: 'wednesday', viewValue: 'Wednesday' },
    { value: 'thursday', viewValue: 'Thursday' },
    { value: 'friday', viewValue: 'Friday' },
    { value: 'saturday', viewValue: 'Saturday' },
    { value: 'sunday', viewValue: 'Sunday' },
  ];

  constructor(private itemsService: ItemsService) {}

  ngOnInit(): void {
    this.loadItems();

    // Set up filters
    this.availabilityFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    this.dayFilter.valueChanges.subscribe(() => {
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
        return item;
      });

      this.dataSource.data = itemsWithAvailability;
    });
  }

  toggleAvailability(item: Item, day: string): void {
    if (item.availability) {
      item.availability[day as keyof typeof item.availability] =
        !item.availability[day as keyof typeof item.availability];
      this.saveItemAvailability(item);
    }
  }

  saveItemAvailability(item: Item): void {
    // this.itemService.updateItem(item).subscribe({
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

      // Handle day filter
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
  }

  getDayName(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  getDisplayName(item: Item): string {
    // Return name based on language preference, defaulting to English
    // You can customize this based on your app's language settings
    return item.enName;
  }
}
