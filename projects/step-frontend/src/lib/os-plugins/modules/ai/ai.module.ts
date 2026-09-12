import { NgModule } from '@angular/core';
import { AiGeneratePageComponent } from './components/ai-generate-page/ai-generate-page.component';
import { AiGenerationsListComponent } from './components/ai-generations-list/ai-generations-list.component';
import { AiSidebarMenuComponent } from './components/ai-sidebar-menu/ai-sidebar-menu.component';
import { AiStartPageComponent } from './components/ai-start-page/ai-start-page.component';
import { AiPromptComponent } from './components/ai-prompt/ai-prompt.component';
import { AiDefineTestCasesComponent } from './components/ai-define-test-cases/ai-define-test-cases.component';
import { AiPasteSpecificationComponent } from './components/ai-paste-specification/ai-paste-specification.component';

@NgModule({
  imports: [
    AiStartPageComponent,
    AiGeneratePageComponent,
    AiGenerationsListComponent,
    AiSidebarMenuComponent,
    AiPromptComponent,
    AiDefineTestCasesComponent,
    AiPasteSpecificationComponent,
  ],
})
export class AiModule {}
