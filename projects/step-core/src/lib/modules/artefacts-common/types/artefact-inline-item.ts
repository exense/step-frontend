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
