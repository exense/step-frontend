import { SchemasFactoryService, ScreensService, Input as ScreenInput, JsonFieldsSchema } from '@exense/step-core';
import { map, Observable, of, timer } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { TestScheduler } from 'rxjs/testing';

const MOCK_API_RESPONSE: ScreenInput[] = [
  {
    id: 'foo',
    label: 'Foo',
    type: 'TEXT',
  },
  {
    id: 'attributes.bar',
    label: 'Bar',
    type: 'TEXT',
  },
  {
    id: 'attributes.boo',
    label: 'Boo',
    type: 'CHECKBOX',
  },
  {
    id: 'attributes.bazz',
    label: 'Bazz',
    type: 'DROPDOWN',
    options: [{ value: 'aaa' }, { value: 'bbb' }, { value: 'ccc' }],
  },
];

const SCHEMA_RESULT: JsonFieldsSchema = {
  properties: {
    bar: {
      type: 'string',
    },
    boo: {
      type: 'boolean',
    },
    bazz: {
      enum: ['aaa', 'bbb', 'ccc'],
    },
  },
};

describe('SchemasFactoryService', () => {
  let schemasFactoryService: SchemasFactoryService;
  let scheduler: TestScheduler;

  beforeEach(async () => {
    const screenApiMock: Partial<ScreensService> = {
      getInputsForScreenPost(screenId): Observable<ScreenInput[]> {
        return timer(100).pipe(map(() => MOCK_API_RESPONSE));
      },
    };
    await TestBed.configureTestingModule({
      providers: [{ provide: ScreensService, useValue: screenApiMock }, SchemasFactoryService],
    }).compileComponents();

    schemasFactoryService = TestBed.inject(SchemasFactoryService);
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('create schema', () => {
    scheduler.run(({ expectObservable }) => {
      const schema$ = schemasFactoryService.buildAttributesSchemaForScreen('some_screen');
      expectObservable(schema$).toBe('100ms (a|)', { a: SCHEMA_RESULT });
    });
  });
});
