export interface ArtefactInlineItemsResolvableField {
  value?: string | number | boolean | object;
  expression?: string;
  tooltip?: string;
  isResolved?: boolean;
}

export interface ArtefactInlineItem {
  icon?: string;
  iconTooltip?: string;
  label?: ArtefactInlineItemsResolvableField;
  value?: ArtefactInlineItemsResolvableField;
  isValueFirst?: boolean;
  prefix?: string;
  suffix?: string;
}
