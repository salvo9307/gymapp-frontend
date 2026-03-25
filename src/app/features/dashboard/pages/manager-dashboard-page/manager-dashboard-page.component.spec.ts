import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerDashboardPageComponent } from './manager-dashboard-page.component';

describe('ManagerDashboardPageComponent', () => {
  let component: ManagerDashboardPageComponent;
  let fixture: ComponentFixture<ManagerDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerDashboardPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
