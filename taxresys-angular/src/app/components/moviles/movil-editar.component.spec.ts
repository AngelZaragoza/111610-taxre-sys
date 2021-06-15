import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovilEditarComponent } from './movil-editar.component';

describe('MovilEditarComponent', () => {
  let component: MovilEditarComponent;
  let fixture: ComponentFixture<MovilEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovilEditarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovilEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
