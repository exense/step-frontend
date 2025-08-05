import {
  Directive,
  EnvironmentInjector,
  inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { map, Observable, of } from 'rxjs';
import {
  EntityMenuItemCommandInvoke,
  EntityMenuItemCommandController,
  EntityMenuItemInfo,
} from '../../custom-registeries/custom-registries.module';
import { Mutable } from '../../basics/step-basics.module';
import { OperationCompleteHandler } from '../injectables/operation-complete-handler';
import { AuthService } from '../../auth';

class SimpleController implements EntityMenuItemCommandController<unknown> {
  constructor(private _menuItemInfo: EntityMenuItemInfo) {}

  invoke(entityType: string, entityKey: string, entity: unknown): Observable<boolean> {
    return (this._menuItemInfo.operation as EntityMenuItemCommandInvoke<unknown>)(entityType, entityKey, entity);
  }
}

type FieldAccessor = Mutable<Pick<EntityMenuItemDirective, 'isVisible$' | 'isDisabled$'>>;

@Directive({
  selector: '[stepEntityMenuItem]',
  exportAs: 'EntityMenuItem',
  standalone: false,
})
export class EntityMenuItemDirective<E = unknown> implements OnChanges, OnDestroy {
  private _auth = inject(AuthService);
  private _parentInjector = inject(Injector);
  private _operationCompleteHandler = inject(OperationCompleteHandler);

  private keepInternalInjector = false;
  private internalInjector?: EnvironmentInjector;
  private operationController?: EntityMenuItemCommandController<E>;

  @Input('stepEntityMenuItem') entityMenuItem?: EntityMenuItemInfo;
  @Input() entity?: E;

  readonly isVisible$ = of(true);
  readonly isDisabled$ = of(false);

  ngOnChanges(changes: SimpleChanges): void {
    const cEntityMenuItem = changes['entityMenuItem'];
    if (cEntityMenuItem?.previousValue !== cEntityMenuItem?.currentValue || cEntityMenuItem?.firstChange) {
      this.setupMenuItem(cEntityMenuItem?.currentValue);
    }

    const cEntity = changes['entity'];
    if (cEntity?.previousValue !== cEntity?.currentValue || cEntity?.firstChange) {
      this.setupFlags(cEntity?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.destroyInternalInjector();
  }

  invoke(): void {
    if (!this.entityMenuItem || !this.operationController || !this.entity) {
      return;
    }
    this.keepInternalInjector = true;
    const entityType = this.entityMenuItem.entity;
    const entityKey = (this.entity as Record<string, unknown>)[this.entityMenuItem.entityKeyProperty] as string;

    this.operationController.invoke(entityType, entityKey, this.entity).subscribe(() => {
      this._operationCompleteHandler.handleOperationComplete();
      this.destroyInternalInjector(true);
    });
  }

  private setupMenuItem(menuItem: EntityMenuItemInfo): void {
    this.destroyInternalInjector(true);

    if (menuItem.menuItemController) {
      const menuItemController = menuItem.menuItemController;

      this.internalInjector = Injector.create({
        providers: [
          {
            provide: menuItemController,
            useClass: menuItemController,
          },
        ],
        parent: this._parentInjector,
      }) as EnvironmentInjector;

      this.operationController = this.internalInjector.get(menuItemController);
    } else {
      this.operationController = new SimpleController(menuItem);
    }

    this.setupFlags(this.entity, this.operationController);
  }

  private setupFlags(entity?: E, operationController?: EntityMenuItemCommandController<E>): void {
    entity = entity ?? this.entity;
    operationController = operationController ?? this.operationController;

    (this as FieldAccessor).isVisible$ =
      operationController?.isVisible && entity ? operationController.isVisible(entity) : of(true);

    let isDisabled$ = operationController?.isDisabled && entity ? operationController.isDisabled(entity) : undefined;

    if (!isDisabled$ && !!this.entityMenuItem?.permission) {
      isDisabled$ = this._auth.hasRight$(this.entityMenuItem.permission).pipe(map((hasRight) => !hasRight));
    }

    (this as FieldAccessor).isDisabled$ = isDisabled$ ?? of(false);
  }

  private destroyInternalInjector(force?: boolean): void {
    if (this.keepInternalInjector && !force) {
      return;
    }
    this.internalInjector?.destroy();
    this.internalInjector = undefined;
    this.keepInternalInjector = false;
  }
}
