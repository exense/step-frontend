import {
  AfterContentInit,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  linkedSignal,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { SplitResizableAreaComponent } from '../split-resizable-area/split-resizable-area.component';
import { SplitGutterComponent } from '../split-gutter/split-gutter.component';
import { v4 } from 'uuid';
import { SplitSectionDirective } from '../../directives/split-section.directive';
import { SplitFoldableAreaPersistenceService } from '../../injectables/split-foldable-area-persistence.service';
import { SplitFoldableAreaComponent } from '../split-foldable-area/split-foldable-area.component';
import { NgTemplateOutlet } from '@angular/common';
import { SCREEN_WIDTH } from '../../../basics/types/screen-width.token';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'step-split',
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss'],
  imports: [SplitResizableAreaComponent, SplitFoldableAreaComponent, NgTemplateOutlet, SplitGutterComponent],
  encapsulation: ViewEncapsulation.None,
})
export class SplitComponent implements AfterContentInit {
  private _screenWidth = inject(SCREEN_WIDTH);
  private _splitFoldableAreaPersistenceService = inject(SplitFoldableAreaPersistenceService);

  readonly sections = contentChildren(SplitSectionDirective);
  readonly areas = viewChildren(SplitResizableAreaComponent);
  readonly gutters = viewChildren(SplitGutterComponent);

  readonly persistencePrefix = input<string>(`SPLIT_${v4()}`);
  readonly foldableViewScreenWidthThreshold = input(800);

  private screenWidth = toSignal(this._screenWidth);

  protected isFoldableView = computed(() => {
    const screenWidth = this.screenWidth();
    const threshold = this.foldableViewScreenWidthThreshold();
    if (!screenWidth) {
      return false;
    }
    return screenWidth <= threshold;
  });

  protected activeFoldableArea = linkedSignal(() => {
    const prefix = this.persistencePrefix();
    return this._splitFoldableAreaPersistenceService.getItem(prefix) ?? '';
  });

  protected activateFoldableArea(areaHeader: string) {
    this.activeFoldableArea.set(areaHeader);
    const prefix = this.persistencePrefix();
    this._splitFoldableAreaPersistenceService.setItem(prefix, areaHeader);
  }

  ngAfterContentInit(): void {
    this.initializeFirstFoldableItem();
  }

  private initializeFirstFoldableItem(): void {
    const prefix = this.persistencePrefix();
    if (!this._splitFoldableAreaPersistenceService.getItem(prefix)) {
      const firstSectionHeader = this.sections()?.[0]?.header?.();
      if (firstSectionHeader) {
        this._splitFoldableAreaPersistenceService.setItem(prefix, firstSectionHeader);
      }
    }
  }
}
