import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleOverviewComponent } from './schedule-overview.component';

describe('ScheduleOverviewComponent', () => {
  let component: ScheduleOverviewComponent;
  let fixture: ComponentFixture<ScheduleOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
