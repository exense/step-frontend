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

  it('AC-1: shows single-error status, occurrence count and actions without a table link', fakeAsync(() => {
    updateErrors([error()]);

    expect(text()).toContain('1 distinct error · 1 occurrence');
    expect(text()).toContain('Payment request failed');
    expect(text()).toContain('FAILED');
    expect(links().some((link) => link.textContent?.includes('error table'))).toBe(false);
  }));

  it('AC-2: keeps repeated-error status, message and working actions without a table link', fakeAsync(() => {
    const searchFor = jest.fn();
    fixture.componentInstance.searchFor.subscribe(searchFor);
    updateErrors([error({ count: 5 })]);

    expect(navigationButtons()).toHaveLength(1);
    navigationButtons()[0].click();
    expect(searchFor).toHaveBeenCalledTimes(1);
    expect(searchFor).toHaveBeenCalledWith('Payment request failed');
    expect(text()).toContain('1 distinct error · 5 occurrences');
    expect(text()).toContain('Payment request failed');
    expect(text()).toContain('FAILED');
    expect(links().some((link) => link.textContent?.includes('error table'))).toBe(false);
  }));

  it('AC-3: displays every status belonging to one distinct error', fakeAsync(() => {
    updateErrors([error({ count: 5, types: ['FAILED', 'TECHNICAL_ERROR'] })]);

    expect(text()).toContain('FAILED');
    expect(text()).toContain('TECHNICAL_ERROR');
    expect(text()).toContain('Payment request failed');
    expect(text()).toContain('1 distinct error · 5 occurrences');
  }));

  it('AC-4: distinguishes counts and requests the error table without a single-error body', fakeAsync(() => {
    const showDetails = jest.fn();
    fixture.componentInstance.showDetails.subscribe(showDetails);
    updateErrors([
      error({ count: 2, percentage: 40 }),
      error({ errorMessage: 'Connection timed out', errorCode: 504, count: 3, percentage: 60 }),
    ]);

    expect(text()).toContain('2 distinct errors · 5 occurrences');
    expect(text()).not.toContain('Payment request failed');
    expect(text()).not.toContain('Connection timed out');
    expect(navigationButtons()).toHaveLength(0);
    expect(text()).toContain('View error details in error table');
    const details = links().find((link) => link.textContent?.trim() === 'error table');
    expect(details).toBeDefined();
    details!.click();
    expect(showDetails).toHaveBeenCalledTimes(1);
  }));

  it('AC-1 AC-2: keeps messages non-clickable while tree actions are available, removed and restored', fakeAsync(() => {
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

    function expectNonClickableMessage(entry: TimeSeriesErrorEntry): void {
      expect(text()).toContain(entry.errorMessage);
      const interactiveElements = element.querySelectorAll<HTMLElement>(
        'a[href], button, [role="link"], [role="button"]',
      );
      expect(
        Array.from(interactiveElements).some((candidate) => candidate.textContent?.includes(entry.errorMessage)),
      ).toBe(false);
      const message = Array.from(element.querySelectorAll<HTMLElement>('*')).find(
        (candidate) => candidate.textContent?.trim() === entry.errorMessage,
      );
      expect(message).toBeDefined();
      message!.click();
    }

    fixture.componentRef.setInput('searchActions', [tree]);
    const entry = error();
    updateErrors([entry]);
    expectNonClickableMessage(entry);
    expect(activate).not.toHaveBeenCalled();
    expect(legacySearch).not.toHaveBeenCalled();
    expect(navigationButtons()).toHaveLength(1);
    navigationButtons()[0].click();
    expect(activate).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenLastCalledWith(entry);
    expect(legacySearch).not.toHaveBeenCalled();

    fixture.componentRef.setInput('searchActions', []);
    updateErrors([entry]);
    expectNonClickableMessage(entry);
    expect(navigationButtons()).toHaveLength(0);
    expect(activate).toHaveBeenCalledTimes(1);
    expect(legacySearch).not.toHaveBeenCalled();

    fixture.componentRef.setInput('searchActions', [tree]);
    const repeated = error({ count: 2 });
    updateErrors([repeated]);
    expectNonClickableMessage(repeated);
    expect(activate).toHaveBeenCalledTimes(1);
    expect(legacySearch).not.toHaveBeenCalled();
    expect(navigationButtons()).toHaveLength(1);
    navigationButtons()[0].click();
    expect(activate).toHaveBeenCalledTimes(2);
    expect(activate).toHaveBeenLastCalledWith(repeated);
    expect(legacySearch).not.toHaveBeenCalled();
  }));

  it('AC-6: updates empty, single, repeated and multiple errors without stale content', fakeAsync(() => {
    updateErrors([]);
    expect(text()).toBe('');
    expect(links()).toHaveLength(0);
    expect(navigationButtons()).toHaveLength(0);

    updateErrors([error({ types: ['FAILED', 'TECHNICAL_ERROR'] })]);
    expect(text()).toContain('1 distinct error · 1 occurrence');
    expect(text()).toContain('Payment request failed');
    expect(text()).toContain('FAILED');
    expect(links().some((link) => link.textContent?.includes('error table'))).toBe(false);
    expect(navigationButtons()).toHaveLength(1);

    updateErrors([error({ count: 5, types: ['FAILED', 'TECHNICAL_ERROR'] })]);
    expect(text()).toContain('1 distinct error · 5 occurrences');
    expect(text()).toContain('Payment request failed');
    expect(text()).toContain('FAILED');
    expect(links().some((link) => link.textContent?.includes('error table'))).toBe(false);
    expect(navigationButtons()).toHaveLength(1);

    updateErrors([
      error({ errorMessage: 'First updated error', count: 2, percentage: 50 }),
      error({ errorMessage: 'Second updated error', errorCode: 503, count: 2, percentage: 50 }),
    ]);
    expect(text()).toContain('2 distinct errors · 4 occurrences');
    expect(text()).not.toContain('Payment request failed');
    expect(text()).not.toContain('TECHNICAL_ERROR');
    expect(text()).not.toContain('FAILED');
    expect(text()).toContain('View error details in error table');
    expect(links().some((link) => link.textContent?.trim() === 'error table')).toBe(true);
    expect(navigationButtons()).toHaveLength(0);

    updateErrors([error({ errorMessage: 'New single error', types: ['TECHNICAL_ERROR'] })]);
    expect(text()).toContain('1 distinct error · 1 occurrence');
    expect(text()).toContain('New single error');
    expect(text()).toContain('TECHNICAL_ERROR');
    expect(text()).not.toContain('FAILED');
    expect(links().some((link) => link.textContent?.includes('error table'))).toBe(false);
    expect(navigationButtons()).toHaveLength(1);

    updateErrors([]);
    expect(text()).toBe('');
    expect(links()).toHaveLength(0);
    expect(navigationButtons()).toHaveLength(0);
  }));
});
