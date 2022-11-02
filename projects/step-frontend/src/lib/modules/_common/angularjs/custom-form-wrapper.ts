import { IDirective } from 'angular';
import { getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE } from '@exense/step-core';

export const CUSTOM_FORM_WRAPPER = 'stCustomFromWrapper';

class CustomFormWrapperCtrl {
  stScreen?: string;
  stModel?: Object;
  stOnChange?: Function;
  stDisabled?: boolean;
  stInline?: boolean;
  stExcludeFields?: string[];

  onChange(): void {
    if (this.stOnChange) {
      this.stOnChange();
    }
  }
}

class CustomFormWrapperDirective implements IDirective {
  scope = {
    stScreen: '@',
    stModel: '=',
    stOnChange: '&?',
    stDisabled: '=?',
    stInline: '=?',
    stExcludeFields: '=?',
  };
  controller = CustomFormWrapperCtrl;
  controllerAs = CUSTOM_FORM_WRAPPER;
  bindToController = true;
  template = `
    <st-custom-form
        st-screen="{{${CUSTOM_FORM_WRAPPER}.stScreen}}"
        st-model="${CUSTOM_FORM_WRAPPER}.stModel"
        st-on-change="${CUSTOM_FORM_WRAPPER}.onChange()"
        st-disabled="${CUSTOM_FORM_WRAPPER}.stDisabled"
        st-inline="${CUSTOM_FORM_WRAPPER}.stInline"
        st-exclude-fields="${CUSTOM_FORM_WRAPPER}.stExcludeFields"
    >
    </st-custom-form>
  `;
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive(CUSTOM_FORM_WRAPPER, () => new CustomFormWrapperDirective());
