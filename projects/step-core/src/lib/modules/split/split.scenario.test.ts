import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { resizeObserverMock } from '@exense/step-core/testing';
import { SplitComponent } from './components/split/split.component';
import { SplitAreaComponent } from './components/split-area/split-area.component';
import { SplitGutterComponent } from './components/split-gutter/split-gutter.component';

@Component({
  selector: 'step-split-test',
  imports: [SplitComponent, SplitAreaComponent, SplitGutterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <step-split>
      <step-split-area [size]="200" (sizeChange)="leftSize = $event">Left</step-split-area>
      <step-split-gutter />
      <step-split-area [size]="40" [isFixedInput]="true">Fixed</step-split-area>
      <step-split-gutter />
      <step-split-area [size]="300" (sizeChange)="rightSize = $event">Right</step-split-area>
    </step-split>
  `,
})
/* eslint-disable step-lint/component-public-fields -- Test hosts expose their scenario inputs and results to assertions. */
class SplitTestComponent {
  leftSize = 0;
  rightSize = 0;
}
/* eslint-enable step-lint/component-public-fields */

describe('Split layout', () => {
  it('resizes flexible neighbours across a fixed area, clamps the drag, and stops on mouseup', fakeAsync(() => {
    const fixture = TestBed.createComponent(SplitTestComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const areas = Array.from(element.querySelectorAll<HTMLElement>('step-split-area'));
    areas.forEach((area, index) => resizeObserverMock.resize(area, { width: [200, 40, 300][index], height: 100 }));
    const gutter = element.querySelector<HTMLElement>('step-split-gutter')!;
    const move = (clientX: number): void => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX }));
      fixture.detectChanges();
    };
    tick(300);
    gutter.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, bubbles: true, cancelable: true }));
    move(250);
    expect(gutter.classList.contains('active')).toBe(true);
    expect(areas.map((area) => area.style.flexBasis)).toEqual(['250px', '40px', '250px']);
    tick(299);
    expect(fixture.componentInstance.leftSize).toBe(200);
    tick(1);
    expect([fixture.componentInstance.leftSize, fixture.componentInstance.rightSize]).toEqual([250, 250]);

    move(900);
    expect(areas.map((area) => area.style.flexBasis)).toEqual(['500px', '40px', '0px']);
    move(-900);
    expect(areas.map((area) => area.style.flexBasis)).toEqual(['0px', '40px', '500px']);
    window.dispatchEvent(new MouseEvent('mouseup'));
    move(250);
    expect(gutter.classList.contains('active')).toBe(false);
    expect(areas.map((area) => area.style.flexBasis)).toEqual(['0px', '40px', '500px']);
    tick(300);
    fixture.destroy();
  }));
});
