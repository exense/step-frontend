export interface AiHelpCard {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly linkLabel: string;
  readonly url: string;
  readonly isExternal?: boolean;
}

export const AI_DOCUMENTATION_URL = 'https://step.dev/knowledgebase/';
export const AI_COMMUNITY_URL = 'https://github.com/exense/step';

export const GETTING_STARTED_PLACEHOLDER_URL = AI_DOCUMENTATION_URL;
export const EFFECTIVE_PROMPTS_PLACEHOLDER_URL = AI_DOCUMENTATION_URL;

export const AI_HELP_CARDS: readonly AiHelpCard[] = [
  {
    id: 'getting-started',
    icon: 'book-open',
    title: 'Getting Started With Step IDE',
    description: 'A quick guide to set up and create your first automation.',
    linkLabel: 'Open Placeholder',
    url: GETTING_STARTED_PLACEHOLDER_URL,
    isExternal: true,
  },
  {
    id: 'effective-prompts',
    icon: 'message-square',
    title: 'Writing Effective Prompts',
    description: 'Tips and best practices for clear, effective prompts.',
    linkLabel: 'Open Placeholder',
    url: EFFECTIVE_PROMPTS_PLACEHOLDER_URL,
    isExternal: true,
  },
  {
    id: 'plans-and-keywords',
    icon: 'plan',
    title: 'Plans & Keywords',
    description: 'Understand Plans, Keywords, and how they work together.',
    linkLabel: 'Open',
    url: 'https://step.dev/knowledgebase/userdocs/plans/',
    isExternal: true,
  },
  {
    id: 'creating-load-tests',
    icon: 'line-chart-up-01',
    title: 'Creating Load Tests',
    description: 'Learn how to design and run effective load tests.',
    linkLabel: 'Open',
    url: 'https://step.dev/knowledgebase/userdocs/plans/controls/#load-testing',
    isExternal: true,
  },
];
