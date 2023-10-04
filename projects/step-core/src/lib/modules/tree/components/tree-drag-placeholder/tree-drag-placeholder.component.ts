import { Component, HostBinding, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { DropInfo } from '../../shared/drop-info';
import { DropType } from '../../shared/drop-type.enum';

@Component({
  selector: 'step-tree-drag-placeholder',
  templateUrl: './tree-drag-placeholder.component.html',
  styleUrls: ['./tree-drag-placeholder.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TreeDragPlaceholderComponent implements OnChanges {
  @Input() dropInfo?: DropInfo | null;

  @HostBinding('class.drop-before')
  isDropBefore: boolean = false;

  @HostBinding('class.drop-after')
  isDropAfter: boolean = false;

  @HostBinding('class.no-insert')
  noInsert: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    const cDropInfo = changes['dropInfo'];
    if (cDropInfo?.currentValue !== cDropInfo?.previousValue || cDropInfo?.firstChange) {
      this.dropInfoChanged(cDropInfo?.currentValue);
    }
  }

  private dropInfoChanged(dropInfo?: DropInfo): void {
    this.noInsert = dropInfo ? !dropInfo.canInsert : false;
    this.isDropBefore = dropInfo?.dropType === DropType.BEFORE;
    this.isDropAfter = dropInfo?.dropType === DropType.AFTER;
  }
}
