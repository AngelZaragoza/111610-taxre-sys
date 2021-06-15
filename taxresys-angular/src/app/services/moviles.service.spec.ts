import { TestBed } from '@angular/core/testing';

import { MovilesService } from './moviles.service';

describe('MovilesService', () => {
  let service: MovilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
