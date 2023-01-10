import { IDirective } from 'angular';
import { AbstractArtefact } from '../../client/generated';

export const ARTEFACT_DETAILS_WRAPPER = 'stArtefactDetailsWrapper';

class ArtefactDetailsWrapperCtrl {
  artefact?: AbstractArtefact;
  onSave?: Function;
  readonly?: boolean;
  handle?: any;

  save(artefact: AbstractArtefact): void {
    if (!this.onSave) {
      return;
    }
    this.onSave({ artefact });
  }
}

export const ArtefactDetailsWrapperDirective: IDirective = {
  scope: {
    artefact: '=',
    onSave: '&',
    readonly: '=',
    handle: '=',
  },
  controller: ArtefactDetailsWrapperCtrl,
  controllerAs: ARTEFACT_DETAILS_WRAPPER,
  bindToController: true,
  template: `<artefact-details
    artefact="${ARTEFACT_DETAILS_WRAPPER}.artefact"
    on-save="${ARTEFACT_DETAILS_WRAPPER}.save(artefact)"
    readonly="${ARTEFACT_DETAILS_WRAPPER}.readonly"
    handle="${ARTEFACT_DETAILS_WRAPPER}.handle"
    >
</artefact-details>`,
};
