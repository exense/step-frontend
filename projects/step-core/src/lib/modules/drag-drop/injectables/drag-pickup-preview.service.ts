import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy, Renderer2, RendererFactory2, RendererStyleFlags2 } from '@angular/core';

interface PickupPreview {
  source: HTMLElement;
  template: HTMLElement;
  overlay: HTMLElement;
  card: HTMLElement;
  content: HTMLElement;
  nativeImage: HTMLCanvasElement;
  view: Window;
  origin: DOMRect;
  contentInset: number;
  point: { x: number; y: number };
  width: number;
  onCancel: () => void;
  lastDropTargetEvent?: DragEvent;
  frame?: number;
  animation?: Animation;
  listeners: (() => void)[];
}

@Injectable({ providedIn: 'root' })
export class DragPickupPreviewService implements OnDestroy {
  private readonly _document = inject(DOCUMENT);
  private readonly _renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
  private preview?: PickupPreview;

  prepare(options: {
    source: HTMLElement;
    template: HTMLElement;
    origin?: HTMLElement;
    onCancel: () => void;
  }): HTMLElement {
    this.clear();
    const { source, template, origin = source, onCancel } = options;
    const view = this._document.defaultView;
    if (!view) {
      return template;
    }

    const bounds = origin.getBoundingClientRect();
    const sourceBounds = source.getBoundingClientRect();
    const overlay = this._renderer.createElement('div') as HTMLElement;
    const card = this._renderer.createElement('div') as HTMLElement;
    const content = this._renderer.createElement('div') as HTMLElement;
    this._renderer.addClass(overlay, 'step-drag-pickup-preview');
    this._renderer.addClass(card, 'step-drag-pickup-card');
    this._renderer.addClass(content, 'step-drag-pickup-content');
    this._renderer.setAttribute(overlay, 'aria-hidden', 'true');
    this._renderer.setStyle(overlay, 'font', view.getComputedStyle(source).font);
    this._renderer.appendChild(card, content);
    this._renderer.appendChild(overlay, card);
    this._renderer.appendChild(this._document.body, overlay);

    const nativeImage = this._renderer.createElement('canvas') as HTMLCanvasElement;
    nativeImage.width = 1;
    nativeImage.height = 1;
    const context = nativeImage.getContext('2d');
    if (context) {
      context.fillStyle = 'rgba(0, 0, 0, 0.01)';
      context.fillRect(0, 0, 1, 1);
    }
    this._renderer.addClass(nativeImage, 'step-drag-pickup-native-image');
    this._renderer.setAttribute(nativeImage, 'aria-hidden', 'true');
    this._renderer.appendChild(this._document.body, nativeImage);

    const preview: PickupPreview = {
      source,
      template,
      overlay,
      card,
      content,
      nativeImage,
      view,
      origin: bounds,
      contentInset: Math.max(12, sourceBounds.left - bounds.left),
      point: { x: 0, y: 0 },
      width: 0,
      onCancel,
      listeners: [],
    };
    this.preview = preview;
    preview.listeners.push(
      this._renderer.listen(this._document, 'mouseup', () => this.releaseFor(source), { capture: true }),
      this._renderer.listen(this._document, 'pointerup', () => this.releaseFor(source), { capture: true }),
    );

    return nativeImage;
  }

