import { TestBed } from '@angular/core/testing';

import { AdherentesService } from './adherentes.service';

describe('AdherentesService', () => {
  let service: AdherentesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdherentesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
