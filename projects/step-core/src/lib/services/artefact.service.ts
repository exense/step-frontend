import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { PlansService } from '../client/step-client-module';
import { AJS_MODULE } from '../shared';
import {
  CustomRegistryType,
  CustomRegistryService,
  CustomRegistryItem,
} from '../modules/custom-registeries/custom-registries.module';

export interface ArtefactType extends CustomRegistryItem {
  icon: string;
  iconNg2: string;
  form?: string;
  description: string;
  isSelectable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ArtefactService {
  protected _customRegistry = inject(CustomRegistryService);
  protected _planApiService = inject(PlansService);
  protected readonly registryType = CustomRegistryType.artefact;

  readonly availableArtefacts$ = this._planApiService.getArtefactTypes().pipe(
    map((artefactNames) => {
      return artefactNames
        .map((artefactName) => this.getArtefactType(artefactName))
        .filter((artefact) => !!artefact?.isSelectable);
    })
  );

  register(typeName: string, artefactType: Partial<ArtefactType>): void {
    if (!artefactType.type) {
      artefactType.type = typeName;
    }
    if (!artefactType.label) {
      artefactType.label = typeName;
    }
    if (!('isSelectable' in artefactType)) {
      artefactType.isSelectable = true;
    }
    this._customRegistry.register(this.registryType, typeName, artefactType as ArtefactType);
  }

  getArtefactType(typeName: string): ArtefactType | undefined {
    const item = this._customRegistry.getRegisteredItem(this.registryType, typeName);
    return item as ArtefactType;
  }

  getArtefactTypes(): ReadonlyArray<ArtefactType> {
    return this._customRegistry.getRegisteredItems(this.registryType) as ReadonlyArray<ArtefactType>;
  }

  /**
   * @deprecated legacy
   */
  getEditor(typeName: string) {
    return this.getArtefactType(typeName)?.form;
  }
  /**
   * @deprecated legacy
   */
  getDefaultIcon(): string {
    return 'glyphicon-unchecked';
  }
  /**
   * @deprecated legacy
   */
  getIcon(typeName: string) {
    return this.getArtefactType(typeName)?.icon;
  }
  /**
   * @deprecated legacy
   */
  getIconNg2(typeName: string) {
    return this.getArtefactType(typeName)?.iconNg2;
  }
  /**
   * @deprecated legacy
   */
  getDescription(typeName: string) {
    return this.getArtefactType(typeName)?.description;
  }
  /**
   * @deprecated legacy
   */
  getLabel(typeName: string): string {
    return this.getArtefactType(typeName)?.label ?? '';
  }
  /**
   * @deprecated legacy
   */
  getTypes(): ReadonlyArray<string> {
    return this.getArtefactTypes().map((item) => item.type);
  }

  isSelectable(typeName: string): boolean {
    return !!this.getArtefactType(typeName)?.isSelectable;
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('artefactTypes', downgradeInjectable(ArtefactService));
