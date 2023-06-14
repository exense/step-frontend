import { DOCUMENT } from '@angular/common';
import { inject, Inject, Injectable, OnDestroy } from '@angular/core';
import { downgradeInjectable, getAngularJSGlobal } from '@angular/upgrade/static';
import { SessionDto } from '../../../domain';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { AJS_LOCATION, AJS_PREFERENCES, AJS_ROOT_SCOPE, AJS_UIB_MODAL } from '../../../shared/angularjs-providers';
import { AJS_MODULE } from '../../../shared/constants';
import { a1Promise2Observable } from '../../../shared/utils';
import { AdditionalRightRuleService } from '../../../services/additional-right-rule.service';
import { ApplicationConfiguration, PrivateApplicationService } from '../../../client/generated';
import { Mutable } from '../../../shared';
import { AuthContext } from '../shared/auth-context.interface';
import { LoginService } from './login.service';
import { AppConfigContainerService } from './app-config-container.service';
import { NavigatorService } from './navigator.service';

type FieldAccessor = Mutable<Pick<AuthService, 'isOidc'>>;

const OIDC_ENDPOINT_PARAM = 'startOidcEndPoint';

const ANONYMOUS = 'anonymous';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private _$rootScope = inject(AJS_ROOT_SCOPE);
  private _$location = inject(AJS_LOCATION);
  private _document = inject(DOCUMENT);
  private _preferences = inject(AJS_PREFERENCES);
  private _$uibModal = inject(AJS_UIB_MODAL);
  private _additionalRightRules = inject(AdditionalRightRuleService);
  private _privateApplicationApi = inject(PrivateApplicationService);
  private _loginService = inject(LoginService);
  private _serviceContext = inject(AppConfigContainerService);
  private _navigator = inject(NavigatorService);

  private _triggerRightCheck$ = new BehaviorSubject<unknown>(undefined);

  readonly triggerRightCheck$ = this._triggerRightCheck$.asObservable();

  private _context$ = new BehaviorSubject<AuthContext | undefined>(undefined);

  readonly context$ = this._context$.asObservable();

  readonly isOidc: boolean = false;

  private setContextFromSession(session: SessionDto): void {
    const context: AuthContext = {
      userID: session.username,
      rights: session.role.rights,
      role: session.role.attributes['name'],
      otp: session.otp,
      session: {},
    };
    this.setContext(context);
    this.triggerRightCheck();
    this._preferences.load();
  }

  private setContext(context: AuthContext) {
    (this._$rootScope as any).context = context;
    this._context$.next(context);
  }

  getContext(): AuthContext {
    return this._context$.value as AuthContext;
  }

  updateContext(info: Partial<AuthContext>): void {
    const context = { ...this.getContext(), ...info };
    this.setContext(context);
  }

  login(username: string, password: string): Observable<unknown> {
    return this._loginService.login(username, password).pipe(
      switchMap(() => this.getSession()),
      tap(() => {
        const context = this.getContext();
        if (context && !context.otp) {
          if (this._$location.path().indexOf('login') !== -1) {
            this._navigator.navigateToHome();
          }
          (this._$rootScope as any).broadcast('step.login.succeeded');
        }
      })
    );
  }

  logout(): void {
    this._loginService
      .logout()
      .pipe(map(() => ({ userID: ANONYMOUS } as AuthContext)))
      .subscribe((context) => {
        this.setContext(context);
        this._navigator.navigateToHome();
      });
  }

  goToLoginPage(): void {
    this._navigator.navigate('login');
  }

  checkOidc(): void {
    if (this.isOidc) {
      this.redirectToOidc();
      return;
    }
  }

  isAuthenticated(): boolean {
    const context = this.getContext();
    return !!context?.userID && context?.userID !== ANONYMOUS;
  }

  isExtLoginAuth(): boolean {
    return !!this._serviceContext?.conf?.noLoginMask;
  }

  hasRight(right: string): boolean {
    const conf = this.getConf();
    if (!!conf && !conf.authentication) {
      return true;
    }

    const additionalRulesCheckResult = this._additionalRightRules.checkRight(right);
    if (!additionalRulesCheckResult) {
      return false;
    }

    const context = this._context$.value;
    return !!context?.rights ? context.rights.indexOf(right) !== -1 : false;
  }

  getConf(): ApplicationConfiguration | undefined {
    return this._serviceContext.conf;
  }

  debug(): boolean {
    const conf = this._serviceContext.conf;
    return conf?.debug || false;
  }

  showPasswordChangeDialog(otp: boolean): Observable<unknown> {
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
    return a1Promise2Observable(modalInstance.result);
  }

  triggerRightCheck(): void {
    this._triggerRightCheck$.next(undefined);
  }

  ngOnDestroy(): void {
    this._context$.complete();
    this._triggerRightCheck$.complete();
  }

  initialize(): Observable<boolean> {
    return this._privateApplicationApi.getApplicationConfiguration().pipe(
      tap((conf) => {
        this._serviceContext.setConfiguration(conf);
        if (conf.title) {
          this._document.title = conf.title;
        }
        const startOidcEndpoint = conf?.miscParams?.[OIDC_ENDPOINT_PARAM] || undefined;
        (this as FieldAccessor).isOidc = !!startOidcEndpoint && !!conf?.noLoginMask && !!conf.authentication;
      }),
      switchMap(() => this.getSession()),
      map(() => this._serviceContext?.conf?.debug || false)
    );
  }

  private redirectToOidc(): void {
    const conf = this.getConf();
    const startOidcEndpoint = conf!.miscParams![OIDC_ENDPOINT_PARAM];
    const location = this._document.defaultView!.location;
    const redirectUrl = `${startOidcEndpoint}?redirect_uri=${encodeURIComponent(location.href)}`;
    location.assign(redirectUrl);
  }

  private getSession(): Observable<SessionDto | unknown> {
    return (this._privateApplicationApi.getCurrentSession() as Observable<SessionDto>).pipe(
      switchMap((session) => {
        if (!session.otp) {
          return of(session);
        }
        return this.showPasswordChangeDialog(true).pipe(
          map(() => {
            session.otp = true;
            return session;
          })
        );
      }),
      tap((session) => this.setContextFromSession(session)),
      catchError((err) => {
        this.setContext({ userID: ANONYMOUS, role: 'public' });
        return of(err);
      })
    );
  }
}

getAngularJSGlobal().module(AJS_MODULE).service('AuthService', downgradeInjectable(AuthService));
