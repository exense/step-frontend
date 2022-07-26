import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { map, Observable, of, tap } from 'rxjs';
import { Mutable } from '../../../../shared';

type FieldAccessor = Mutable<Pick<EntitySelectionComponent<any, any>, 'isSelected$'>>;

@Component({
  selector: 'step-entity-selection',
  templateUrl: './entity-selection.component.html',
  styleUrls: ['./entity-selection.component.scss'],
})
export class EntitySelectionComponent<KEY, ENTITY> implements OnChanges {
  @Input() selectionCollector?: SelectionCollector<KEY, ENTITY>;
  @Input() entity?: ENTITY;

  readonly isSelected$: Observable<boolean> = of(false);

  toggle(): void {
    if (!this.selectionCollector || !this.entity) {
      return;
    }
    this.selectionCollector!.toggleSelection(this.entity!);
  }

  ngOnChanges(changes: SimpleChanges): void {
    let entity: ENTITY | undefined = undefined;
    let selectionCollector: SelectionCollector<KEY, ENTITY> | undefined = undefined;

    const cEntity = changes['entity'];
    if (cEntity?.previousValue !== cEntity?.currentValue) {
      entity = cEntity?.currentValue;
    }

    const cSelectionCollector = changes['selectionCollector'];
    if (cSelectionCollector?.previousValue !== cSelectionCollector?.currentValue) {
      selectionCollector = cSelectionCollector?.currentValue;
    }

    this.setupStreams(entity, selectionCollector);
  }

  private setupStreams(entity?: ENTITY, selectionCollector?: SelectionCollector<KEY, ENTITY>): void {
    entity = entity || this.entity;
    selectionCollector = selectionCollector || this.selectionCollector;

    if (!entity || !selectionCollector) {
      return;
    }

    (this as FieldAccessor).isSelected$ = selectionCollector!.selected$.pipe(
      map(() => selectionCollector!.isSelected(entity!)),
      tap((x) => console.log('SELECTION FLAG VALUE', x, entity))
    );
  }
}
