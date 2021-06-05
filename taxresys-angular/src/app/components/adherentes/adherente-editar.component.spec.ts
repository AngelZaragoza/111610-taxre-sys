import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdherenteEditarComponent } from './adherente-editar.component';

describe('AdherenteEditarComponent', () => {
  let component: AdherenteEditarComponent;
  let fixture: ComponentFixture<AdherenteEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdherenteEditarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdherenteEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
