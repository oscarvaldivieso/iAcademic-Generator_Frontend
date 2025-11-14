import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicOfferComponent } from './academic-offer.component';

describe('AcademicOfferComponent', () => {
  let component: AcademicOfferComponent;
  let fixture: ComponentFixture<AcademicOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicOfferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
