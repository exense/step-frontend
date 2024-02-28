import { Expression } from '../../../client/step-client-module';
import { ModelFormatter } from '../directives/input-model-formatter.directive';

export const CUSTOM_UI_COMPONENTS_FORMATTER: ModelFormatter<string[] | undefined> = {
  formatModelValue(value?: string): string[] | undefined {
    const result = (value || '')
      .split(',')
      .map((x) => x.trim())
      .filter((x) => !!x);
    return result.length === 0 ? undefined : result;
  },
  parseModel(model: string[] | undefined): string {
    return (model || []).join(', ');
  },
};

export const EXPRESSION_SCRIPT_FORMATTER: ModelFormatter<Expression | undefined> = {
  formatModelValue(value?: string, originalModel?: Expression | undefined): Expression | undefined {
    const expression = !value && !originalModel?.scriptEngine ? undefined : { ...(originalModel || {}), script: value };
    return expression;
  },
  parseModel(model: Expression | undefined): string {
    return model?.script || '';
  },
};
