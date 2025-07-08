export interface ResourceConfig {
  readonly type: string;
  readonly isBounded?: boolean;
  readonly supportsDirectory?: boolean;
  readonly withSaveButton?: boolean;
  readonly saveButtonLabel?: string;

  //readonly withDownloadButton?: boolean;
  //readonly withUploadResourceButton? boolean;

  readonly withChooseExistingResourceButton?: boolean;
  readonly withClearButton?: boolean; // true
  readonly disableServerPath?: boolean;
  readonly withDynamicSwitch?: boolean;
  readonly preserveExistingResource?: boolean;
}
