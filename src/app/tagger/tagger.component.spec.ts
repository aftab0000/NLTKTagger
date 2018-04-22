import { ActivatedRoute, Data } from '@angular/router';
import { Component } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';

/**
 * Load the implementations that should be tested.
 */
import { TaggerComponent } from './Tagger.component';

describe('Tagger', () => {
  /**
   * Provide our implementations or mocks to the dependency injector
   */
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      /**
       * Provide a better mock.
       */
      {
        provide: ActivatedRoute,
        useValue: {
          data: {
            subscribe: (fn: (value: Data) => void) => fn({
              yourData: 'yolo'
            })
          }
        }
      },
      TaggerComponent
    ]
  }));

  it('should log ngOnInit', inject([TaggerComponent], (Tagger: TaggerComponent) => {
    spyOn(console, 'log');
    expect(console.log).not.toHaveBeenCalled();

    Tagger.ngOnInit();
    expect(console.log).toHaveBeenCalled();
  }));

});
