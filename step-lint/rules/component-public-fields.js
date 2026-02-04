const { AST_NODE_TYPES, ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator((name) => '');

const RULE_NAME = 'component-public-fields';
const MESSAGE_IDS = {
  publicField: 'publicField',
};

const COMMON_INTERFACE_EXCLUSIONS = {
  OnInit: ['ngOnInit'],
  OnChanges: ['ngOnChanges'],
  DoCheck: ['ngDoCheck'],
  AfterContentInit: ['ngAfterContentInit'],
  AfterContentChecked: ['ngAfterContentChecked'],
  AfterViewInit: ['ngAfterViewInit'],
  AfterViewChecked: ['ngAfterViewChecked'],
  OnDestroy: ['ngOnDestroy'],
  ControlValueAccessor: ['writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'],
};

const rule = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `In common component fields shouldn't be public, except some exclusions (hooks, interface members, ets)`,
      recommended: 'strict',
    },
    schema: [
      {
        type: 'object',
        properties: {
          exclusions: {
            type: 'array',
            items: {
              anyOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    interfaceName: {
                      type: 'string',
                    },
                    exclusions: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['interfaceName', 'exclusions'],
                },
              ],
            },
          },
        },
      },
    ],
    messages: {
      [MESSAGE_IDS.publicField]: 'Public field. Probably should be protected or private',
    },
  },
  defaultOptions: [],
  create(context) {
    const optionsExclusions = context?.options?.[0]?.exclusions ?? [];
    const globalExclusion = optionsExclusions.filter((item) => typeof item === 'string');
    const additionalExclusions = new Set([...globalExclusion, 'constructor']);

    const interfaceExclusions = new Map();
    Object.entries(COMMON_INTERFACE_EXCLUSIONS).forEach(([key, value]) => interfaceExclusions.set(key, value));
    optionsExclusions
      .filter((item) => typeof item === 'object')
      .forEach((item) => {
        if (interfaceExclusions.has(item.interfaceName)) {
          return;
        }
        interfaceExclusions.set(item.interfaceName, item.exclusions);
      });

    return {
      ClassDeclaration(node) {
        const decorators = node?.decorators ?? [];
        const isComponent = decorators.some((decorator) => decorator?.expression?.callee?.name === 'Component');
        if (!isComponent) {
          return;
        }
        const interfaces = (node?.implements ?? [])
          .map((item) => item?.expression?.name)
          .filter((interfaceName) => !!interfaceName);

        const exclusions = interfaces.reduce((acc, interfaceName) => {
          const interfaceExclusion = interfaceExclusions.get(interfaceName);
          if (!!interfaceExclusion) {
            interfaceExclusion.forEach((exclusion) => acc.add(exclusion));
          }
          return acc;
        }, additionalExclusions);

        node?.body?.body?.forEach?.((member) => {
          if (member.type === AST_NODE_TYPES.PropertyDefinition) {
            const name = member?.key?.name;
            if (!name || exclusions.has(name)) {
              return;
            }

            const propertyDecorators = new Set(
              member?.decorators?.map?.((decorator) => decorator?.expression?.callee?.name) ?? [],
            );
            if (propertyDecorators.has('Input') || propertyDecorators.has('Output')) {
              return;
            }

            const valueExpression = member?.value?.callee;
            const value =
              valueExpression?.type === AST_NODE_TYPES.Identifier
                ? valueExpression?.name
                : valueExpression?.type === AST_NODE_TYPES.MemberExpression
                  ? valueExpression?.object?.name
                  : undefined;

            if (value === 'input' || value === 'output' || value === 'model') {
              return;
            }

            if (member?.accessibility !== 'private' && member?.accessibility !== 'protected') {
              context.report({ node: member, messageId: MESSAGE_IDS.publicField });
            }
          }

          if (member.type === AST_NODE_TYPES.MethodDefinition) {
            const name = member?.key?.name;
            if (!name || exclusions.has(name)) {
              return;
            }
            if (member?.accessibility !== 'private' && member?.accessibility !== 'protected') {
              context.report({ node: member, messageId: MESSAGE_IDS.publicField });
            }
          }
        });
      },
    };
  },
});

module.exports = {
  RULE_NAME,
  MESSAGE_IDS,
  rule,
};
