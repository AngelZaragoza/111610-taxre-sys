import { TestBed } from '@angular/core/testing';

import { ChoferesService } from './choferes.service';

describe('ChoferesService', () => {
  let service: ChoferesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChoferesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
