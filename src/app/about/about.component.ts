import {
  Component,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Selectables from 'selectables';
declare const $: any;
import 'webpack-jquery-ui';
import 'jquery-contextmenu';


@Component({
  selector: 'about',
  styles: [`
  `],
  template: `
    <h1 >About</h1>
    <div>
      For hot module reloading run
      <pre>npm run start:hmr</pre>
    </div>
    <div>
      <h3>
        patrick@tipe.io
      </h3>
    </div>
    <pre>this.localState = {{ localState | json }}</pre>
    <p>Mouse selection</p>

    <div id="zone1" class="zone">
      <div class="list-group">
        <a href="#" class="list-group-item ">
        Cras justo odio
      </a>
        <a href="#" class="list-group-item">Dapibus ac facilisis in</a>
        <a href="#" class="list-group-item">Morbi leo risus</a>
        <a href="#" class="list-group-item">Porta ac consectetur ac</a>
        <a href="#" class="list-group-item">Vestibulum at eros</a>
      </div>
    </div>

    <p>Mouse + <span id="alt">Alt</span></p>
    <div id="zone2" class="zone">
      <div class="list-group">
        <a href="#" class="list-group-item ">
        Cras justo odio
      </a>
        <a href="#" class="list-group-item">Dapibus ac facilisis in</a>
        <a href="#" class="list-group-item">Morbi leo risus</a>
        <a href="#" class="list-group-item">Porta ac consectetur ac</a>
        <a href="#" class="list-group-item">Vestibulum at eros</a>
      </div>
    </div>

    <ol id="selectable">
      <li class="ui-widget-content">Item 1</li>
      <li class="ui-widget-content">Item 2</li>
      <li class="ui-widget-content">Item 3</li>
      <li class="ui-widget-content">Item 4</li>
      <li class="ui-widget-content">Item 5</li>
      <li class="ui-widget-content">Item 6</li>
      <li class="ui-widget-content">Item 7</li>
    </ol>

    <ul id="the-node">
        <li><span class="context-menu-one btn btn-neutral">right click me 1</span></li>
        <li><span class="context-menu-one btn btn-neutral">right click me 2</span></li>
        <li>right click me 3</li>
        <li>right click me 4</li>
    </ul>

  `
})
export class AboutComponent implements OnInit, AfterViewInit {

  public localState: any;
  constructor(
    public route: ActivatedRoute
  ) {}

  public ngAfterViewInit() {
    const foo = new Selectables({
      elements: 'a',
      selectedClass: 'active',
      zone: '#zone1'
    });

    $('#zone1').css('background-color', 'red');
    $('#selectable').selectable();
    $('#selectable').contextMenu({
      selector: 'li',
        callback: (key, options) => {
            const m = 'clicked: ' + key + ' on ' + $(this).text();
            console.log(m);
        },
        items: {
            edit: {name: 'Edit', icon: 'edit'},
            cut: {name: 'Cut', icon: 'cut'},
            copy: {name: 'Copy', icon: 'copy'},
            paste: {name: 'Paste', icon: 'paste'},
            delete: {name: 'Delete', icon: 'delete'},
            sep1: '---------',
            quit: {
              name: 'Quit',
              icon: ($element, key, item) => {
                return 'context-menu-icon context-menu-icon-quit';
              }}
        },
        position: (opt, x, y) => {
          opt.$menu.css({top: y, left: x, position: 'absolute'});
      }
    });
  }
  public ngOnInit() {
    this.route
      .data
      .subscribe((data: any) => {
        /**
         * Your resolved data from route.
         */
        this.localState = data.yourData;
      });

    console.log('hello `About` component');
    /**
     * static data that is bundled
     * var mockData = require('assets/mock-data/mock-data.json');
     * console.log('mockData', mockData);
     * if you're working with mock data you can also use http.get('assets/mock-data/mock-data.json')
     */
    this.asyncDataWithWebpack();
  }
  private asyncDataWithWebpack() {
    /**
     * you can also async load mock data with 'es6-promise-loader'
     * you would do this if you don't want the mock-data bundled
     * remember that 'es6-promise-loader' is a promise
     */
    setTimeout(() => {

      System.import('../../assets/mock-data/mock-data.json')
        .then((json) => {
          console.log('async mockData', json);
          this.localState = json;
        });

    });
  }

}
