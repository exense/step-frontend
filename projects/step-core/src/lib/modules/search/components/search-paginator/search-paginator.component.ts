import { ChangeDetectionStrategy, Component, computed, effect, input, model, ViewEncapsulation } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-search-paginator',
  imports: [StepBasicsModule],
  host: {
    '[class.active]': 'isActive()',
  },
  templateUrl: './search-paginator.component.html',
  styleUrl: './search-paginator.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPaginatorComponent {
  readonly searchIndex = model.required<number>();
  readonly total = input.required<number>();
  readonly isActive = model.required<boolean>();
  readonly isDisabled = input(false);
  readonly activeTooltipInput = input<string | undefined>(undefined, { alias: 'activeTooltip' });
  readonly inactiveTooltip = input<string | undefined>(undefined);

  protected readonly areButtonsActive = computed(() => {
    const isDisabled = this.isDisabled();
    const isActive = this.isActive();
    const total = this.total();
    if (isDisabled) {
      return false;
    }
    return !!isActive && total > 0;
  });

  protected readonly searchLabel = computed(() => {
    const isActive = this.isActive();
    const searchIndex = this.searchIndex();
    const total = this.total();
    if (!isActive || total <= 0) {
      return '';
    }
    return `${searchIndex + 1} / ${total}`;
  });

  protected readonly activeTooltip = computed(() => {
    const activeTooltipInput = this.activeTooltipInput();
    const searchLabel = this.searchLabel();
    if (!searchLabel) {
      return activeTooltipInput;
    }
    if (!activeTooltipInput) {
      return searchLabel;
    }
    return `${searchLabel}\n${activeTooltipInput}`;
  });

  private effectResetSearch = effect(() => {
    const active = this.isActive();
    const total = this.total();
    this.searchIndex.set(0);
  });

  protected next(): void {
    if (!this.areButtonsActive()) {
      return;
    }
    const total = this.total();
    this.searchIndex.update((current) => (current + 1) % total);
  }

  protected prev(): void {
    if (!this.areButtonsActive()) {
      return;
    }
    const total = this.total();
    this.searchIndex.update((current) => {
      const res = current - 1;
      return res < 0 ? total - 1 : res;
    });
  }

  protected activate(): void {
    this.isActive.set(true);
  }

  protected deactivate(): void {
    this.isActive.set(false);
  }
}
