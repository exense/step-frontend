import { Component, contentChildren } from '@angular/core';
import { SplitAreaComponent } from '../split-area/split-area.component';
import { SplitGutterComponent } from '../split-gutter/split-gutter.component';

@Component({
  selector: 'step-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss'],
})
export class SplitComponent {
  readonly areas = contentChildren(SplitAreaComponent);
  readonly gutters = contentChildren(SplitGutterComponent);
}
