import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkoutPlanPageComponent } from './user-workout-plan-page.component';

describe('UserWorkoutPlanPageComponent', () => {
  let component: UserWorkoutPlanPageComponent;
  let fixture: ComponentFixture<UserWorkoutPlanPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWorkoutPlanPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserWorkoutPlanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
