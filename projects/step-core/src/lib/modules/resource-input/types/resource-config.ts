export interface ResourceConfig {
  readonly type: string;
  readonly searchTypes?: string[];
  readonly isBounded?: boolean;
  readonly supportsDirectory?: boolean;
  readonly withChooseExistingResourceButton?: boolean;
  readonly withClearButton?: boolean;
  readonly disableServerPath?: boolean;
  readonly withDynamicSwitch?: boolean;
  readonly preserveExistingResource?: boolean;
}
