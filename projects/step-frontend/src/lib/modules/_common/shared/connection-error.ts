export class ConnectionError extends Error {
  constructor(private originalError: Error) {
    super('Connection Error');
  }
}
