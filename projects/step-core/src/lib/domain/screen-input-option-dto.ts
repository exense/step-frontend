import { ScreenInputActivationExpressionDto } from './screen-input-activation-expression-dto';

export interface ScreenInputOptionDto {
  activationExpression?: ScreenInputActivationExpressionDto;
  /** Format: int32 */
  priority?: number;
  value?: string;
}
