import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { BaseHttpRequest } from '../../generated/core/BaseHttpRequest';
import { ApiRequestOptions } from '../../generated/core/ApiRequestOptions';
import { Execution, ExecutionOverview } from '../../generated';
import { TableApiWrapperService, TableRemoteDataSourceFactoryService } from '../../table';
import { AugmentedExecutionsService } from './augmented-executions.service';

type Response = Execution | ExecutionOverview;

interface ExecutionRequest {
  id: string;
  response$: Subject<Response>;
}

describe.each(['overview', 'execution'] as const)('Execution %s cache', (kind) => {
  let api: AugmentedExecutionsService;
  let requests: ExecutionRequest[];
  let pending: Set<ExecutionRequest>;

  function load(id: string): Observable<Response> {
    return kind === 'overview' ? api.getExecutionOverviewCached(id) : api.getExecutionByIdCached(id);
  }

  function response(id: string, status: Execution['status'] = 'ENDED'): Response {
    const execution: Execution = { id, status };
    return kind === 'overview' ? { execution } : execution;
  }

  function execution(value: Response): Execution | undefined {
    return kind === 'overview' ? (value as ExecutionOverview).execution : (value as Execution);
  }

  function complete(request: ExecutionRequest, value: Response): void {
    request.response$.next(value);
    request.response$.complete();
  }

  beforeEach(() => {
    requests = [];
    pending = new Set();
    TestBed.configureTestingModule({
      providers: [
        AugmentedExecutionsService,
        { provide: HttpClient, useValue: {} },
        { provide: TableRemoteDataSourceFactoryService, useValue: {} },
        { provide: TableApiWrapperService, useValue: {} },
        {
          provide: BaseHttpRequest,
          useValue: {
            request: (options: ApiRequestOptions): Observable<Response> =>
              new Observable((subscriber) => {
                const request = { id: options.path!['id'] as string, response$: new Subject<Response>() };
                requests.push(request);
                pending.add(request);
                const subscription = request.response$.subscribe(subscriber);
                return (): void => {
                  pending.delete(request);
                  subscription.unsubscribe();
                };
              }),
          },
        },
      ],
    });
    api = TestBed.inject(AugmentedExecutionsService);
  });

  it('shares concurrent loads of A, reuses its result, and keeps a requested B separate', () => {
    const values: Response[] = [];
    load('A').subscribe((value) => values.push(value));
    load('A').subscribe((value) => values.push(value));
    expect(requests.map((request) => request.id)).toEqual(['A']);
    const first = response('A');
    complete(requests[0], first);
    expect(values).toEqual([first, first]);
    load('A').subscribe((value) => values.push(value));
    expect(requests).toHaveLength(1);
    expect(values).toEqual([first, first, first]);

    load('B').subscribe((value) => values.push(value));
    expect(requests.map((request) => request.id)).toEqual(['A', 'B']);
    expect(values).toHaveLength(3);
    api.cleanupCache('A');
    load('B').subscribe((value) => values.push(value));
    expect(requests).toHaveLength(2);
    const second = response('B');
    complete(requests[1], second);
    expect(execution(values.at(-1)!)?.id).toBe('B');
    api.cleanupCache('A');
    load('B').subscribe((value) => values.push(value));
    expect(requests).toHaveLength(2);
  });

  it('does not let a late response overwrite a result loaded after invalidation', () => {
    load('A').subscribe();
    const staleRequest = requests[0];
    api.cleanupCache();
    load('A').subscribe();
    const fresh = response('A');
    complete(requests[1], fresh);
    complete(staleRequest, response('A', 'RUNNING'));
    let cached: Response | undefined;
    load('A').subscribe((value) => (cached = value));
    expect(cached).toBe(fresh);
    expect(requests).toHaveLength(2);

    api.cleanupCache();
    load('A').subscribe();
    const invalidatedRequest = requests.at(-1)!;
    api.cleanupCache();
    complete(invalidatedRequest, response('A', 'RUNNING'));
    const requestCount = requests.length;
    load('A').subscribe();
    expect(requests).toHaveLength(requestCount + 1);
    complete(requests.at(-1)!, fresh);

    api.cleanupCache();
    load('A').subscribe();
    const olderRequest = requests.at(-1)!;
    api.cleanupCache();
    load('A').subscribe();
    const newerRequest = requests.at(-1)!;
    complete(olderRequest, response('A', 'RUNNING'));
    const concurrent: Response[] = [];
    const countBeforeJoining = requests.length;
    load('A').subscribe((value) => concurrent.push(value));
    expect(concurrent).toEqual([]);
    expect(requests).toHaveLength(countBeforeJoining);
    complete(newerRequest, fresh);
    expect(concurrent).toEqual([fresh]);
  });

  it('keeps a shared load until its last observer leaves and permits fresh loads after cancellation or failure', () => {
    const first = load('A').subscribe();
    const second = load('A').subscribe();
    expect(requests).toHaveLength(1);
    const abandoned = requests[0];
    first.unsubscribe();
    expect(pending.has(abandoned)).toBe(true);
    second.unsubscribe();
    expect(pending.has(abandoned)).toBe(false);

    const errors: unknown[] = [];
    load('A').subscribe({ error: (error) => errors.push(error) });
    const failure = new Error('Overview failed');
    requests.at(-1)!.response$.error(failure);
    expect(errors).toEqual([failure]);
    expect(pending.size).toBe(0);
    let recovered: Response | undefined;
    load('A').subscribe((value) => (recovered = value));
    const fresh = response('A');
    complete(requests.at(-1)!, fresh);
    expect(recovered).toBe(fresh);
    expect(requests).toHaveLength(3);
    expect(pending.size).toBe(0);
  });
});
