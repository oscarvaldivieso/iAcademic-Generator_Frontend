import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreEnrollmentComponent } from './pre-enrollment.component';

describe('PreEnrollmentComponent', () => {
  let component: PreEnrollmentComponent;
  let fixture: ComponentFixture<PreEnrollmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreEnrollmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
