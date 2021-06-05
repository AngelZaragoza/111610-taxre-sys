import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoferEditarComponent } from './chofer-editar.component';

describe('ChoferEditarComponent', () => {
  let component: ChoferEditarComponent;
  let fixture: ComponentFixture<ChoferEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoferEditarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoferEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
