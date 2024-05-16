import { inject, Pipe, PipeTransform } from '@angular/core';
import { ArtefactService } from '../../../services/artefact.service';

@Pipe({
  name: 'artefactIcon',
})
export class ArtefactIconPipe implements PipeTransform {
  private _artefactTypes = inject(ArtefactService);

  transform(artefactClass: string): string {
    return this._artefactTypes.getArtefactType(artefactClass)?.icon ?? '';
  }
}
