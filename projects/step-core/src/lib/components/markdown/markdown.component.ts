import { marked } from 'marked';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OnChange } from '../../modules/custom-forms/components/custom-form-input/base-custom-form-input.component';

@Component({
  selector: 'step-markdown',
  templateUrl: './markdown.component.html',
})
export class MarkdownComponent implements OnChanges {
  @Input('data') data: string = '';
  convertedData: any;

  ngOnChanges(changes: SimpleChanges) {
    const data = changes['data'].currentValue;
    const md = marked.setOptions({});
    this.convertedData = md.parse(data);
  }
}
