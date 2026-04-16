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
import { SplitAreaComponent } from '../split-area/split-area.component';
import { SplitGutterComponent } from '../split-gutter/split-gutter.component';
import { SplitComponent } from '../split/split.component';
import { StackViewItemComponent } from '../stack-view-item/stack-view-item.component';
import { StackViewBreadcrumbsComponent } from '../stack-view-breadcrumbs/stack-view-breadcrumbs.component';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-stack-view',
  imports: [
    SplitComponent,
    SplitAreaComponent,
    SplitGutterComponent,
    IsSplitViewGroupPipe,
    ViewGroupComponent,
    ViewItemComponent,
    StackViewBreadcrumbsComponent,
    StepBasicsModule,
  ],
  templateUrl: './stack-view.component.html',
  styleUrl: './stack-view.component.scss',
})
export class StackViewComponent {
  protected readonly GROUP_WIDTH = 100;

  readonly removeItem = output<string>();
  readonly closeAll = output<void>();

  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.isRendered.set(true));
  }

  private readonly isMaximizedInternal = signal(false);
  private readonly isRendered = signal(false);
  private readonly splitAreas = viewChildren(SplitAreaComponent);
  private readonly items = contentChildren(StackViewItemComponent);

  protected readonly isMaximized = this.isMaximizedInternal.asReadonly();
  protected readonly views = signal<StackViewInfo[]>([]);

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
    const isMaximized = this.isMaximizedInternal();

    if (isMaximized && views.length > 1) {
      const group = views.slice(0, views.length - 1);
      return [
        {
          id: 'group',
          title: 'Group',
          content: '',
          children: group,
        } as StackViewInfo,
        views[views.length - 1],
      ];
    }

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
    const isMaximized = this.isMaximizedInternal();
    if (!splitAreas?.length) {
      return;
    }
    const parentWidth = this._elRef.nativeElement.getBoundingClientRect().width;
    const mainView = parentWidth / 2;
    let subWidth = (parentWidth - mainView) / (splitAreas.length - 1);

    if (splitAreas.length <= 3) {
      for (let i = 0; i < splitAreas.length; i++) {
        let size = i === splitAreas.length - 1 ? mainView : subWidth;
        if (isMaximized && i === 0) {
          size = this.GROUP_WIDTH;
        }
        splitAreas[i].setSize(size);
      }
      return;
    }

    subWidth = (parentWidth - mainView - this.GROUP_WIDTH) / 2;
    splitAreas[0].setSize(subWidth);
    splitAreas[1].setSize(this.GROUP_WIDTH);
    splitAreas[2].setSize(subWidth);
    splitAreas[3].setSize(mainView);
  });

  protected removeView(id: string): void {
    this.removeItem.emit(id);
  }

  protected openView(id: string): void {
    const views = untracked(() => this.views());
    const viewIndex = views.findIndex((item) => item.id === id);
    const sibling = views[viewIndex + 1];
    if (!sibling) {
      return;
    }
    this.minimize();
    this.removeItem.emit(sibling.id);
  }

  protected maximize(): void {
    this.isMaximizedInternal.set(true);
  }

  protected minimize(): void {
    this.isMaximizedInternal.set(false);
  }
}
