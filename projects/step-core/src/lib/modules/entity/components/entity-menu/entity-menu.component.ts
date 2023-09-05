import {
  EnvironmentInjector,
  OnChanges,
  SimpleChanges,
  TrackByFunction,
  AfterContentInit,
  Injector,
  Component,
  ContentChild,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import {
  EntityMenuItemCommandInvoker,
  EntityMenuItemInfo,
  EntityMenuItemsRegistryService,
} from '../../../custom-registeries/custom-registries.module';
import { EntityMenuContentDirective } from '../../directives/entity-menu-content.directive';
import { Mutable } from '../../../../shared';

type FieldAccessor = Mutable<Pick<EntityMenuComponent, 'hasContent'>>;

@Component({
  selector: 'step-entity-menu',
  templateUrl: './entity-menu.component.html',
  styleUrls: ['./entity-menu.component.scss'],
})
export class EntityMenuComponent implements AfterContentInit, OnChanges {
  private _injector = inject(Injector);
  private _menuItemRegistry = inject(EntityMenuItemsRegistryService);

  protected menuItems: EntityMenuItemInfo[] = [];
  protected readonly trackByMenuItem: TrackByFunction<EntityMenuItemInfo> = (index, item) => item.menuId;

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

  handleEntityOperation<T>(entity: T, menuItem: EntityMenuItemInfo): void {
    const entityType = menuItem.entity;
    const entityKey = (entity as Record<string, unknown>)[menuItem.entityKeyProperty] as string;

    const commandInvoker = menuItem.operation;
    const injector = Injector.create({
      providers: [
        {
          provide: commandInvoker,
          useClass: commandInvoker,
        },
      ],
      parent: this._injector,
    }) as EnvironmentInjector;

    const invoker = injector.get<EntityMenuItemCommandInvoker<T>>(commandInvoker);
    invoker.invoke(entityType, entityKey, entity).subscribe({
      next: () => this.entityOperationSuccess.emit(),
      complete: () => injector.destroy(),
    });
  }

  private getEntityMenuItems(entity?: string): void {
    this.menuItems = !!entity ? this._menuItemRegistry.getEntityMenuItems(entity) : [];
    this.checkContentExistence();
  }

  private checkContentExistence(): void {
    (this as FieldAccessor).hasContent = !!this.menuContent?.templateRef || !!this.menuItems.length;
  }
}
