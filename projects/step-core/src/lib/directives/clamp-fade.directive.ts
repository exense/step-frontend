import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  input,
  effect,
  inject,
  Renderer2,
} from '@angular/core';

const FADE_HEIGHT_PX = 24;

@Directive({
  selector: '[stepClampFade]',
  host: {
    '[attr.data-step-clamp-fade]': '""',
  },
})
export class ClampFadeDirective implements AfterViewInit, OnDestroy {
  private _elementReference = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _zone = inject(NgZone);

  readonly lines = input(5);
  readonly fadeBackground = input<string | undefined>();

  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private overlayElement: HTMLElement | null = null;
  private supportsMaskImage =
    typeof CSS !== 'undefined' &&
    (CSS.supports?.('mask-image', 'linear-gradient(black, transparent)') ||
      CSS.supports?.('-webkit-mask-image', 'linear-gradient(black, transparent)'));

  private isClamped = false;

  constructor() {
    effect(() => {
      this._renderer.setStyle(this._elementReference.nativeElement, '-webkit-line-clamp', this.lines());
      queueMicrotask(() => this.updateClampedState());
    });
  }

  ngAfterViewInit(): void {
    const element = this._elementReference.nativeElement;

    this._renderer.setStyle(element, 'display', '-webkit-box');
    this._renderer.setStyle(element, '-webkit-box-orient', 'vertical');
    this._renderer.setStyle(element, 'overflow', 'hidden');
    this._renderer.setStyle(element, 'position', 'relative');
    this._renderer.setStyle(element, '-webkit-line-clamp', String(this.lines()));

    this._renderer.setStyle(element, 'white-space', 'break-spaces');
    this._renderer.setStyle(element, 'word-break', 'break-word');
    this._renderer.setStyle(element, 'overflow-wrap', 'anywhere');
    this._renderer.setStyle(element, 'min-width', '0');

    this._zone.runOutsideAngular(() => {
      setTimeout(() => this.updateClampedState(), 0);

      this.resizeObserver = new ResizeObserver(() => this.updateClampedState());
      this.resizeObserver.observe(element);

      this.mutationObserver = new MutationObserver(() => this.updateClampedState());
      this.mutationObserver.observe(element, { childList: true, characterData: true, subtree: true });
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect?.();
    this.mutationObserver?.disconnect?.();
    this.removeOverlay();
  }

  private updateClampedState(): void {
    const element = this._elementReference.nativeElement;
    const didOverflow = element.scrollHeight - 1 > element.clientHeight;

    if (didOverflow === this.isClamped) return;
    this.isClamped = didOverflow;

    if (this.isClamped) {
      this.applyFade();
    } else {
      this.removeFade();
    }
  }

  private applyFade(): void {
    const element = this._elementReference.nativeElement;
    const fadeHeight = `${FADE_HEIGHT_PX}px`;

    if (this.supportsMaskImage) {
      const maskValue = `linear-gradient(to bottom, black calc(100% - ${fadeHeight}), transparent 100%)`;
      this._renderer.setStyle(element, '-webkit-mask-image', maskValue);
      this._renderer.setStyle(element, 'mask-image', maskValue);
      this.removeOverlay();
    } else {
      this.removeMask();
      this.ensureOverlay();
    }
  }

  private removeFade(): void {
    this.removeMask();
    this.removeOverlay();
  }

  private removeMask(): void {
    const element = this._elementReference.nativeElement;
    this._renderer.removeStyle(element, '-webkit-mask-image');
    this._renderer.removeStyle(element, 'mask-image');
  }

  private ensureOverlay(): void {
    if (this.overlayElement) {
      this.styleOverlay(this.overlayElement);
      return;
    }
    const overlay = this._renderer.createElement('div');
    this.overlayElement = overlay;
    this.styleOverlay(overlay);
    this._renderer.appendChild(this._elementReference.nativeElement, overlay);
  }

  private styleOverlay(overlay: HTMLElement): void {
    const background = this.fadeBackground() ?? '#fff';
    const height = `${FADE_HEIGHT_PX}px`;

    this._renderer.setStyle(overlay, 'position', 'absolute');
    this._renderer.setStyle(overlay, 'left', '0');
    this._renderer.setStyle(overlay, 'right', '0');
    this._renderer.setStyle(overlay, 'bottom', '0');
    this._renderer.setStyle(overlay, 'height', height);
    this._renderer.setStyle(overlay, 'pointerEvents', 'none');
    this._renderer.setStyle(overlay, 'background', `linear-gradient(to bottom, ${background}00, ${background} 90%)`);
  }

  private removeOverlay(): void {
    if (!this.overlayElement) return;
    this._renderer.removeChild(this._elementReference.nativeElement, this.overlayElement);
    this.overlayElement = null;
  }
}
