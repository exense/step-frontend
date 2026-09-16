import { Subject } from 'rxjs';
import { TableRemoteDataSource } from './table-remote-data-source';
import { TableApiWrapperService, TableResponseGeneric } from '../../../client/step-client-module';

jest.mock('../../../client/step-client-module', () => ({
  SortDirection: { ASCENDING: 'ASCENDING', DESCENDING: 'DESCENDING' },
}));

describe('TableRemoteDataSource loading state', () => {
  let source: TableRemoteDataSource<string>;
  let requests: Subject<TableResponseGeneric<string>>[];
  let loading: boolean;
  let rows: string[];

  const respond = (index: number, data: string[]): void => {
    requests[index].next({ data, recordsFiltered: data.length, recordsTotal: data.length });
    requests[index].complete();
  };

  beforeEach(() => {
    jest.useFakeTimers();
    requests = [];
    const rest = {
      requestTable: jest.fn(() => {
        const request = new Subject<TableResponseGeneric<string>>();
        requests.push(request);
        return request;
      }),
    } as unknown as TableApiWrapperService;
    source = new TableRemoteDataSource<string>('test', rest, { name: 'name' });
    source.inProgress$.subscribe((value) => (loading = value));
    source.data$.subscribe((value) => (rows = value));
  });

  afterEach(() => {
    source.destroy();
    jest.useRealTimers();
  });

  it('re-enables progress when an older response finished during the next debounce', () => {
    source.getTableData({ isForce: true });
    jest.advanceTimersByTime(200);
    jest.advanceTimersByTime(50);
    source.getTableData({ search: { name: 'next' }, isForce: true });
    jest.advanceTimersByTime(50);
    respond(0, ['old']);
    expect(rows).toEqual(['old']);
    expect(loading).toBe(false);
    jest.advanceTimersByTime(150);
    expect(requests).toHaveLength(2);
    expect(rows).toEqual([]);
    expect(loading).toBe(true);
    respond(1, ['next']);
    expect(rows).toEqual(['next']);
    expect(loading).toBe(false);
  });

  it('activates progress after cancellation finalizes the preceding request', () => {
    source.getTableData({ isForce: true });
    jest.advanceTimersByTime(200);
    source.getTableData({ search: { name: 'next' }, isForce: true });
    jest.advanceTimersByTime(200);
    expect(requests[0].observed).toBe(false);
    expect(loading).toBe(true);
    respond(0, ['stale']);
    expect(rows).toEqual([]);
    respond(1, ['next']);
    expect(rows).toEqual(['next']);
    expect(loading).toBe(false);
  });

  it('keeps rows and suppresses progress for a background refresh', () => {
    source.getTableData();
    jest.advanceTimersByTime(200);
    respond(0, ['old']);
    source.reload({ isForce: true, hideProgress: true });
    jest.advanceTimersByTime(200);
    expect(rows).toEqual(['old']);
    expect(loading).toBe(false);
    respond(1, ['new']);
    expect(rows).toEqual(['new']);
    expect(loading).toBe(false);
  });

  it('reuses a running request when no forced reload was requested', () => {
    source.getTableData();
    jest.advanceTimersByTime(200);
    source.reload();
    jest.advanceTimersByTime(200);
    expect(requests).toHaveLength(1);
    expect(loading).toBe(true);
    respond(0, ['result']);
    expect(rows).toEqual(['result']);
    expect(loading).toBe(false);
  });

  it('honors immediate progress suppression while reusing an ongoing request', () => {
    source.getTableData();
    jest.advanceTimersByTime(200);
    source.reload({ hideProgress: true, immediateHideProgress: true });
    expect(loading).toBe(false);
    jest.advanceTimersByTime(200);
    expect(requests).toHaveLength(1);
    expect(loading).toBe(false);
    respond(0, ['result']);
    expect(rows).toEqual(['result']);
  });

  it('clears progress on error and allows a later retry', () => {
    source.getTableData();
    jest.advanceTimersByTime(200);
    requests[0].error(new Error('test failure'));
    expect(loading).toBe(false);
    source.reload({ isForce: true });
    jest.advanceTimersByTime(200);
    expect(loading).toBe(true);
    respond(1, ['retry']);
    expect(rows).toEqual(['retry']);
    expect(loading).toBe(false);
  });
});