  start(source: HTMLElement, event: DragEvent): void {
    const preview = this.preview;
    if (!preview || preview.source !== source) {
      return;
    }
    preview.point = { x: event.clientX, y: event.clientY };
    this._renderer.addClass(source, 'step-drag-pickup-source');

    let hasPressedDrag = false;
    const updatePointer = (dragEvent: DragEvent): void => {
      if (dragEvent.type === 'dragover' || dragEvent.type === 'dragenter') {
        preview.lastDropTargetEvent = dragEvent;
      }
      if (dragEvent.type === 'drag') {
        if (dragEvent.buttons) {
          hasPressedDrag = true;
        } else if (hasPressedDrag) {
          this.releaseFor(source);
          return;
        }
      }
      if (!dragEvent.clientX && !dragEvent.clientY) {
        return;
      }
      preview.point = { x: dragEvent.clientX, y: dragEvent.clientY };
      this.position(preview);
    };
    preview.listeners.push(
      this._renderer.listen(this._document, 'dragenter', updatePointer, { capture: true }),
      this._renderer.listen(this._document, 'dragover', updatePointer, { capture: true }),
      this._renderer.listen(source, 'drag', updatePointer),
      this._renderer.listen(this._document, 'drop', () => this.clearFor(source), { capture: true }),
      this._renderer.listen(this._document, 'dragend', () => this.clearFor(source), { capture: true }),
      this._renderer.listen(preview.view, 'blur', () => this.clearFor(source)),
      this._renderer.listen(this._document, 'keydown', (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === 'Escape') {
          this.clearFor(source);
        }
      }),
    );
    preview.frame = preview.view.requestAnimationFrame(() => this.show(preview));
  }

  clearFor(source: HTMLElement): void {
    if (this.preview?.source === source) {
      this.clear();
    }
  }

  ngOnDestroy(): void {
    this.clear();
  }

  private releaseFor(source: HTMLElement): void {
    const preview = this.preview;
    if (!preview || preview.source !== source) {
      return;
    }
    const cancelled = !preview.lastDropTargetEvent?.defaultPrevented;
    this.clear();
    if (cancelled) {
      preview.onCancel();
    }
  }

  private show(preview: PickupPreview): void {
    if (this.preview !== preview) {
      return;
    }
    preview.frame = undefined;
    Array.from(preview.template.childNodes).forEach((child) => {
      this._renderer.appendChild(preview.content, child.cloneNode(true));
    });

    const naturalWidth = preview.content.getBoundingClientRect().width + 24;
    const width = Math.max(
      1,
      Math.min(Math.max(96, naturalWidth), 320, preview.view.innerWidth - 16, preview.origin.width),
    );
    const height = 32;
    preview.width = width;
    this._renderer.setStyle(preview.card, '--style__pickup-width', `${width}px`, RendererStyleFlags2.DashCase);
    this._renderer.setStyle(preview.card, '--style__pickup-height', `${height}px`, RendererStyleFlags2.DashCase);
    this.position(preview);
    this._renderer.setStyle(preview.overlay, 'visibility', 'visible');

    if (preview.view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const point = this.previewPosition(preview);
    this._renderer.addClass(preview.card, 'is-picking-up');
    preview.animation = preview.card.animate(
      [
        {
          transform: `translate(${preview.origin.left - point.x}px, ${preview.origin.top - point.y}px)`,
          width: `${preview.origin.width}px`,
          height: `${preview.origin.height}px`,
          paddingLeft: `${preview.contentInset}px`,
        },
        { transform: 'translate(0, 0)', width: `${width}px`, height: `${height}px`, paddingLeft: '12px' },
      ],
      { duration: 270, easing: 'cubic-bezier(0, 0, 0.2, 1)' },
    );
  }

  private position(preview: PickupPreview): void {
    const point = this.previewPosition(preview);
    this._renderer.setStyle(preview.overlay, '--style__pickup-x', `${point.x}px`, RendererStyleFlags2.DashCase);
    this._renderer.setStyle(preview.overlay, '--style__pickup-y', `${point.y}px`, RendererStyleFlags2.DashCase);
  }

  private previewPosition(preview: PickupPreview): { x: number; y: number } {
    return {
      x: Math.max(8, Math.min(preview.point.x + 8, preview.view.innerWidth - preview.width - 8)),
      y: Math.max(8, Math.min(preview.point.y + 8, preview.view.innerHeight - 40)),
    };
  }

  private clear(): void {
    const preview = this.preview;
    if (!preview) {
      return;
    }
    this.preview = undefined;
    if (preview.frame !== undefined) {
      preview.view.cancelAnimationFrame(preview.frame);
    }
    preview.animation?.cancel();
    preview.listeners.forEach((stop) => stop());
    this._renderer.removeClass(preview.source, 'step-drag-pickup-source');
    this._renderer.removeChild(this._document.body, preview.overlay);
    this._renderer.removeChild(this._document.body, preview.nativeImage);
  }
}
