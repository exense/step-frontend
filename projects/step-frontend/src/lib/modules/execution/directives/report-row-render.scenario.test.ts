import { Component, input } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { resizeObserverMock } from '@exense/step-core/testing';
import { ReportRowRenderQueueService } from '../services/report-row-render-queue.service';
import { VIEW_MODE, ViewMode } from '../shared/view-mode';
import { ReportRowRenderDirective } from './report-row-render.directive';

@Component({
  selector: 'step-report-rows-test',
  imports: [ReportRowRenderDirective],
  providers: [ReportRowRenderQueueService],
  template: `
    @for (id of ids(); track id) {
      <button type="button" [attr.data-open-row]="id" (focus)="row.renderNow()">Open {{ id }}</button>
      <div stepReportRowRender #row="stepReportRowRender" [selected]="selected() === id" [attr.data-id]="id">
        @if (row.ready()) {
          <button>Details {{ id }}</button>
        } @else {
          <span>Loading {{ id }}</span>
        }
      </div>
    }
  `,
})
class ReportRowsTestComponent {
  readonly ids = input([0, 1, 2, 3]);
  readonly selected = input<number>();
}

@Component({
  imports: [ReportRowsTestComponent],
  template: `<section style="overflow-y: hidden">
    <div style="overflow-y: auto"><step-report-rows-test /></div>
  </section>`,
})
class ClippedReportTestComponent {}

