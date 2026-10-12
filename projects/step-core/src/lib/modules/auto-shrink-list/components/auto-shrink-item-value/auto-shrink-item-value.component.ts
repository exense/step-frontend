import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeyValue, NgTemplateOutlet } from '@angular/common';
import { AutoShrinkEmptyValueTemplateDirective } from '../../directives/auto-shrink-empty-value-template.directive';
import { AceMode } from '../../../rich-editor/types/ace-mode.enum';
import { RichEditorDialogService } from '../../../rich-editor/injectables/rich-editor-dialog.service';
import { PopoverService } from '../../../basics/components/popover/popover.component';
import { UndraggedClickDirective } from '../../../basics/directives/undragged-click.directive';

@Component({
  selector: 'step-auto-shrink-item-value',
  imports: [NgTemplateOutlet, UndraggedClickDirective],
  templateUrl: './auto-shrink-item-value.component.html',
  styleUrl: './auto-shrink-item-value.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.multiline]': 'displayLines() > 1',
    '[class.openable]': 'isTruncated()',
    '[style.--style__display-lines]': 'displayLines()',
  },
})
export class AutoShrinkItemValueComponent {
  private readonly _richEditorDialog = inject(RichEditorDialogService);
  private readonly _popover = inject(PopoverService, { optional: true });
  private readonly _destroyRef = inject(DestroyRef);
  private readonly valueElement = viewChild<ElementRef<HTMLElement>>('valueElement');

  readonly item = input.required<KeyValue<string, string>>();
  readonly emptyValue = input<AutoShrinkEmptyValueTemplateDirective>();
  readonly displayLines = input(1);

  protected readonly isTruncated = signal(false);

  constructor() {
    afterRenderEffect((onCleanup) => {
      const element = this.valueElement()?.nativeElement;
      const item = this.item();
      const displayLines = this.displayLines();
      if (!element || !item.value || displayLines === 1) {
        this.isTruncated.set(false);
        return;
      }

      const updateTruncation = (): void => {
        this.isTruncated.set(
          element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1,
        );
      };
      updateTruncation();
      const observer = new ResizeObserver(updateTruncation);
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    });
  }

  protected showFullValue(event: Event): void {
    if (!this.isTruncated()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const { key, value } = this.item();
    this._popover?.freezePopover();
    this._richEditorDialog
      .editText(value, {
        title: key,
        isReadOnly: true,
        predefinedMode: AceMode.TEXT,
        wrapText: true,
        filterEmptyResult: false,
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._popover?.unfreezePopover());
  }
}
