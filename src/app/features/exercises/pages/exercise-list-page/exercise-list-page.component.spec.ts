import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseListPageComponent } from './exercise-list-page.component';

describe('ExerciseListPageComponent', () => {
  let component: ExerciseListPageComponent;
  let fixture: ComponentFixture<ExerciseListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseListPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
