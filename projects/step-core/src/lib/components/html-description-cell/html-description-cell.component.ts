import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
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
  context?: {
    attributes?: Record<string, string>;
  };

  private contextInternal = signal<DescriptionContext | undefined>(undefined);

  protected readonly description = computed(() => {
    const context = this.contextInternal();
    return context?.attributes?.['description'] ?? context?.['description'];
  });

  contextChange(previousContext?: DescriptionContext, currentContext?: DescriptionContext) {
    this.contextInternal.set(currentContext);
  }
}
