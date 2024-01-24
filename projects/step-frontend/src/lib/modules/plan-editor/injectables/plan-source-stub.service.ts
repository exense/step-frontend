import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';
import { Plan } from '@exense/step-core';

const DEMO_YAML = `# Use root/example as user/password credentials
version: '3.1'

services:

  mongo:
    image: mongo:4.0.4
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example

  mongo-express:
    image: mongo-express
    restart: always
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: example
      ME_CONFIG_MONGODB_URL: mongodb://root:example@mongo:27017/
  `;

@Injectable({
  providedIn: 'root',
})
export class PlanSourceStubService {
  getPlanSource(plan: Plan): Observable<string> {
    return timer(500).pipe(map(() => DEMO_YAML));
  }
}
