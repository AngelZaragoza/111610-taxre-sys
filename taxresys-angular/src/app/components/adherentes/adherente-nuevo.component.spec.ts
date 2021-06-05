import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherenteNuevoComponent } from './adherente-nuevo.component';

describe('AdherenteNuevoComponent', () => {
  let component: AdherenteNuevoComponent;
  let fixture: ComponentFixture<AdherenteNuevoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherenteNuevoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdherenteNuevoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
