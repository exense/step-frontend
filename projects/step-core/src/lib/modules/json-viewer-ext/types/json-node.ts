export interface JsonNode {
  id: number;
  level: number;
  name: string;
  value?: string | number | boolean;
  prefix?: string;
  suffix?: string;
}
