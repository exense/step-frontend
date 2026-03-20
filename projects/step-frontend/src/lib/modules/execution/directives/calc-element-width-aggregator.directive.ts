import {
  afterNextRender,
  AfterViewInit,
  contentChildren,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
} from '@angular/core';
import { CalcElementWidthDirective } from './calc-element-width.directive';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[stepCalcElementWidthAggregator]',
})
export class CalcElementWidthAggregatorDirective implements AfterViewInit {
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _ngZone = inject(NgZone);
  private _doc = inject(DOCUMENT);

  private previouslySetItems: string[] = [];

  readonly recalcTrigger = input<unknown>(undefined);
  private readonly renderComplete = signal(false);
  private readonly items = contentChildren(CalcElementWidthDirective);

  private effectSetStyles = effect(() => {
    const renderComplete = this.renderComplete();
    const recalcTrigger = this.recalcTrigger();
    const items = this.items();
    if (!renderComplete) {
      return;
    }
    this.setWidthsVariables(items);
  });

  ngAfterViewInit(): void {
    this.renderComplete.set(true);
  }

  private setWidthsVariables(items: readonly CalcElementWidthDirective[]): void {
    this._ngZone.runOutsideAngular(() => {
      this.previouslySetItems.forEach((item) => {
        this._elementRef.nativeElement.style.removeProperty(item);
      });
      this.previouslySetItems = [];
      this._doc.defaultView?.setTimeout?.(() => {
        items.forEach((item) => {
          const { key, value } = item.widthInfo;
          if (!!value) {
            this._elementRef.nativeElement.style.setProperty(key, value);
            this.previouslySetItems.push(key);
          }
        });
      }, 100);
    });
  }
}
