import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { MovieService } from '../../providers/movie/movie.service';
import { Movie } from '../../models/movie.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  movies$: Observable<Movie[]>;

  constructor(
    public movieService: MovieService,
    public navCtrl: NavController
  ) {}

  ionViewDidLoad() {
    this.movies$ = this.movieService.movies$;
  }

  doInfinite(infiniteScroll): Promise<void> {
    if (!this.movieService.finished) {
      return new Promise((resolve, reject) => {

        this.movieService.nextPage()
          .pipe(take(1))
          .subscribe(movies => {
            console.log('Movies!', movies);
            resolve();
          });

      });
    }
    return Promise.resolve();
  }

}
