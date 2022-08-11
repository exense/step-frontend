import { Injectable } from '@angular/core';
import { INJECTOR } from '../shared/angularjs-provider-options';

@Injectable({
  providedIn: 'root',
  useFactory: ($injector: any) => $injector.get('artefactTypes'),
  deps: [INJECTOR],
})
export abstract class ArtefactTypesService {
  abstract register(
    typeName: string,
    artefactMeta: { icon: string; iconNg2: string; form: string; description: string }
  ): void;
  abstract getEditor(typeName: string): string;
  abstract getDefaultIcon(typeName?: string): string;
  abstract getDefaultIconNg2(typeName?: string): string;
  abstract getIcon(typeName: string): string;
  abstract getIconNg2(typeName: string): string;
  abstract getDescription(typeName: string): string;
  abstract getLabel(typeName: string): string;
  abstract getTypes(typeName: string): string;
  abstract isSelectable(typeName: string): boolean;
}
