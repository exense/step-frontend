import { Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';
import { AppModeService } from '../modules/basics/injectables/app-mode.service';

@Directive({
  selector: '[stepShowForCliMode]',
  standalone: false,
})
export class ShowForCliModeDirective {
  readonly stepShowForCliMode = input<boolean>(true);

  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _renderer = inject(Renderer2);
  private readonly _appModeService = inject(AppModeService);

  constructor() {
    effect(() => {
      const isCliMode = this._appModeService.isCliMode();
      const shouldShow = this.stepShowForCliMode() === isCliMode;

      this._renderer.setProperty(this._elementRef.nativeElement, 'hidden', !shouldShow);
    });
  }
}
