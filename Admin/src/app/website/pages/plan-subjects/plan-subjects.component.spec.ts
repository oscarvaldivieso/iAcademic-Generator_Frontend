import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSubjectsComponent } from './plan-subjects.component';

describe('PlanSubjectsComponent', () => {
  let component: PlanSubjectsComponent;
  let fixture: ComponentFixture<PlanSubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanSubjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanSubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
