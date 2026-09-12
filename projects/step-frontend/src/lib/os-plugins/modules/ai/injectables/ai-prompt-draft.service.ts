import { Injectable } from '@angular/core';
import { AiPromptDraft } from '../shared';

@Injectable({ providedIn: 'root' })
export class AiPromptDraftService {
  private draft?: AiPromptDraft;

  setDraft(draft: AiPromptDraft): void {
    this.draft = { ...draft };
  }

  consumeDraft(): AiPromptDraft | undefined {
    const draft = this.draft;
    this.clearDraft();
    return draft;
  }

  clearDraft(): void {
    this.draft = undefined;
  }
}
