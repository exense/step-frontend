import { inject, Injectable } from '@angular/core';
import { Parameter, ParametersService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table';
import { Observable, of, OperatorFunction, tap } from 'rxjs';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { HttpEvent } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AugmentedParametersService extends ParametersService implements HttpOverrideResponseInterceptor {
  static readonly PARAMETERS_TABLE_ID = 'parameters';

  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  private cachedParameter?: Parameter;

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  createDataSource(): StepDataSource<Parameter> {
    return this._dataSourceFactory.createDataSource(AugmentedParametersService.PARAMETERS_TABLE_ID, {
      scope: 'scope',
      key: 'key',
      value: 'value',
      description: 'description',
      activationExpressionScript: 'activationExpression.script',
      lastModificationDate: 'lastModificationDate',
      priority: 'priority',
      automationPackage: 'customFields.automationPackageId',
    });
  }

  createSelectionDataSource(): StepDataSource<Parameter> {
    return this._dataSourceFactory.createDataSource(AugmentedParametersService.PARAMETERS_TABLE_ID, {
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
