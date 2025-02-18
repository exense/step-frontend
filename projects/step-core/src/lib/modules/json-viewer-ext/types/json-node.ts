export interface JsonNode {
  id: number;
  level: number;
  name: string;
  icon?: string;
  iconTooltip?: string;
  isParentIconExist?: boolean;
  value?: string | number | boolean;
  prefix?: string;
  suffix?: string;
}
