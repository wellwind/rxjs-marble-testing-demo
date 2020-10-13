import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

export const debounceInput = () => (source$: Observable<string>) =>
  source$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(data => data.length >= 3)
  );
