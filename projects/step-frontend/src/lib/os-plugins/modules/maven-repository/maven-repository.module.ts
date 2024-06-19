import { NgModule } from '@angular/core';
import { RepositoryParametersSchemasService, StepCoreModule } from '@exense/step-core';

@NgModule({
  declarations: [],
  imports: [StepCoreModule],
})
export class MavenRepositoryModule {
  constructor(_repositoryParamsSchema: RepositoryParametersSchemasService) {
    _repositoryParamsSchema.registerSchema('Artifact', {
      properties: {
        groupId: { type: 'string' },
        artifactId: { type: 'string' },
        version: { type: 'string' },
        classifier: { type: 'string' },
        libGroupId: { type: 'string' },
        libArtifactId: { type: 'string' },
        libVersion: { type: 'string' },
        libClassifier: { type: 'string' },
        mavenSettings: { type: 'string' },
        threads: { type: 'number' },
        includeClasses: { type: 'string' },
        includeAnnotations: { type: 'string' },
        excludeClasses: { type: 'string' },
        excludeAnnotations: { type: 'string' },
      },
      required: ['groupId', 'artifactId', 'version'],
    });
  }
}
