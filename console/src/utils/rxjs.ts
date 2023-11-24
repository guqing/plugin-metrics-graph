import { defer, tap } from 'rxjs';

export {
  of,
  defer,
  concat,
  catchError,
  throwError,
  EMPTY,
  from,
  timer,
  Observable,
  Subject,
  animationFrameScheduler,
  concatMap,
  delay,
  debounceTime,
  mergeWith,
  map,
  retryWhen,
  tap,
  filter,
  concatAll,
  ignoreElements,
  bufferTime,
  finalize,
} from 'rxjs';

export const doOnSubscribe = (cb) => (source) =>
  defer(() => {
    cb();
    return source;
  });

export const listen =
  (cb, execDelay = 150) =>
  (source) => {
    let handle = null;
    return source.pipe(
      doOnSubscribe(
        () => (handle = setTimeout(() => cb('executing'), execDelay)),
      ),
      tap({
        complete: () => {
          handle && clearTimeout(handle);
          cb('completed');
        },
        error: (error) => {
          console.warn('Operation failed:', error);
          handle && clearTimeout(handle);
          cb('failed');
        },
      }),
    );
  };
