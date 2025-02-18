import { Component, ContentChildren, QueryList } from '@angular/core';
import { SplitAreaComponent } from '../split-area/split-area.component';
import { SplitGutterComponent } from '../split-gutter/split-gutter.component';

@Component({
  selector: 'step-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss'],
  standalone: true,
})
export class SplitComponent {
  @ContentChildren(SplitAreaComponent) areas?: QueryList<SplitAreaComponent>;
  @ContentChildren(SplitGutterComponent) gutters?: QueryList<SplitGutterComponent>;
}
