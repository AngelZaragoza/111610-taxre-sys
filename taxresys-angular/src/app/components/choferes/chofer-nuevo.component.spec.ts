import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoferNuevoComponent } from './chofer-nuevo.component';

describe('ChoferNuevoComponent', () => {
  let component: ChoferNuevoComponent;
  let fixture: ComponentFixture<ChoferNuevoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoferNuevoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoferNuevoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
