import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoferListaComponent } from './chofer-lista.component';

describe('ChoferListaComponent', () => {
  let component: ChoferListaComponent;
  let fixture: ComponentFixture<ChoferListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoferListaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoferListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
