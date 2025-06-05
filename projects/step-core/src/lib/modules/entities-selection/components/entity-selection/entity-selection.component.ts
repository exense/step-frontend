import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { SelectionCollector } from '../../services/selection-collector/selection-collector';
import { map, Observable, of } from 'rxjs';
import { Mutable } from '../../../basics/step-basics.module';

type FieldAccessor = Mutable<Pick<EntitySelectionComponent<any, any>, 'isSelected$'>>;

@Component({
  selector: 'step-entity-selection',
  templateUrl: './entity-selection.component.html',
  styleUrls: ['./entity-selection.component.scss'],
  standalone: false,
})
export class EntitySelectionComponent<KEY, ENTITY> implements OnChanges, OnDestroy {
  @Input() selectionCollector?: SelectionCollector<KEY, ENTITY>;
  @Input() entity?: ENTITY;

  readonly isSelected$: Observable<boolean> = of(false);

  toggle(): void {
    if (!this.selectionCollector || !this.entity) {
      return;
    }
    this.selectionCollector!.toggleSelection(this.entity!);
  }

  ngOnDestroy(): void {
    if (this.entity && this.selectionCollector) {
      this.selectionCollector.unregisterPossibleSelection(this.entity);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let entity: ENTITY | undefined = undefined;
    let selectionCollector: SelectionCollector<KEY, ENTITY> | undefined = undefined;

    const cEntity = changes['entity'];
    if (cEntity?.previousValue !== cEntity?.currentValue) {
      entity = cEntity?.currentValue;
      this.onEntityChange(cEntity?.currentValue, cEntity?.previousValue);
    }

    const cSelectionCollector = changes['selectionCollector'];
    if (cSelectionCollector?.previousValue !== cSelectionCollector?.currentValue) {
      selectionCollector = cSelectionCollector?.currentValue;
      this.onSelectionCollectorChange(cSelectionCollector?.currentValue, cSelectionCollector?.previousValue);
    }

    this.setupStreams(entity, selectionCollector);
  }

  private onEntityChange(currentValue?: ENTITY, previousValue?: ENTITY): void {
    if (!this.selectionCollector) {
      return;
    }
    if (previousValue) {
      this.selectionCollector.unregisterPossibleSelection(previousValue);
    }
    if (currentValue) {
      this.selectionCollector.registerPossibleSelection(currentValue);
    }
  }

  private onSelectionCollectorChange(
    currentValue?: SelectionCollector<KEY, ENTITY>,
    previousValue?: SelectionCollector<KEY, ENTITY>,
  ): void {
    if (!this.entity) {
      return;
    }
    if (previousValue) {
      previousValue.unregisterPossibleSelection(this.entity);
    }
    if (currentValue) {
      currentValue.registerPossibleSelection(this.entity);
    }
  }

  private setupStreams(entity?: ENTITY, selectionCollector?: SelectionCollector<KEY, ENTITY>): void {
    entity = entity || this.entity;
    selectionCollector = selectionCollector || this.selectionCollector;

    if (!entity || !selectionCollector) {
      return;
    }

    (this as FieldAccessor).isSelected$ = selectionCollector!.selected$.pipe(
      map(() => selectionCollector!.isSelected(entity!)),
    );
  }
}
