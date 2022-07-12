import { Component, OnDestroy } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Mutable, TableLocalDataSource, GridService, AgentListEntry } from '@exense/step-core';
import { Observable, BehaviorSubject, switchMap, shareReplay, tap } from 'rxjs';

type InProgress = Mutable<Pick<AgentListComponent, 'inProgress'>>;

@Component({
  selector: 'step-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss'],
})
export class AgentListComponent implements OnDestroy {
  readonly TYPE_LABEL_TRANSLATIONS: { [key: string]: string } = {
    default: 'Java',
    node: 'Node.js',
    dotnet: '.NET',
  };

  readonly inProgress: boolean = false;

  private agentRequestSubject$ = new BehaviorSubject<any>({});
  readonly agentRequest$: Observable<AgentListEntry[]> = this.agentRequestSubject$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) => this._gridService.getAgents(true.toString())),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableAgent$ = new TableLocalDataSource(this.agentRequest$, {
    searchPredicates: {
      url: (element, searchValue) => element.agentRef!['agentUrl']!.toLowerCase().includes(searchValue.toLowerCase()),
      type: (element, searchValue) =>
        this.TYPE_LABEL_TRANSLATIONS[element.agentRef!.agentType!]!.toLowerCase().includes(searchValue.toLowerCase()),
    },
    sortPredicates: {
      url: (elementA, elementB) => elementA.agentRef!['agentUrl']!.localeCompare(elementB!.agentRef!['agentUrl']!),
      type: (elementA, elementB) =>
        this.TYPE_LABEL_TRANSLATIONS[elementA.agentRef!.agentType!]!.localeCompare(
          this.TYPE_LABEL_TRANSLATIONS[elementB.agentRef!.agentType!]!
        ),
    },
  });

  constructor(private _gridService: GridService) {}

  public loadTable(): void {
    this.agentRequestSubject$.next({});
  }

  public interrupt(id: string): void {
    this._gridService.interruptAgent(id).subscribe(() => {
      this.loadTable();
    });
  }

  public resume(id: string): void {
    this._gridService.resumeAgent(id).subscribe(() => {
      this.loadTable();
    });
  }

  public removeTokenErrors(id: string): void {
    this._gridService.removeAgentTokenErrors(id).subscribe(() => {
      this.loadTable();
    });
  }

  public ngOnDestroy(): void {
    this.agentRequestSubject$.complete();
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepAgentList', downgradeComponent({ component: AgentListComponent }));
