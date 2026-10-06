import { HttpContextToken } from '@angular/common/http';

export const SKIP_CONNECTION_RETRY = new HttpContextToken<boolean>(() => false);
