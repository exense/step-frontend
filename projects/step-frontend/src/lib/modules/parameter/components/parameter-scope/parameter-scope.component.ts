import { Component, Input, OnInit } from '@angular/core';
import { Parameter } from '@exense/step-core';
import { ParameterScopeRendererService } from '../../services/parameter-scope-renderer.service';

@Component({
  selector: 'step-parameter-scope',
  templateUrl: './parameter-scope.component.html',
  styleUrls: ['./parameter-scope.component.scss'],
})
export class ParameterScopeComponent implements OnInit {
  @Input() parameter!: Parameter;

  scopeLabel: string = '';
  scopeIcon: string = '';
  scopeSpanCssClass: string = '';
  label: string = '';

  constructor(private _parameterScopeRendererService: ParameterScopeRendererService) {}

  ngOnInit(): void {
    this.scopeLabel = this._parameterScopeRendererService.scopeLabel(this.parameter.scope) || '';
    this.scopeIcon = this._parameterScopeRendererService.scopeIcon(this.parameter.scope) || '';
    this.scopeSpanCssClass = this._parameterScopeRendererService.scopeSpanCssClass(this.parameter.scope);
    this.label = this._parameterScopeRendererService.label(this.parameter) || '';
  }
}
