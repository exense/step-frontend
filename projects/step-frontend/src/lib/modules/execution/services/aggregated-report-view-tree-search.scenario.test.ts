import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AggregatedReportView, ArtefactService, DialogsService, TreeNodeUtilsService } from '@exense/step-core';
import { AggregatedReportViewTreeNodeUtilsService } from './aggregated-report-view-tree-node-utils.service';
import { AggregatedReportViewTreeStateService } from './aggregated-report-view-tree-state.service';

describe('Aggregated report tree search', () => {
  it('indexes both occurrences of a keyword by their existing tree IDs and finds the failed occurrence', fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        AggregatedReportViewTreeStateService,
        AggregatedReportViewTreeNodeUtilsService,
        { provide: TreeNodeUtilsService, useExisting: AggregatedReportViewTreeNodeUtilsService },
        { provide: ArtefactService, useValue: { getArtefactType: () => undefined } },
        { provide: DialogsService, useValue: {} },
      ],
    });
    const state = TestBed.inject(AggregatedReportViewTreeStateService);
    const utils = TestBed.inject(AggregatedReportViewTreeNodeUtilsService);
    const generateId = jest.spyOn(utils, 'getUniqueId');
    const keyword: AggregatedReportView = {
      artefact: { _class: 'CallKeyword', id: 'shared', attributes: { name: 'Get Balance' } },
      parentSource: 'MAIN',
      countByStatus: { PASSED: 1 },
    };

    state.init({
      artefact: { _class: 'Sequence', id: 'root' },
      children: [
        { artefact: { _class: 'Sequence', id: 'first' }, parentSource: 'MAIN', children: [keyword] },
        {
          artefact: { _class: 'Sequence', id: 'second' },
          parentSource: 'SUB_PLAN',
          children: [{ ...keyword, countByStatus: { FAILED: 1 } }],
        },
      ],
    });
    const generatedForTree = generateId.mock.calls.length;
    TestBed.flushEffects();
    const ids = state.findNodesByArtefactId('shared').map((node) => node.id);
    expect(new Set(ids).size).toBe(2);
    state.searchCtrl.setValue('balance');
    tick(300);
    TestBed.flushEffects();
    expect(state.searchResult()).toEqual(ids);

    state.toggleErrorSearch();
    TestBed.flushEffects();
    expect(state.searchResult()).toEqual([ids[1]]);
    expect(generateId).toHaveBeenCalledTimes(generatedForTree);
  }));
});
