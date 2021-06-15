import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovilListaComponent } from './movil-lista.component';

describe('MovilListaComponent', () => {
  let component: MovilListaComponent;
  let fixture: ComponentFixture<MovilListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovilListaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovilListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
