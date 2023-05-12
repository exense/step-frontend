import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeImageCompareForm } from '../../types/function-type-image-compare.form';

@Component({
  selector: 'step-function-type-image-compare',
  templateUrl: './function-type-image-compare.component.html',
  styleUrls: ['./function-type-image-compare.component.scss'],
})
export class FunctionTypeImageCompareComponent implements CustomComponent {
  context?: FunctionTypeImageCompareForm;
}
