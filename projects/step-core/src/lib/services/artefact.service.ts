import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { PlansService } from '../client/step-client-module';
import {
  CustomRegistryType,
  CustomRegistryService,
  CustomRegistryItem,
} from '../modules/custom-registeries/custom-registries.module';

export interface ArtefactType extends CustomRegistryItem {
  icon: string;
  description?: string;
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

  readonly defaultIcon = 'check_box_outline_blank';

  register(typeName: string, artefactType: Partial<ArtefactType>): void {
    if (!artefactType.type) {
      artefactType.type = typeName;
    }
    if (!artefactType.label) {
      artefactType.label = typeName;
    }
    if (!artefactType.description) {
      artefactType.description = '';
    }
    if (!('isSelectable' in artefactType)) {
      artefactType.isSelectable = true;
    }
    this._customRegistry.register(this.registryType, typeName, artefactType as ArtefactType);
  }

  getArtefactType(typeName?: string): ArtefactType | undefined {
    if (!typeName) {
      return undefined;
    }
    const item = this._customRegistry.getRegisteredItem(this.registryType, typeName);
    return item as ArtefactType;
  }
}
