import { Component } from '@angular/core';
import { CustomComponent } from '../../modules/custom-registeries/shared/custom-component';

@Component({
  selector: 'step-html-description-cell',
  template: `<div [innerHTML]="context?.attributes?.['description'] | safeHtml"></div>`,
  styleUrls: [],
  standalone: false,
})
export class HtmlDescriptionCellComponent implements CustomComponent {
  context?: {
    attributes?: Record<string, string>;
  };
}
