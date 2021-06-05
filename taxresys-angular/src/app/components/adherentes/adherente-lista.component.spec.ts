import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherenteListaComponent } from './adherente-lista.component';

describe('AdherenteListaComponent', () => {
  let component: AdherenteListaComponent;
  let fixture: ComponentFixture<AdherenteListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherenteListaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdherenteListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
