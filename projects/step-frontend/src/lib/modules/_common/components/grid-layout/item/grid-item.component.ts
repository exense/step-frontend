import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  AfterViewInit,
  HostListener,
  OnChanges,
  SimpleChanges,
  input,
} from '@angular/core';
import { GridsterComponent } from 'angular-gridster2';

interface GridsterItemConfig {
  cols?: number;
  rows?: number;
  x?: number;
  y?: number;
}

@Directive({
  standalone: true,
  selector: '[itemS], [itemM], [itemL]',
  providers: [GridsterComponent],
})
export class GridsterItemResponsiveDirective implements AfterViewInit, OnChanges {
  itemS = input<GridsterItemConfig | undefined>(); // Small
  itemM = input<GridsterItemConfig | undefined>(); // Medium
  itemL = input<GridsterItemConfig | undefined>(); // Large

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit() {
    this.applyCorrectConfig();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['itemS'] || changes['itemM'] || changes['itemL']) {
      this.applyCorrectConfig();
    }
  }

  private applyCorrectConfig() {
    const selectedItem = this.itemM();

    if (selectedItem) {
      // this.renderer.setAttribute(this.el.nativeElement, 'item', JSON.stringify(selectedItem));
    }
  }
}
