import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkoutPlanPageComponent } from './create-workout-plan-page.component';

describe('CreateWorkoutPlanPageComponent', () => {
  let component: CreateWorkoutPlanPageComponent;
  let fixture: ComponentFixture<CreateWorkoutPlanPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWorkoutPlanPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWorkoutPlanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
