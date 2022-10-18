import { Pipe, PipeTransform } from '@angular/core';
import { ArtefactTypesService } from '../services/artefact-types.service';

@Pipe({
  name: 'artefactIcon',
})
export class ArtefactIconPipe implements PipeTransform {
  constructor(private _artefactTypes: ArtefactTypesService) {}

  transform(artefactClass: string): string {
    return this._artefactTypes.getIconNg2(artefactClass);
  }
}
