import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { ConfigDto, CredentialsDto, SessionDto } from '../../../domain';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { AJS_LOCATION, AJS_PREFERENCES, AJS_ROOT_SCOPE, AJS_UIB_MODAL } from '../../../shared/angularjs-providers';
import { AJS_MODULE } from '../../../shared/constants';
import { a1Promise2Promise } from '../../../shared/utils';
import { AdditionalRightRuleService } from '../../../services/additional-right-rule.service';

export interface AuthContext {
  userID: string;
  rights: string[];
  role: string;
  otp: boolean;
  session: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  constructor(
    private _http: HttpClient,
    @Inject(AJS_ROOT_SCOPE) private _$rootScope: any,
    @Inject(AJS_LOCATION) private _$location: any,
    @Inject(DOCUMENT) private _document: Document,
    @Inject(AJS_PREFERENCES) private _preferences: any,
    @Inject(AJS_UIB_MODAL) private _$uibModal: any,
    private _additionalRightRules: AdditionalRightRuleService
  ) {}

  private _triggerRightCheck$ = new BehaviorSubject<unknown>(undefined);

  readonly triggerRightCheck$ = this._triggerRightCheck$.asObservable();

  private _serviceContext: { conf?: ConfigDto } = {};

  private _context$ = new BehaviorSubject<AuthContext | undefined>(undefined);

  readonly context$ = this._context$.asObservable();

  private setContext(session: SessionDto): void {
    const context: AuthContext = {
      userID: session.username,
      rights: session.role.rights,
      role: session.role.attributes['name'],
      otp: session.otp,
      session: {},
    };
    this._$rootScope.context = context;
    this._context$.next(context);
    this.triggerRightCheck();
    this._preferences.load();
  }

  getContext(): AuthContext {
    return this._context$.value as AuthContext;
  }

  async init(): Promise<unknown> {
    this._serviceContext.conf = await firstValueFrom(this._http.get('rest/access/conf') as Observable<ConfigDto>);
    this._document.title = this._serviceContext.conf.title;
    return this._serviceContext?.conf?.debug || false;
  }

  async getSession(): Promise<SessionDto | unknown> {
    try {
      const session = await firstValueFrom(this._http.get('rest/access/session') as Observable<SessionDto>);
      if (session.otp) {
        await this.showPasswordChangeDialog(true);
        session.otp = false;
        this.setContext(session);
        return session;
      } else {
        this.setContext(session);
        return session;
      }
    } catch (err) {
      return err;
    }
  }

  async login(credentials: CredentialsDto): Promise<unknown> {
    (await firstValueFrom(this._http.post('rest/access/login', credentials))) as Observable<{ token: string }>;
    await this.getSession();
    const context = this.getContext();
    if (context && !context.otp) {
      this._$rootScope.broadcast('step.login.succeeded');
      if (this._$location.path().indexOf('login') !== -1) {
        this.gotoDefaultPage();
      }
    }
    return undefined;
  }

  async logout(): Promise<unknown> {
    await firstValueFrom(this._http.post('rest/access/logout', {}));
    this._$rootScope.context = { userID: 'anonymous' };
    this.gotoDefaultPage();
    return undefined;
  }

  goToLoginPage(): any {
    return this._$location.path('/root/login');
  }

  gotoDefaultPage(): void {
    if (this._serviceContext.conf && this._serviceContext.conf.defaultUrl) {
      this._$location.path(this._serviceContext.conf.defaultUrl);
    } else {
      this._$location.path('/root/plans/list');
    }
  }

  isAuthenticated(): boolean {
    return !!this._$rootScope.context?.userID && this._$rootScope.context?.userID !== 'anonymous';
  }

  isExtLoginAuth(): boolean {
    return !!this._serviceContext?.conf?.noLoginMask;
  }

  hasRight(right: string): boolean {
    const additionalRulesCheckResult = this._additionalRightRules.checkRight(right);
    if (!additionalRulesCheckResult) {
      return false;
    }

    return this._$rootScope.context && this._$rootScope.context.rights
      ? this._$rootScope.context.rights.indexOf(right) !== -1
      : false;
  }

  getConf(): ConfigDto | undefined {
    return this._serviceContext.conf;
  }

  debug(): boolean {
    const conf = this._serviceContext.conf;
    return conf ? conf.debug : false;
  }

  showPasswordChangeDialog(otp: boolean): Promise<unknown> {
    const modalInstance = this._$uibModal.open({
      backdrop: 'static',
      animation: false,
      templateUrl: 'partials/changePasswordForm.html',
      controller: 'ChangePasswordModalCtrl',
      resolve: {
        otp: function () {
          return otp;
        },
      },
    });
    return a1Promise2Promise(modalInstance.result);
  }

  triggerRightCheck(): void {
    this._triggerRightCheck$.next(undefined);
  }

  ngOnDestroy(): void {
    this._context$.complete();
    this._triggerRightCheck$.complete();
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('AuthService', downgradeInjectable(AuthService));
