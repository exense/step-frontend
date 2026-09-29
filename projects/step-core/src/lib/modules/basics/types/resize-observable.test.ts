import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { resizeObserverMock } from '@exense/step-core/testing';
import { ElementSizeDirective } from '../directives/element-size.directive';
import { resizeObservable } from './resize-observable';

@Component({
  selector: 'step-resize-test',
  imports: [ElementSizeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div stepElementSize #size="ElementSize">{{ size.width() }} × {{ size.height() }}</div>`,
})
class ResizeTestComponent {}

describe('Resize-driven UI', () => {
  it('updates debounced dimensions and stops observable notifications after unsubscribe', fakeAsync(() => {
    const fixture = TestBed.createComponent(ResizeTestComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement.querySelector('div');
    const resized = jest.fn();
    const subscription = resizeObservable(element).subscribe(resized);
    resizeObserverMock.resize(element, { width: 320, height: 100 });
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    expect(element.textContent).toBe('320 × 100');
    expect(resized).toHaveBeenLastCalledWith([
      expect.objectContaining({ target: element, contentRect: expect.objectContaining({ width: 320 }) }),
    ]);

    subscription.unsubscribe();
    resizeObserverMock.resize(element, { width: 640, height: 200 });
    fixture.detectChanges();
    tick(300);
    fixture.detectChanges();
    expect(element.textContent).toBe('640 × 200');
    expect(resized).toHaveBeenCalledTimes(1);
    fixture.destroy();
    resizeObserverMock.resize(element, { width: 800, height: 300 });
    tick(300);
    expect(resized).toHaveBeenCalledTimes(1);
  }));
});
