import { inject, Pipe, PipeTransform } from '@angular/core';
import { ArtefactType, DropInfo } from '@exense/step-core';
import { ControlDropInfoFactoryService } from '../../../injectables/control-drop-info-factory.service';
import { ControlDropInfo } from '../../../types/control-drop-info.interface';

@Pipe({
  name: 'artefactDropInfo',
})
export class ArtefactDropInfoPipe implements PipeTransform {
  private _controlDropInfoFactory = inject(ControlDropInfoFactoryService);
  transform(value: ArtefactType): ControlDropInfo {
    return this._controlDropInfoFactory.artefact(value);
  }
}
