import {
  OnChanges,
  SimpleChanges,
  AfterContentInit,
  Component,
  ContentChild,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import {
  EntityMenuItemInfo,
  EntityMenuItemsRegistryService,
} from '../../../custom-registeries/custom-registries.module';
import { EntityMenuContentDirective } from '../../directives/entity-menu-content.directive';
import { OperationCompleteHandler } from '../../injectables/operation-complete-handler';
import { Mutable, StepBasicsModule } from '../../../basics/step-basics.module';
import { EntityMenuItemDirective } from '../../directives/entity-menu-item.directive';
import { EntityRefDirective } from '../../directives/entity-ref.directive';

type FieldAccessor = Mutable<Pick<EntityMenuComponent, 'hasContent'>>;

@Component({
  selector: 'step-entity-menu',
  templateUrl: './entity-menu.component.html',
  styleUrls: ['./entity-menu.component.scss'],
  imports: [StepBasicsModule, EntityMenuItemDirective, EntityRefDirective],
  providers: [
    {
      provide: OperationCompleteHandler,
      useExisting: forwardRef(() => EntityMenuComponent),
    },
  ],
})
export class EntityMenuComponent implements OperationCompleteHandler, AfterContentInit, OnChanges {
  private _menuItemRegistry = inject(EntityMenuItemsRegistryService);

  protected menuItems: EntityMenuItemInfo[] = [];

  readonly hasContent: boolean = false;

  @Input() entity?: string;
  @Output() entityOperationSuccess = new EventEmitter<void>();

  @ViewChild('menu') readonly menu?: MatMenu;
  @ContentChild(EntityMenuContentDirective) menuContent?: EntityMenuContentDirective;

  ngAfterContentInit(): void {
    this.checkContentExistence();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cEntity = changes['entity'];
    if (cEntity?.previousValue !== cEntity?.currentValue || cEntity?.firstChange) {
      this.getEntityMenuItems(cEntity?.currentValue);
    }
  }

  handleOperationComplete(): void {
    this.entityOperationSuccess.emit();
  }

  private getEntityMenuItems(entity?: string): void {
    this.menuItems = !!entity ? this._menuItemRegistry.getEntityMenuItems(entity) : [];
    this.checkContentExistence();
  }

  private checkContentExistence(): void {
    (this as FieldAccessor).hasContent = !!this.menuContent?.templateRef || !!this.menuItems.length;
  }
}
