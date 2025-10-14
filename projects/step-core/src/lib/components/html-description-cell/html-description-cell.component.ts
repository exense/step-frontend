import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CustomComponent } from '../../modules/custom-registeries/shared/custom-component';

type DescriptionContext = Record<string, string> & { attributes?: Record<string, string> };

@Component({
  selector: 'step-html-description-cell',
  template: `<div [innerHTML]="description() | safeHtml"></div>`,
  styleUrls: [],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlDescriptionCellComponent implements CustomComponent {
  private contextInternal = signal<DescriptionContext | undefined>(undefined);
  readonly contextAsInput = input<DescriptionContext | undefined>(undefined, { alias: 'context' });

  protected readonly actualContext = computed(() => {
    const contextInternal = this.contextInternal();
    const contextAsInput = this.contextAsInput();
    return contextInternal ?? contextAsInput;
  });

  protected readonly description = computed(() => {
    const context = this.actualContext();
    return context?.attributes?.['description'] ?? context?.['description'];
  });

  contextChange(previousContext?: DescriptionContext, currentContext?: DescriptionContext) {
    this.contextInternal.set(currentContext);
  }
}
