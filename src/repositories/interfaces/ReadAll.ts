export interface ReadAll<T> {
  getAll(): Promise<T[]>;
}
