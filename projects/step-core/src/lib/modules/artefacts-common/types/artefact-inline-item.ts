export enum ItemType {
  configuration = 'configuration',
  result = 'result',
}

export interface ArtefactInlineItemsResolvableField {
  value?: string | number | boolean | object;
  expression?: string;
  /**
   * @deprecated
   * **/
  tooltip?: string;
  isResolved?: boolean;
}

export interface ArtefactInlineItem {
  itemType?: ItemType;
  icon?: string;
  iconTooltip?: string;
  label?: ArtefactInlineItemsResolvableField;
  value?: ArtefactInlineItemsResolvableField;
  isValueFirst?: boolean;
  hideColon?: boolean;
  margin?: string;
  prefix?: string;
  suffix?: string;
}
