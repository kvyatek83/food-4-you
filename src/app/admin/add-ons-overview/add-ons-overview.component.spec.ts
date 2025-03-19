import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnsOverviewComponent } from './add-ons-overview.component';

describe('AddOnsOverviewComponent', () => {
  let component: AddOnsOverviewComponent;
  let fixture: ComponentFixture<AddOnsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOnsOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
