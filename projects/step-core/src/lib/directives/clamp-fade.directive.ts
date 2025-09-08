import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  NgZone,
  OnDestroy,
  Renderer2,
  input,
  effect,
} from '@angular/core';

const FADE_HEIGHT_PX = 24;

@Directive({
  selector: '[stepClampFade]',
  standalone: true,
})
export class ClampFadeDirective implements AfterViewInit, OnDestroy {
  readonly lines = input(5);
  readonly fadeBackground = input<string | undefined>();

  @HostBinding('attr.data-step-clamp-fade') private attribute = '';

  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;
  private overlayElement: HTMLElement | null = null;
  private supportsMaskImage =
    typeof CSS !== 'undefined' &&
    (CSS.supports?.('mask-image', 'linear-gradient(black, transparent)') ||
      CSS.supports?.('-webkit-mask-image', 'linear-gradient(black, transparent)'));

  private isClamped = false;

  constructor(
    private elementReference: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private zone: NgZone,
  ) {
    effect(() => {
      const value = String(this.lines());
      this.renderer.setStyle(this.elementReference.nativeElement, '-webkit-line-clamp', value);
      queueMicrotask(() => this.updateClampedState());
    });
  }

  ngAfterViewInit(): void {
    const element = this.elementReference.nativeElement;

    this.renderer.setStyle(element, 'display', '-webkit-box');
    this.renderer.setStyle(element, '-webkit-box-orient', 'vertical');
    this.renderer.setStyle(element, 'overflow', 'hidden');
    this.renderer.setStyle(element, 'position', 'relative');
    this.renderer.setStyle(element, '-webkit-line-clamp', String(this.lines()));

    this.renderer.setStyle(element, 'white-space', 'break-spaces');
    this.renderer.setStyle(element, 'word-break', 'break-word');
    this.renderer.setStyle(element, 'overflow-wrap', 'anywhere');
    this.renderer.setStyle(element, 'min-width', '0');

    this.zone.runOutsideAngular(() => {
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
    const element = this.elementReference.nativeElement;
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
    const element = this.elementReference.nativeElement;
    const fadeHeight = `${FADE_HEIGHT_PX}px`;

    if (this.supportsMaskImage) {
      const maskValue = `linear-gradient(to bottom, black calc(100% - ${fadeHeight}), transparent 100%)`;
      this.renderer.setStyle(element, '-webkit-mask-image', maskValue);
      this.renderer.setStyle(element, 'mask-image', maskValue);
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
    const element = this.elementReference.nativeElement;
    this.renderer.removeStyle(element, '-webkit-mask-image');
    this.renderer.removeStyle(element, 'mask-image');
  }

  private ensureOverlay(): void {
    if (this.overlayElement) {
      this.styleOverlay(this.overlayElement);
      return;
    }
    const overlay = this.renderer.createElement('div');
    this.overlayElement = overlay;
    this.styleOverlay(overlay);
    this.renderer.appendChild(this.elementReference.nativeElement, overlay);
  }

  private styleOverlay(overlay: HTMLElement): void {
    const background = this.fadeBackground() ?? '#fff';
    const height = `${FADE_HEIGHT_PX}px`;

    this.renderer.setStyle(overlay, 'position', 'absolute');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'right', '0');
    this.renderer.setStyle(overlay, 'bottom', '0');
    this.renderer.setStyle(overlay, 'height', height);
    this.renderer.setStyle(overlay, 'pointerEvents', 'none');
    this.renderer.setStyle(overlay, 'background', `linear-gradient(to bottom, ${background}00, ${background} 90%)`);
  }

  private removeOverlay(): void {
    if (!this.overlayElement) return;
    this.renderer.removeChild(this.elementReference.nativeElement, this.overlayElement);
    this.overlayElement = null;
  }
}
