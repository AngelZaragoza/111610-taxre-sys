import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovilNuevoComponent } from './movil-nuevo.component';

describe('MovilNuevoComponent', () => {
  let component: MovilNuevoComponent;
  let fixture: ComponentFixture<MovilNuevoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovilNuevoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovilNuevoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
