import { Directive, inject, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { IDE_MODE } from '../injectables/ide-mode.token';

@Directive({
  selector: '[stepNonIde]',
})
export class NonIdeDirective implements OnInit {
  private readonly _isIdeMode = inject(IDE_MODE);
  private readonly _template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly _viewContainer = inject(ViewContainerRef);

  ngOnInit(): void {
    if (!this._isIdeMode) {
      this._viewContainer.createEmbeddedView(this._template);
    }
  }
}
