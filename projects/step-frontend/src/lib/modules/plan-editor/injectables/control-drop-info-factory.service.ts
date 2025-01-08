import { Injectable } from '@angular/core';
import { ArtefactType, Keyword, Plan } from '@exense/step-core';
import { ControlDropInfo } from '../types/control-drop-info.interface';
import { ControlType } from '../types/control-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ControlDropInfoFactoryService {
  artefact(artefact: ArtefactType): ControlDropInfo {
    const { label, icon, type } = artefact;
    return {
      id: type,
      label,
      icon,
      type: ControlType.ARTEFACT,
    };
  }

  keyword(keyword: Keyword): ControlDropInfo {
    return {
      id: keyword.id!,
      label: keyword.attributes?.['name'] ?? '',
      icon: 'keyword',
      type: ControlType.KEYWORD,
    };
  }

  plan(plan: Plan): ControlDropInfo {
    return {
      id: plan.id!,
      label: plan.attributes?.['name'] ?? '',
      icon: 'external-link',
      type: ControlType.PLAN,
    };
  }
}
