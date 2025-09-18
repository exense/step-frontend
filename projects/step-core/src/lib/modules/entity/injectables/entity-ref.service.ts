export abstract class EntityRefService {
  abstract getCurrentEntity<T extends { attributes?: Record<string, string> }>(): T;
}
