import { Injectable } from '@angular/core';

export interface ClickGuardOptions {
  dragThreshold?: number;
  ignoreNonLeftClick?: boolean;
  ignoreTextSelection?: boolean;
}

export interface ClickGuard {
  pointerDown(event: MouseEvent): void;
  pointerMove(event: MouseEvent): void;
  pointerUp(): void;
  shouldHandleClick(event: MouseEvent): boolean;
  reset(): void;
}

@Injectable({
  providedIn: 'root',
})
export class ClickGuardService {
  create(options: ClickGuardOptions = {}): ClickGuard {
    return new ClickGuardTracker(options);
  }
}

class ClickGuardTracker implements ClickGuard {
  private pointerStart?: { x: number; y: number };
  private dragged = false;
  private dragThreshold: number;
  private ignoreNonLeftClick: boolean;
  private ignoreTextSelection: boolean;

  constructor(options: ClickGuardOptions) {
    this.dragThreshold = options.dragThreshold ?? 4;
    this.ignoreNonLeftClick = options.ignoreNonLeftClick ?? true;
    this.ignoreTextSelection = options.ignoreTextSelection ?? true;
  }

  pointerDown(event: MouseEvent): void {
    if (this.ignoreNonLeftClick && event.button !== 0) {
      return;
    }
    this.pointerStart = { x: event.clientX, y: event.clientY };
    this.dragged = false;
  }

  pointerMove(event: MouseEvent): void {
    if (!this.pointerStart) {
      return;
    }
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    if (Math.hypot(dx, dy) > this.dragThreshold) {
      this.dragged = true;
    }
  }

  pointerUp(): void {
    this.pointerStart = undefined;
  }

  shouldHandleClick(event: MouseEvent): boolean {
    if (this.ignoreNonLeftClick && event.button !== 0) {
      return false;
    }
    if (this.dragged) {
      return false;
    }
    return true;
  }

  reset(): void {
    this.pointerStart = undefined;
    this.dragged = false;
  }

  private hasTextSelection(): boolean {
    const selection = globalThis.getSelection?.();
    if (!selection || selection.isCollapsed) {
      return false;
    }
    return selection.toString().trim().length > 0;
  }
}
