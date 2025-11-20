import { Component, contentChildren, input, viewChildren } from '@angular/core';
import { SplitResizableAreaComponent } from '../split-resizable-area/split-resizable-area.component';
import { SplitGutterComponent } from '../split-gutter/split-gutter.component';
import { v4 } from 'uuid';
import { SplitSectionDirective } from '../../directives/split-section.directive';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'step-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss'],
  imports: [SplitResizableAreaComponent, NgTemplateOutlet, SplitGutterComponent],
})
export class SplitComponent {
  readonly sections = contentChildren(SplitSectionDirective);
  readonly areas = viewChildren(SplitResizableAreaComponent);
  readonly gutters = viewChildren(SplitGutterComponent);

  readonly sizePrefix = input<string>(`SPLIT_${v4()}`);
}
