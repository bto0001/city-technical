export interface Write<T, U> {
  create(item: T): Promise<T>;
  update(id: string, item: U): Promise<T>;
  delete(id: string): Promise<boolean>;
}
