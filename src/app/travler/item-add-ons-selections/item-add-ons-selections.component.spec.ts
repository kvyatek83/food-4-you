import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemAddOnsSelectionsComponent } from './item-add-ons-selections.component';

describe('ItemAddOnsSelectionsComponent', () => {
  let component: ItemAddOnsSelectionsComponent;
  let fixture: ComponentFixture<ItemAddOnsSelectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemAddOnsSelectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemAddOnsSelectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
