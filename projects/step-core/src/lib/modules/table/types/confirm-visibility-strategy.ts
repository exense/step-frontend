import { ScreenInput } from '../../../client/generated';
import { Observable } from 'rxjs';

export interface ConfirmVisibilityStrategy {
  confirmVisibility(screenInput: ScreenInput): Observable<{ isVisible?: boolean; scope?: string[] }>;
}
