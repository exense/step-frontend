import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, RouteReuseStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ExecutionRouteReuseStrategy, RECREATE_ON_EXECUTION_CHANGE } from './execution-route-reuse-strategy';

let createdViews = 0;

@Component({
  template: '{{ instance }}:{{ executionId }}',
})
class ExecutionViewProbeComponent {
  protected readonly instance = ++createdViews;
  protected readonly executionId = inject(ActivatedRoute).snapshot.paramMap.get('id');
}

describe('Execution view isolation', () => {
  beforeEach(() => {
    createdViews = 0;
    TestBed.configureTestingModule({
      imports: [ExecutionViewProbeComponent],
      providers: [
        { provide: RouteReuseStrategy, useClass: ExecutionRouteReuseStrategy },
        provideRouter([
          {
            path: 'executions/:id',
            component: ExecutionViewProbeComponent,
            data: { [RECREATE_ON_EXECUTION_CHANGE]: true },
          },
        ]),
      ],
    });
  });

  it('recreates an execution view for another ID but retains it for the same ID', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/executions/case');
    expect(harness.routeNativeElement?.textContent).toBe('1:case');

    await harness.navigateByUrl('/executions/suite');
    expect(harness.routeNativeElement?.textContent).toBe('2:suite');

    await harness.navigateByUrl('/executions/suite?tab=report');
    expect(harness.routeNativeElement?.textContent).toBe('2:suite');

    await harness.navigateByUrl('/executions/case');
    expect(harness.routeNativeElement?.textContent).toBe('3:case');
  });
});
