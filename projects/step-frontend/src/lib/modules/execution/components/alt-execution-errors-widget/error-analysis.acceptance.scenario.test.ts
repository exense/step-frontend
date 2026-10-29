import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TimeSeriesErrorEntry } from '@exense/step-core';
import { ClampFadeDirective } from '../../../../../../../step-core/src/lib/directives/clamp-fade.directive';
import { StepBasicsModule } from '../../../../../../../step-core/src/lib/modules/basics/step-basics.module';
import { StepIconsModule } from '../../../../../../../step-core/src/lib/modules/step-icons/step-icons.module';
import { StepMaterialModule } from '../../../../../../../step-core/src/lib/modules/step-material/step-material.module';
import { AltReportWidgetContentDirective } from '../../directives/alt-report-widget-content.directive';
import { AltReportWidgetTitleDirective } from '../../directives/alt-report-widget-title.directive';
import { AltReportWidgetComponent } from '../alt-report-widget/alt-report-widget.component';
import { StatusComponent } from '../status/status.component';
import { AltExecutionErrorsWidgetComponent } from './alt-execution-errors-widget.component';

describe('SED-5023 error overview acceptance', () => {
  let fixture: ComponentFixture<AltExecutionErrorsWidgetComponent>;
  let element: HTMLElement;

  function error(options: Partial<TimeSeriesErrorEntry> = {}): TimeSeriesErrorEntry {
    return {
      errorMessage: 'Payment request failed',
      errorCode: 500,
      count: 1,
      percentage: 100,
      executionIds: ['execution-1'],
      executionIdsTruncated: false,
      types: ['FAILED'],
      ...options,
    };
  }

  function updateErrors(errors: TimeSeriesErrorEntry[]): void {
    fixture.componentRef.setInput('errors', errors);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  function text(): string {
    return element.textContent!.replace(/\s+/g, ' ').trim();
  }

  function links(): HTMLAnchorElement[] {
    return Array.from(element.querySelectorAll<HTMLAnchorElement>('a[href]'));
  }

  function navigationButtons(): HTMLButtonElement[] {
    return Array.from(element.querySelectorAll<HTMLButtonElement>('button')).filter((button) =>
      /^Find error in /i.test(button.getAttribute('aria-label') ?? button.textContent?.trim() ?? ''),
    );
  }

  function expectOriginalPresentation(): void {
    expect(text()).not.toContain('FAILED');
    expect(text()).not.toContain('ERROR');
    expect(text()).not.toContain('TECHNICAL_ERROR');
    expect(text()).not.toContain('This error occurred');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ClampFadeDirective,
        StepBasicsModule,
        StepIconsModule,
        StepMaterialModule,
        AltReportWidgetContentDirective,
      ],
      declarations: [
        AltExecutionErrorsWidgetComponent,
        AltReportWidgetComponent,
        AltReportWidgetTitleDirective,
        StatusComponent,
      ],
      providers: [provideNoopAnimations()],
    });
    fixture = TestBed.createComponent(AltExecutionErrorsWidgetComponent);
    element = fixture.nativeElement;
  });

  afterEach(() => fixture.destroy());

  it('AC-1: retains the original single-occurrence message and table link without status or repetition rows', fakeAsync(() => {
    updateErrors([error()]);

    expect(text()).toContain('This execution contains 1 error');
    expect(text()).toContain('Payment request failed');
    expectOriginalPresentation();
    expect(links().some((link) => link.textContent?.includes('show in error table'))).toBe(true);
  }));

  it('AC-2: keeps a repeated distinct message and table link but hides new overview buttons and extra rows', fakeAsync(() => {
    updateErrors([error({ count: 2, types: ['FAILED', 'TECHNICAL_ERROR'] })]);

    expect(text()).toContain('This execution contains 2 errors');
    expect(text()).toContain('Payment request failed');
    expect(navigationButtons()).toHaveLength(0);
    expectOriginalPresentation();
    expect(links().some((link) => link.textContent?.includes('show in error table'))).toBe(true);
  }));

  it('AC-3: sums distinct-error occurrences and requests the table without a single-error body', fakeAsync(() => {
    const showDetails = jest.fn();
    fixture.componentInstance.showDetails.subscribe(showDetails);
    updateErrors([
      error({ count: 2, percentage: 40 }),
      error({ errorMessage: 'Connection timed out', errorCode: 504, count: 3, percentage: 60 }),
    ]);

    expect(text()).toContain('This execution contains 5 errors');
    expect(text()).not.toContain('Payment request failed');
    expect(text()).not.toContain('Connection timed out');
    expect(navigationButtons()).toHaveLength(0);
    const details = links().find((link) => link.textContent?.includes('show in error table'));
    expect(details).toBeDefined();
    details!.click();
    expect(showDetails).toHaveBeenCalledTimes(1);
  }));

  it('AC-4 AC-5: restores message-to-tree navigation only while the tree destination is available', fakeAsync(() => {
    const activate = jest.fn();
    const legacySearch = jest.fn();
    fixture.componentInstance.searchFor.subscribe(legacySearch);
    const tree = {
      id: 'tree',
      label: 'Find error in tree',
      icon: 'tree',
      isAvailable: (): boolean => true,
      activate,
    };
    fixture.componentRef.setInput('searchActions', [tree]);
    const entry = error();
    updateErrors([entry]);
    const messageLink = links().find((link) => link.textContent?.trim() === entry.errorMessage);
    expect(messageLink).toBeDefined();
    messageLink!.click();
    expect(activate).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenLastCalledWith(entry);
    expect(legacySearch).not.toHaveBeenCalled();

    fixture.componentRef.setInput('searchActions', []);
    updateErrors([entry]);
    expect(text()).toContain('Payment request failed');
    const interactiveElements = element.querySelectorAll<HTMLElement>(
      'a[href], button, [role="link"], [role="button"]',
    );
    expect(
      Array.from(interactiveElements).some((candidate) => candidate.textContent?.includes('Payment request failed')),
    ).toBe(false);

    fixture.componentRef.setInput('searchActions', [tree]);
    const repeated = error({ count: 2 });
    updateErrors([repeated]);
    expect(navigationButtons()).toHaveLength(0);
    const restoredLink = links().find((link) => link.textContent?.trim() === repeated.errorMessage);
    expect(restoredLink).toBeDefined();
    restoredLink!.click();
    expect(activate).toHaveBeenCalledTimes(2);
    expect(activate).toHaveBeenLastCalledWith(repeated);
    expect(legacySearch).not.toHaveBeenCalled();
  }));

  it('AC-7: updates empty, one occurrence, repeated and multiple errors without stale content or extra rows', fakeAsync(() => {
    updateErrors([]);
    expect(text()).toBe('');
    expect(links()).toHaveLength(0);
    expect(navigationButtons()).toHaveLength(0);

    updateErrors([error({ types: ['FAILED', 'TECHNICAL_ERROR'] })]);
    expect(text()).toContain('This execution contains 1 error');
    expect(text()).toContain('Payment request failed');
    expectOriginalPresentation();
    expect(links().some((link) => link.textContent?.includes('show in error table'))).toBe(true);
    expect(navigationButtons()).toHaveLength(1);

    updateErrors([error({ count: 2, types: ['FAILED', 'TECHNICAL_ERROR'] })]);
    expect(text()).toContain('This execution contains 2 errors');
    expect(text()).toContain('Payment request failed');
    expectOriginalPresentation();
    expect(links().some((link) => link.textContent?.includes('show in error table'))).toBe(true);
    expect(navigationButtons()).toHaveLength(0);

    updateErrors([
      error({ errorMessage: 'First updated error', count: 2, percentage: 50 }),
      error({ errorMessage: 'Second updated error', errorCode: 503, count: 2, percentage: 50 }),
    ]);
    expect(text()).toContain('This execution contains 4 errors');
    expect(text()).not.toContain('Payment request failed');
    expect(text()).not.toContain('TECHNICAL_ERROR');
    expect(text()).not.toContain('This error occurred');
    expectOriginalPresentation();
    expect(links().some((link) => link.textContent?.includes('show in error table'))).toBe(true);
    expect(navigationButtons()).toHaveLength(0);

    updateErrors([error({ errorMessage: 'New single error', types: ['TECHNICAL_ERROR'] })]);
    expect(text()).toContain('This execution contains 1 error');
    expect(text()).toContain('New single error');
    expectOriginalPresentation();
    expect(links().some((link) => link.textContent?.includes('show in error table'))).toBe(true);
    expect(navigationButtons()).toHaveLength(1);

    updateErrors([]);
    expect(text()).toBe('');
    expect(links()).toHaveLength(0);
    expect(navigationButtons()).toHaveLength(0);
  }));
});
