import { Pipe, PipeTransform } from '@angular/core';
import { FunctionConfigurationDialogForm } from '../types/function-configuration-dialog.form';
import { FunctionType } from '../types/function-type.enum';

@Pipe({
  name: 'stepFunctionTypeForm',
})
export class FunctionTypeFormPipe implements PipeTransform {
  transform(formGroup: FunctionConfigurationDialogForm, functionType: FunctionType) {
    switch (functionType) {
      case FunctionType.COMPOSITE:
        return formGroup.controls.composite;
      case FunctionType.QF_TEST:
        return formGroup.controls.qfTest;
      case FunctionType.SCRIPT:
        return formGroup.controls.script;
      case FunctionType.DOTNET:
        return formGroup.controls.dotnet;
      case FunctionType.ASTRA:
        return formGroup.controls.astra;
      case FunctionType.JMETER:
        return formGroup.controls.jmeter;
      case FunctionType.CYPRESS:
        return formGroup.controls.cypress;
      case FunctionType.ORYON:
        return formGroup.controls.oryon;
      case FunctionType.SOAP_UI:
        return formGroup.controls.soapUI;
      case FunctionType.NODE_JS:
        return formGroup.controls.nodeJS;
      case FunctionType.PDF_TEST:
        return formGroup.controls.pdfTest;
      case FunctionType.IMAGE_COMPARE:
        return formGroup.controls.imageCompare;
      case FunctionType.CUCUMBER:
        return formGroup.controls.cucumber;
      case FunctionType.SIKULIX:
        return formGroup.controls.sikulix;
    }
  }
}
