import { Pipe, PipeTransform } from '@angular/core';
import { ArtefactService } from '../../../services/artefact.service';

@Pipe({
  name: 'artefactIcon',
})
export class ArtefactIconPipe implements PipeTransform {
  constructor(private _artefactTypes: ArtefactService) {}

  transform(artefactClass: string): string {
    return this._artefactTypes.getArtefactType(artefactClass)?.iconNg2 ?? '';
  }
}
