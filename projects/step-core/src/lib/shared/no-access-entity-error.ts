export class NoAccessEntityError extends Error {
  constructor(readonly originalError: Error) {
    super('No Access Entity Error');
  }
}
