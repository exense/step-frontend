import { Component, input } from '@angular/core';
import { StepBasicsModule } from '../../../basics/step-basics.module';

/**
 * Informational marker for entities produced by the AI agent.
 * It is not an action: it is not clickable, but it is focusable, so that its description
 * is also available for keyboard users.
 */
@Component({
  selector: 'step-ai-generated-badge',
  templateUrl: './ai-generated-badge.component.html',
  styleUrls: ['./ai-generated-badge.component.scss'],
  imports: [StepBasicsModule],
})
export class AiGeneratedBadgeComponent {
  readonly label = input('AI');
  readonly description = input('AI-generated plan');
}
