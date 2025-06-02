import { inject, Injectable } from '@angular/core';
import { User, UserService } from '../../generated';
import { StepDataSource, TableRemoteDataSourceFactoryService } from '../../table';
import { HttpOverrideResponseInterceptor } from '../shared/http-override-response-interceptor';
import { HttpOverrideResponseInterceptorService } from './http-override-response-interceptor.service';
import { HttpRequestContextHolderService } from './http-request-context-holder.service';
import { OperatorFunction } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AugmentedUserService extends UserService implements HttpOverrideResponseInterceptor {
  private readonly USER_TABLE_ID = 'users';
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _interceptorOverride = inject(HttpOverrideResponseInterceptorService);
  private _requestContextHolder = inject(HttpRequestContextHolderService);

  overrideInterceptor(override: OperatorFunction<HttpEvent<any>, HttpEvent<any>>): this {
    this._interceptorOverride.overrideInterceptor(override);
    return this;
  }

  getPlansTableDataSource(): StepDataSource<User> {
    return this._dataSourceFactory.createDataSource(this.USER_TABLE_ID, {
      name: 'attributes.name',
      type: 'root._class',
      actions: '',
    });
  }

  createSelectionDataSource(): StepDataSource<User> {
    return this._dataSourceFactory.createDataSource(this.USER_TABLE_ID, { name: 'attributes.name' });
  }
}
