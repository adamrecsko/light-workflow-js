export interface ContextResolutionStrategy<T> {
    getContext(): T;
}