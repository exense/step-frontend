import { ScreenInputOptionDto } from './screen-input-option-dto';
import { ScreenInputActivationExpressionDto } from './screen-input-activation-expression-dto';

export interface ScreenInputDto {
  id?: string;
  options?: ScreenInputOptionDto[];
  activationExpression?: ScreenInputActivationExpressionDto;
  /** Format: int32 */
  priority?: number;
  /** @enum {string} */
  type?: 'TEXT' | 'TEXT_DROPDOWN' | 'DROPDOWN' | 'DATE_RANGE' | 'CHECKBOX' | 'NONE';
  label?: string;
  description?: string;
  valueHtmlTemplate?: string;
  searchMapperService?: string;
  defaultValue?: string;
}