describe('Report row details', () => {
  let intersect: (target: HTMLElement, isIntersecting: boolean) => void;
  beforeEach(() => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => window.setTimeout(() => callback(performance.now()), 16));
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((handle) => window.clearTimeout(handle));
    jest.spyOn(window, 'IntersectionObserver').mockImplementation((callback) => {
      const observed = new Set<Element>();
      const observer: IntersectionObserver = {
        root: null,
        rootMargin: '0px',
        thresholds: [0],
        observe: (target) => observed.add(target),
        unobserve: (target) => observed.delete(target),
        disconnect: () => observed.clear(),
        takeRecords: () => [],
      };
      intersect = (target, isIntersecting) => {
        if (!observed.has(target)) return;
        const bounds = target.getBoundingClientRect();
        callback(
          [
            {
              target,
              isIntersecting,
              time: performance.now(),
              rootBounds: null,
              boundingClientRect: bounds,
              intersectionRect: bounds,
              intersectionRatio: isIntersecting ? 1 : 0,
            },
          ],
          observer,
        );
      };
      return observer;
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it('holds the original row and its neighbors under a press until release and leaves loaded controls alone', fakeAsync(() => {
    const fixture = TestBed.createComponent(ReportRowsTestComponent);
    fixture.detectChanges();
    resizeObserverMock.resize(fixture.nativeElement, { width: 800, height: 3200 });
    const row: HTMLElement = fixture.nativeElement.querySelector('[data-id="0"]');
    const neighbor: HTMLElement = fixture.nativeElement.querySelector('[data-id="1"]');
    // The browser uses pointer capture to deliver release and click even when the hit target moves.
    row.setPointerCapture = jest.fn();
    const press = (element: HTMLElement, button = 0): void => {
      element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, isPrimary: true, button }));
    };
    press(row.querySelector('span')!, 2);
    expect(row.setPointerCapture).not.toHaveBeenCalled();
    intersect(neighbor, true);
    press(row.querySelector('span')!);
    expect(row.setPointerCapture).toHaveBeenCalledWith(7);
    intersect(row, true);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 8 }));
    tick(64);
    fixture.detectChanges();
    expect([row.textContent, neighbor.textContent]).toEqual(['Loading 0', 'Loading 1']);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7 }));
    tick(64);
    fixture.detectChanges();
    expect([row.textContent, neighbor.textContent]).toEqual(['Details 0', 'Details 1']);
    press(row.querySelector('button')!);
    expect(row.setPointerCapture).toHaveBeenCalledTimes(1);
    fixture.destroy();
  }));

  it('keeps the first visible row in place when rows expand above the dashboard clip', fakeAsync(() => {
    const fixture = TestBed.createComponent(ClippedReportTestComponent);
    fixture.detectChanges();
    const dashboard: HTMLElement = fixture.nativeElement.querySelector('section');
    const panel = dashboard.firstElementChild as HTMLElement;
    const report = panel.firstElementChild as HTMLElement;
    resizeObserverMock.resize(report, { width: 800, height: 400 });
    resizeObserverMock.resize(panel, { width: 800, height: 160 });
    Object.defineProperty(panel, 'scrollHeight', { configurable: true, value: 400 });
    resizeObserverMock.resize(dashboard, { width: 800, height: 60 });
    Object.defineProperty(dashboard, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, 100, 800, 60),
    });
    const [hidden, visible] = Array.from(report.querySelectorAll<HTMLElement>('[data-id]'));
    jest.spyOn(hidden, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 20 - panel.scrollTop, 800, 70));
    jest.spyOn(visible, 'getBoundingClientRect').mockImplementation(() => {
      const heightAddedAbove = hidden.querySelector('button') ? 44 : 0;
      return new DOMRect(0, 100 + heightAddedAbove - panel.scrollTop, 800, 70);
    });

    const before = visible.getBoundingClientRect().top;
    intersect(hidden, true);
    intersect(visible, true);
    tick(17);
    fixture.detectChanges();
    expect(hidden.querySelector('button')).toBeTruthy();
    tick(32);
    expect(visible.getBoundingClientRect().top).toBe(before);
    fixture.destroy();
  }));

  it('loads details as rows approach, retains visited rows and honors a new selection while idle', fakeAsync(() => {
    const fixture = TestBed.createComponent(ReportRowsTestComponent);
    const host: HTMLElement = fixture.nativeElement;
    resizeObserverMock.resize(host, { width: 800, height: 3200 });
    fixture.detectChanges();
    const rows = Array.from(host.querySelectorAll<HTMLElement>('[data-id]'));
    let scrollOffset = 0;
    rows.forEach((row, index) =>
      jest
        .spyOn(row, 'getBoundingClientRect')
        .mockImplementation(() => new DOMRect(0, 50 + index * 1600 - scrollOffset, 800, 70)),
    );
    const details = (): string[] =>
      Array.from(host.querySelectorAll('[data-id] button'), (button) => button.textContent!.trim());

    intersect(rows[0], true);
    tick(180);
    fixture.detectChanges();
    expect(details()).toEqual(['Details 0']);
    const firstButton = rows[0].querySelector('button');

    scrollOffset = 1600;
    intersect(rows[0], false);
    intersect(rows[1], true);
    tick(180);
    fixture.detectChanges();
    expect(details()).toEqual(['Details 0', 'Details 1']);
    expect(rows[0].querySelector('button')).toBe(firstButton);

    fixture.componentRef.setInput('selected', 3);
    fixture.detectChanges();
    tick(180);
    fixture.detectChanges();
    expect(details()).toEqual(['Details 0', 'Details 1', 'Details 3']);

    // A refresh replaces a row after it enters the viewport but before its batch runs.
    scrollOffset = 3200;
    intersect(rows[2], true);
    fixture.componentRef.setInput('ids', [4, 5]);
    fixture.detectChanges();
    const replacement = host.querySelector<HTMLElement>('[data-id="4"]')!;
    tick(180);
    fixture.detectChanges();
    expect(details()).toEqual([]);
    intersect(replacement, true);
    tick(180);
    fixture.detectChanges();
    expect(details()).toEqual(['Details 4']);
    const openButton = host.querySelector<HTMLButtonElement>('[data-open-row="5"]')!;
    openButton.focus();
    fixture.detectChanges();
    expect(document.activeElement).toBe(openButton);
    expect(details()).toEqual(['Details 4', 'Details 5']);
    fixture.destroy();
  }));

  it('renders pending details synchronously when printing the interactive page', () => {
    const fixture = TestBed.createComponent(ReportRowsTestComponent);
    resizeObserverMock.resize(fixture.nativeElement, { width: 800, height: 3200 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-id] button')).toHaveLength(0);
    window.dispatchEvent(new Event('beforeprint'));
    expect(fixture.nativeElement.querySelectorAll('[data-id] button')).toHaveLength(4);
    fixture.destroy();
  });

  it('includes every row in a print report before any viewport or frame notifications', () => {
    TestBed.configureTestingModule({ providers: [{ provide: VIEW_MODE, useValue: ViewMode.PRINT }] });
    const fixture = TestBed.createComponent(ReportRowsTestComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-id] button')).toHaveLength(4);
    fixture.destroy();
  });
});
