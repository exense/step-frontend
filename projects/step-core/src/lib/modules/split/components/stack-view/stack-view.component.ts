import {
  afterNextRender,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { StackViewInfo } from '../../types/stack-view-info';
import { IsSplitViewGroupPipe } from '../../pipes/is-split-view-group.pipe';
import { ViewGroupComponent } from '../view-group/view-group.component';
import { ViewItemComponent } from '../view-item/view-item.component';
import { StackViewItemDirective } from '../../directives/stack-view-item.directive';
import { SplitAreaComponent } from '../split-area/split-area.component';
import { SplitGutterComponent } from '../split-gutter/split-gutter.component';
import { SplitComponent } from '../split/split.component';

@Component({
  selector: 'step-stack-view',
  imports: [
    SplitComponent,
    SplitAreaComponent,
    SplitGutterComponent,
    IsSplitViewGroupPipe,
    ViewGroupComponent,
    ViewItemComponent,
  ],
  templateUrl: './stack-view.component.html',
  styleUrl: './stack-view.component.scss',
})
export class StackViewComponent {
  protected readonly GROUP_WIDTH = 160;

  readonly removeItem = output<string>();

  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.isRendered.set(true));
  }

  private readonly isRendered = signal(false);
  private readonly splitAreas = viewChildren(SplitAreaComponent);
  private readonly items = contentChildren(StackViewItemDirective);

  private readonly views = signal<StackViewInfo[]>([]);

  private effectUpdateViews = effect(() => {
    const items = this.items();
    const isRendered = this.isRendered();
    if (!isRendered) {
      return;
    }
    queueMicrotask(() => {
      const views = items.map((item) => item.stackViewInfo);
      this.views.set(views);
    });
  });

  protected readonly viewsAndGroups = computed(() => {
    const views = this.views();
    if (views.length <= 3) {
      return views;
    }
    const group = views.slice(1, views.length - 2);
    return [
      views[0],
      {
        id: 'group',
        title: 'Group',
        content: '',
        children: group,
      } as StackViewInfo,
      views[views.length - 2],
      views[views.length - 1],
    ];
  });

  private effectUpdateAreasSize = effect(() => {
    const viewsAndGroups = this.viewsAndGroups();
    const splitAreas = this.splitAreas();
    if (!splitAreas?.length) {
      return;
    }
    const parentWidth = this._elRef.nativeElement.getBoundingClientRect().width;
    const half = parentWidth / 2;
    let subWidth = half / (splitAreas.length - 1);

    if (splitAreas.length <= 3) {
      for (let i = 0; i < splitAreas.length; i++) {
        const size = i === splitAreas.length - 1 ? half : subWidth;
        splitAreas[i].setSize(size);
      }
      return;
    }

    subWidth = (half - this.GROUP_WIDTH) / 2;
    splitAreas[0].setSize(subWidth);
    splitAreas[1].setSize(this.GROUP_WIDTH);
    splitAreas[2].setSize(subWidth);
    splitAreas[3].setSize(half);
  });

  protected removeView(id: string): void {
    this.removeItem.emit(id);
  }

  protected openViewFromGroup(id: string): void {
    const views = untracked(() => this.views());
    const viewIndex = views.findIndex((item) => item.id === id);
    const sibling = views[viewIndex + 1];
    if (!sibling) {
      return;
    }
    this.removeItem.emit(sibling.id);
  }
}
