import { Component, contentChildren, input } from '@angular/core';
import { SplitAreaComponent } from '../split-area/split-area.component';
import { SplitGutterComponent } from '../split-gutter/split-gutter.component';
import { v4 } from 'uuid';

@Component({
  selector: 'step-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss'],
})
export class SplitComponent {
  readonly areas = contentChildren(SplitAreaComponent);
  readonly gutters = contentChildren(SplitGutterComponent);

  readonly sizePrefix = input<string>(`SPLIT_${v4()}`);
}
