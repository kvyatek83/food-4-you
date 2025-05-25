import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnFormComponent } from './add-on-form.component';

describe('AddOnFormComponent', () => {
  let component: AddOnFormComponent;
  let fixture: ComponentFixture<AddOnFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOnFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});