import { AbstractControl, ValidationErrors } from '@angular/forms';
import { DynamicValueString } from '../client/generated';

export const dynamicValueValidatorsFactory = () => ({
  dynamicValueStringValidators: {
    required: (abstractControl: AbstractControl<DynamicValueString>): ValidationErrors | null => {
      const { dynamic, expression, value } = abstractControl.value;
      const invalid = dynamic ? !expression : !value;

      if (!invalid) {
        return null;
      }

      return {
        required: true,
      };
    },
  },
});
