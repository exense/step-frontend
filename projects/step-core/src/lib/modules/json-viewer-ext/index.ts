import { JsonViewInlineComponent } from './components/json-view-inline/json-view-inline.component';
import { JsonViewExpandedComponent } from './components/json-view-expanded/json-view-expanded.component';

export * from './components/json-view-inline/json-view-inline.component';
export * from './components/json-view-expanded/json-view-expanded.component';
export {
  JsonParserIconDictionaryConfig,
  JsonParserIconDictionaryConfigItem,
} from './types/json-parser-icon-dictionary';

export const JSON_VIEWER_EXT_EXPORTS = [JsonViewInlineComponent, JsonViewExpandedComponent];
