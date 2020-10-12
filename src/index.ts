import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const plusOne = (input: number[]) => from(input).pipe(
  map(value => value + 1)
);

export const plusOneOperator = (source$: Observable<number>) => source$.pipe(map(value => value + 1));
