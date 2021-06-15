import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMovilComponent } from './form-movil.component';

describe('FormMovilComponent', () => {
  let component: FormMovilComponent;
  let fixture: ComponentFixture<FormMovilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormMovilComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMovilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
