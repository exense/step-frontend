import { inject, Injectable } from '@angular/core';
import { Parameter, ParametersService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table/step-table-client.module';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AugmentedParametersService extends ParametersService {
  private readonly PARAMETERS_TABLE_ID = 'parameters';

  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);

  private cachedParameter?: Parameter;

  createDataSource(): StepDataSource<Parameter> {
    return this._dataSourceFactory.createDataSource(this.PARAMETERS_TABLE_ID, {
      scope: 'scope',
      key: 'key',
      value: 'value',
      activationExpressionScript: 'activationExpression.script',
      priority: 'priority',
    });
  }

  createSelectionDataSource(): StepDataSource<Parameter> {
    return this._dataSourceFactory.createDataSource(this.PARAMETERS_TABLE_ID, {
      scope: 'scope',
    });
  }

  getParameterByIdCached(id: string): Observable<Parameter> {
    if (this.cachedParameter && this.cachedParameter.id === id) {
      return of(this.cachedParameter);
    }
    return super.getParameterById(id).pipe(tap((parameter) => (this.cachedParameter = parameter)));
  }

  cleanupCache(): void {
    this.cachedParameter = undefined;
  }
}
