import { InjectionToken } from "@angular/core";
import { environment } from "src/environments/environment";

export const API_URL: InjectionToken<string> = new InjectionToken<string>('API url', {
    providedIn: 'root',
    factory: () => environment.apiUrl
});