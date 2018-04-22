/**
 * Angular 2 decorators and services
 */
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'environments/environment';
import { AppState } from './app.service';

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.css'
  ],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">NLTK</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse"
                      data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                      aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
        <!--  <li class="nav-item active">
            <a class="nav-link" [routerLink]=" ['./'] "
              routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
              Index
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [routerLink]=" ['./home'] "
              routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
              Home
            </a>
          </li> -->
          <li class="nav-item">
            <a class="nav-link" [routerLink]=" ['./tagger'] "
              routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
              Tagger
            </a>
          </li>
          <!--   <li class="nav-item">
            <a class="nav-link" [routerLink]=" ['./detail'] "
              routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
              Detail
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [routerLink]=" ['./barrel'] "
              routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
              Barrel
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" [routerLink]=" ['./about'] "
              routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
              About
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" *ngIf="showDevModule" [routerLink]=" ['./dev-module'] "
            routerLinkActive="active" [routerLinkActiveOptions]= "{exact: true}">
           DevModule
         </a>
          </li> -->
        </ul>
        <form class="form-inline my-2 my-lg-0">
          <input class="form-control mr-sm-2" type="text" placeholder="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
    </nav>


    <div class="container">
      <div class="row">
        <main>
          <router-outlet></router-outlet>
        </main>

      </div>
      <footer>
        <span>Thanks for supporting language tagging</span>
      </footer>
    </div>
  `
})
export class AppComponent implements OnInit {
  public name = 'Angular Starter';
  public tipe = 'assets/img/tipe.png';
  public twitter = 'https://twitter.com/gdi2290';
  public url = 'https://tipe.io';
  public showDevModule: boolean = environment.showDevModule;

  constructor(
    public appState: AppState
  ) {}

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

}

/**
 * Please review the https://github.com/AngularClass/angular-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
