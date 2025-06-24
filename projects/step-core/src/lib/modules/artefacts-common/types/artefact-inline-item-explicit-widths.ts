import { ArtefactInlineItem } from './artefact-inline-item';
import { WidthContainer } from './width-container';

export interface ArtefactInlineItemExplicitWidths extends ArtefactInlineItem {
  explicitWidths?: WidthContainer;
}
