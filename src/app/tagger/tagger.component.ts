import {
  Component,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
declare const $: any;
import 'webpack-jquery-ui';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-contextmenu';
import * as elasticsearch from 'elasticsearch';
import { HttpClient } from '@angular/common/http';
import { EILSEQ } from 'constants';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'tagger',
  styles: [`
  `],
  templateUrl: './tagger.component.html'
})
export class TaggerComponent implements OnInit, AfterViewInit {

  public sentence: any;
  public taggedItems: any;
  public bonsaiUrl: 'https://egq911pz9j:87cqshwnha@nltk-9490602531.us-east-1.bonsaisearch.net';
  public localUrl: 'http://localhost:9200';
  public client =  new elasticsearch.Client({
          host: this.localUrl
          // log: 'trace'
      });
  public currentID = 0;
  public contributors: any;
  public updatedBy: any;
  public totalRecord: any;
  public totalContribution: any;
  public isUnsavedData = false;
  public hasChangedByCurrentContributor = false;
  public hasChangedByAutoUpdate = false;
  public searchResult = [];
  public totalSearchResult: any;
  public posContextMenuData = [];
  public chunkContextMenuData = [];

  constructor(
    public route: ActivatedRoute,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  // ############### initializing ###############
  // ############################################
  // ############################################

  public ngAfterViewInit() {
    $('.sentence').selectable({
      stop : (event, ui) => {
        this.searchSelectedItem();
        this.unselect('pos');
        }
    });
    $('.pos').selectable({
      stop : (event, ui) => {
        this.searchSelectedItem();
        this.unselect('sentence');
        }
    });
    // this.loadContextMenu('sentence');
    // this.loadContextMenu('pos');
  }
  public ngOnInit() {
    this.route
      .data
      .subscribe((data: any) => {
        this.sentence = {words: [],
                          pos: []
                        };
      });
    this.contributors = ['aftab', 'baki', 'shohid'];
    this.updatedBy = this.cookieService.get('Contributor');
    // this.getSentence();
    this.getSent(0);
    this.getRecordCount();
    this.getContextMenuData();
  }

  // ################## nevigation ##################
  // ############################################
  // ############################################

  public movePre() {
    if (this.currentID !== 0) {
      if (this.isUnsavedData) {
        this.saveData().then(() => {
          this.getSent(this.currentID - 1);
        });
      } else {
        this.getSent(this.currentID - 1);
      }
    }
  }

  public moveNext() {
    if (this.currentID + 1 < this.totalRecord) {
      if (this.isUnsavedData) {
        this.saveData().then(() => {
          console.log('move next get sent');
          this.getSent(this.currentID + 1);
        });
      } else {
        this.getSent(this.currentID + 1);
      }
    }
  }

  public moveTo(id) {
    id = parseInt(id);
    if ( id >= 0 && id < this.totalRecord) {
      if (this.isUnsavedData) {
        this.saveData().then(() => {
          this.getSent(id);
        });
      } else {
        this.getSent(id);
      }
    } else {
      alert('Index does not exits');
    }
  }
  public undo() {
    this.getSent(this.currentID);
  }

  public contributorChanged(contributor) {
    this.cookieService.set('Contributor', contributor);
    this.getSent(0);
  }
  // ################## data ##################
  // ############################################
  // ############################################
  public test() {
    // this.tagOtherSent(null).then( () => {
    //   this.saveCurrentSent();
    // });

    this.getSimilarSent().then((resp) => {
      this.tagBulkSent(resp).then(() => {
        this.saveCurrentSent().then(() => {
          console.log('All saved completed');
        });
      });
    });
  }
  public saveData() {
    return new Promise( (resolve, reject) => {
      this.getSimilarSent().then((resp) => {
        this.tagBulkSent(resp).then(() => {
          this.saveCurrentSent().then(() => {
            console.log('All saved completed');
            resolve('Success!');
          });
        });
      });
    });
  }
  public getSent(id) {
    this.client.search({
      index: 'chaldal-pos',
      type: 'title',
      body: {
        query: {
          terms: {
            _id: [ id ]
          }
        }
      }
    }).then((resp) => {
        let sent = '';
        const hits = resp.hits.hits;
        this.currentID = parseInt(hits[0]['_id']);
        const updateSent = hits[0]['_source']['sentUpdate'].filter((obj) => {
          return obj.updateBy === this.updatedBy;
        });
        const autoSentUpdate = hits[0]['_source']['autoSentUpdate'].filter((obj) => {
          return obj.updateBy === this.updatedBy;
        });

        this.hasChangedByCurrentContributor = false;
        this.hasChangedByAutoUpdate = false;
        if (updateSent.length > 0) {
          // take the last updates by contributor
          sent = updateSent[updateSent.length - 1]['sent'];
          this.taggedItems =  updateSent[updateSent.length - 1]['updateTags'];
          this.hasChangedByCurrentContributor = true;
        } else if (autoSentUpdate.length > 0 ) {
          // take the last updates by contributor
          sent = autoSentUpdate[autoSentUpdate.length - 1]['sent'];
          this.taggedItems =  autoSentUpdate[autoSentUpdate.length - 1]['updateTags'];
          this.hasChangedByAutoUpdate = true;
        } else {
          sent = hits[0]['_source']['sent'];
          this.taggedItems = null;
        }
        this.processSent(sent);
        this.searchTitle(hits[0]['_source']['title']);

        this.getTotalContribution();

    }, (err) => {
      if (err) {
        alert(err.message);
      }
    });
  }

  private getContextMenuData() {
    setTimeout(() => {

      System.import('../../assets/mock-data/context-menu.json')
        .then((json) => {
          $.each(json['pos'], (i, element) => {
            this.posContextMenuData.push(element['name']);
          });
          $.each(json['chunk'], (i, element) => {
            this.chunkContextMenuData.push(element['name']);
          });
          this.initContextMenuForWords(json['pos']);
          this.initContextMenuForPos(json['chunk']);
        });

    });
  }

  private getRecordCount() {
    this.client.count({
      index: 'chaldal-pos',
      type: 'title'
    }).then((resp) => {
        this.totalRecord = resp['count'];
    }, (err) => {
      if (err) {
        alert(err);
      }
    });
  }

  private getTotalContribution() {
    this.client.count({
      index: 'chaldal-pos',
      type: 'title',
      body: {
        query: {
          match: {
            'sentUpdate.updateBy' : this.updatedBy
          }
        }
      }
    }).then((resp) => {
        this.totalContribution = resp['count'];
    }, (err) => {
      if (err) {
        alert(err);
      }
    });
  }

  private saveCurrentSent() {
    return this.client.bulk({
      body: [
        // action description
        { update: { _index: 'chaldal-pos', _type: 'title', _id: this.currentID } },
        {
          script: {
          inline: 'ctx._source.sentUpdate.add(params.sentUpdate)',
          params: {sentUpdate: { updateBy: this.updatedBy, sent: this.sentenceToStr(this.sentence),
            updateTags: this.taggedItems} }
          }
        }
      ]
    }).then((resp) => {
      this.getTotalContribution();
      console.log('Data saved');
      this.isUnsavedData = false;
    }, (err, resp) => {
      if (err) {
        alert(err);
      }
    });
  }

  // search for similar sentence and tag the words according to new tags made by the contributor
  private getSimilarSent() {
    const str = this.sentence.words.join(' ');
    // get then sentences which are not tagged by this user and also match with the key words
    return this.client.search({
      index: 'chaldal-pos',
      type: 'title',
      body: {
        size: 200, // restricting it to 200 as its processing in browser
        query: {
          bool: {
            must: {
              query_string : {
                query: str
              }
            },
            must_not: [{
              match: {
                'sentUpdate.updateBy': this.updatedBy
              }
            }, {
            match: {
              _id: this.currentID
            }}]
          }
        }
      }
    });
  }

  private tagBulkSent(resp) {
    const hits = resp.hits.hits;
    const result = [];
    const chunkWords = [];
    let cursor = 0;
    this.sentence.chunkRow.forEach((element, i) => {
      if (element.tagged) {
        chunkWords.push( {words: this.sentence.words.slice(cursor, cursor + element.len),
          tag: element.tag});
      }
      cursor = cursor + element.len;
    });
    console.log('chunk words :', chunkWords);
    let numberOfSentenceChanged = 0;
    const bulkSent = [];
    hits.forEach((element) => {
      let isSentChanged = false;
      const taggedSent = this.splitTaggedSent(element['_source']['sent']);
      const newTagSent = { words: taggedSent.words, pos: [], chunk: []};
      // first tag the pos
      taggedSent.words.forEach( (item, index) => {
        const i = this.taggedItems.words.indexOf(item);
        if (i !== -1) {
          if (this.taggedItems.pos[i]) {
            taggedSent.pos[index] = this.taggedItems.pos[i];
            newTagSent.pos[index] = this.taggedItems.pos[i];
            isSentChanged = true;
          }
        }
      });
      // tagging the chunk
      chunkWords.forEach( (item, i) => {
        const index = taggedSent.words.indexOf(item.words[0]);
        if (index !== -1) {
          if (item.words.join('-') ===
          taggedSent.words.slice(index, index + item.words.length).join('-')) {
            taggedSent.chunk[index] = 'B-' + item.tag;
            newTagSent.chunk[index] = 'B-' + item.tag;
            isSentChanged = true;
            let lastIndex = 100;
            for ( let j = (index + 1); j < (index + item.words.length); j++) {
              taggedSent.chunk[j] = 'I-' + item.tag;
              newTagSent.chunk[j] = 'I-' + item.tag;
              lastIndex = j;
            }
            this.chunkTaggingAfterProcess(lastIndex, taggedSent);
            // dont delete this log is important for debuging
            // console.log('taggedSent', taggedSent, newTagSent);
          }
        }
      });
      // saving the data
      if (isSentChanged) {
        numberOfSentenceChanged++;
        // console.log('saving sentence :', element['_id']);
        bulkSent.push({id: element['_id'], tagSent: taggedSent, nTagSent: newTagSent });
      }
    });
    console.log('Total auto tagged sentence: ', numberOfSentenceChanged);
    return this.saveAutoTaggedSent(bulkSent);
  }


  private saveAutoTaggedSent(bulkSent) {
    const bulkRequest = [];
    bulkSent.forEach( (item, i) => {
      bulkRequest.push({ update: { _index: 'chaldal-pos', _type: 'title', _id: item.id } } );
      bulkRequest.push({
        script: {
        inline: 'ctx._source.autoSentUpdate.add(params.autoSentUpdate)',
        params: {autoSentUpdate: { updateBy: this.updatedBy, sent: this.sentenceToStr(item.tagSent),
          updateTags: item.nTagSent} }
        }
      });
    });
    if ( bulkSent.length === 0 ) {
      return new Promise( (resolve, reject) => {
        resolve('no data for bulk update');
      });
    }
    return this.client.bulk({
      body: bulkRequest
    }).then((resp) => {
      console.log('Updated bulk :', resp);
    }, (err, resp) => {
      if (err) {
        alert(err);
      }
    });
  }
  // ################## search ##################
  // ############################################
  // ############################################
  private searchSelectedItem() {
    const selectedItems = $('tr.sentence').find('.ui-selected');
    const words = [];
    selectedItems.each((i, element) => {
      words.push($(element).text().trim());
      const index = $(element).index();
    });

    if (selectedItems.length === 0) {
      $('tr.pos .ui-selected').each( (i, element) => {
        const index = $(element).index() + 1;
        words.push($('tr.sentence td:nth-child(' + index + ')').text());
      });
    }
    this.searchTitle(words.join(' '));

  }

  private searchTitle(str) {
    str = str.split('"').join('');
    str = str.split('/').join(' ');
    str = str.split('+').join(' ');
    this.searchResult = [];
    this.client.search({
      index: 'chaldal-pos',
      type: 'title',
      body: {
        size: '30',
        query: {
          bool: {
            must: {
              query_string : {
                query: str
              }
            }
          }
        },
        highlight : {
            require_field_match: false,
            fields: {
                    title : { pre_tags : ['<em>'], post_tags : ['</em>'] }
            }
        }
      }
    }).then((resp) => {
        const hits = resp.hits.hits;
        this.totalSearchResult = resp.hits.total;
        const result = [];
        hits.forEach((element) => {
          const _title = element['highlight'] ? element['highlight']['title'] :
          element['_source']['title'];
          console.log(element['_id']);
          result.push({id: element['_id'], title: _title,
                                  productUrl: element['_source']['productUrl']});
        });
        this.searchResult = result;
        // const sent = hits[0]['_source']['sent'];
    }, (err) => {
      if (err) {
        alert(err.message);
      }
    });
  }
  // ################## processing sentence  ##################
  // ############################################
  // ############################################

  private sentenceToStr(sent) {
    const words = [];
    for (let i = 0; i < sent['words'].length; i++) {
      words.push([sent['words'][i],
      sent['pos'][i], sent['chunk'][i]].join(' '));
    }
    return words.join('\n');
  }

  private splitTaggedSent(sent) {
    const _words = [];
    const _pos = [];
    const _chunk = [];
    const tokens = sent.split('\n');
    tokens.forEach( (element) => {
      const taggs = element.split(' ');
      _words.push(taggs[0]);
      _pos.push(taggs[1]);
      _chunk.push(taggs[2]);
    });
    return {words: _words, pos: _pos, chunk: _chunk };
  }
  private processSent(sent) {

    const taggedSent = this.splitTaggedSent(sent);
    if (!this.taggedItems) {
      this.taggedItems = {
        words: taggedSent.words,
        pos: [],
        chunk: []
      };
    }
    this.sentence = {
      words: taggedSent.words,
      pos: taggedSent.pos,
      chunk: taggedSent.chunk,
      chunkRow: this.processChunk(taggedSent.chunk)
    };
  }

  private processChunk(tags) {
    const table = [];
    let _len = 0;
    const tagSplited = [];
    for (let i = 0; i < tags.length; i++) {
      if ( tags[i]) {
        tagSplited.push(tags[i].split('-')); // spliting B-NP
      } else {
        tagSplited.push(['', '']);
      }
    }
    for (let i = 0; i < tags.length; i++) {
      const IOB = tagSplited[i][0]; // I (inside), O (outside), or B (begin).
      const chunkTag = tagSplited[i][1];
      if (IOB === 'O' || IOB === '') {
        table.push({tag: '', len: 1, tagged: false});
      } else if (IOB === 'B') {
        _len = 1;
        let isTagged = false;
        if (this.taggedItems['chunk'][i]) {
          isTagged = true;
        }
        // loop until end of chunk
        while ( (i + 1) < tags.length && tagSplited[i + 1][0] === 'I') {
          i++;
          _len++;
        }
        table.push({tag: chunkTag, len: _len, tagged: isTagged});
      }
    }
    return table;
  }

  private initContextMenuForWords(data) {
    $('.sentence').contextMenu({
      selector: 'td',
        callback: (key, options) => {
            const m = 'clicked: ' + key + ' on ' + $(this).text();
            if (typeof options.$trigger !== 'undefined') {
              if ( options.$trigger.hasClass('ui-selected')) {
                const selectedItems = $('tr.sentence').find('.ui-selected');
                selectedItems.each((i, element) => {
                  const index = $(element).index();
                  this.sentence['pos'][index] = key;
                  this.taggedItems['pos'][index] = key;
                  $(element).removeClass('ui-selected');
                });
                // this.setPOStag(words, key);
                this.isUnsavedData = true;
              } else {
                alert('Please select and item then tag');
              }
            }
        },
        items: data,
        position: (opt, x, y) => {
          opt.$menu.css({top: y, left: x, position: 'absolute'});
      }
    });
  }

  private chunkTaggingAfterProcess(lastIndex, sentence) {
    while ((lastIndex + 1) < sentence['chunk'].length &&
          sentence['chunk'][lastIndex + 1].split('-')[0] === 'I') {
      lastIndex++;
      sentence['chunk'][lastIndex] = 'O';
    }
    sentence['chunkRow'] = this.processChunk(sentence['chunk']);
  }

  private initContextMenuForPos(data) {
    $('.pos').contextMenu({
      selector: 'td',
        callback: (key, options) => {
            const m = 'clicked: ' + key + ' on ' + $(this).text();
            if (typeof options.$trigger !== 'undefined') {
              if ( options.$trigger.hasClass('ui-selected')) {
                const selectedItems = $('tr.pos').find('.ui-selected');
                let lastIndex = 100; // assuming that no sentence will contain more than 100 words
                selectedItems.each((i, element) => {
                  const index = $(element).index();
                  let tag = '';
                  if ( i === 0 ) {
                    tag = 'B-' + key;
                  } else {
                    tag = 'I-' + key;
                  }
                  this.sentence['chunk'][index] = tag;
                  this.taggedItems['chunk'][index] = tag;
                  lastIndex = index;
                  $(element).removeClass('ui-selected');
                });
                this.chunkTaggingAfterProcess(lastIndex, this.sentence);
                this.isUnsavedData = true;
              } else {
                alert('Please select and item then tag');
              }
            }
        },
        items: data,
        position: (opt, x, y) => {
          opt.$menu.css({top: y, left: x, position: 'absolute'});
      }
    });
  }

  private unselect(item) {
    $('tr.' + item + ' .ui-selected').removeClass('ui-selected');
  }

}
