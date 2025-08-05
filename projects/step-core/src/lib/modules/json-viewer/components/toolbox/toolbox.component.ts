import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ViewerFormat } from '../../shared/viewer-format.enum';

@Component({
  selector: 'step-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ToolboxComponent {
  readonly ViewerFormat = ViewerFormat;

  @Input() format!: ViewerFormat;
  @Output() formatChange = new EventEmitter<ViewerFormat>();
  @Output() copyClick = new EventEmitter<void>();

  changeFormat(format: ViewerFormat): void {
    this.formatChange.emit(format);
  }

  copy(): void {
    this.copyClick.emit();
  }
}
