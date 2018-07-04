import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { mergeMap, tap, map, take } from 'rxjs/operators';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

import { Movie } from '../../models/movie.model';

@Injectable()
export class MovieService {

  private _movies$ = new BehaviorSubject<Movie[]>([]);
  batch = 2;
  lastKey = '';
  finished = false;

  constructor(
    public db: AngularFireDatabase
  ) {
    this.nextPage()
      .pipe(take(1))
      .subscribe();
  }

  get movies$(): Observable<Movie[]> {
    return this._movies$.asObservable();
  }

  nextPage(): Observable<Movie[]> {
    if (this.finished) { return this.movies$; }
    return this.getMovies(this.batch + 1, this.lastKey)
      .pipe(
        tap(movies => {

          // set the lastKey in preparation for next query
          this.lastKey = movies[movies.length-1]['title'];
          const newMovies = movies.slice(0, this.batch);

          // get current movies in BehaviorSubject
          const currentMovies = this._movies$.getValue();

          // if data is identical, stop making queries
          if (this.lastKey == newMovies[newMovies.length-1]['title']) {
            this.finished = true;
          }

          this._movies$.next(currentMovies.concat(newMovies));
        })
      );
  }

  private getMovies(batch: number, lastKey: string): Observable<Movie[]> {
    return this.mapListKeys<Movie>(
      this.db.list<Movie>('/movies', ref => {
        const query = ref.orderByChild('title').limitToFirst(batch);
        return (this.lastKey) ? query.startAt(this.lastKey) : query;
      })
    );
  }

  mapListKeys<T>(list: AngularFireList<T>): Observable<T[]> {
    return list
      .snapshotChanges()
      .map(actions => actions.map(action => ({ key: action.key, ...action.payload.val() })));
  }

}
