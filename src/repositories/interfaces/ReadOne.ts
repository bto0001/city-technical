export interface ReadOne<E, T> {
  get(e: E): Promise<T | null>
}
