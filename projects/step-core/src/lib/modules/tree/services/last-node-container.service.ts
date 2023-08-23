import { Injectable } from '@angular/core';
import { TreeFlatNode } from '../shared/tree-flat-node';

@Injectable()
export abstract class LastNodeContainerService {
  abstract lastNode?: TreeFlatNode;
}
