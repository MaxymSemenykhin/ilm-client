<template>
  <div>
    <!-- <Grid id='collections_grid'
      :data="bookCollections"
      :columns="headers"
      :rowsPerPage="100"
      @clickRow="rowClick"
      :selected="selectedBooks"
      :idField="idField"
      :filter-key="''">
    </Grid> -->
    <div v-for="collection in collectionsPage" class="collection-container">
      <div class="collection-title" :class="['collection-row', {'selected': currentCollection._id == collection._id}]" v-on:click="rowClick(collection, $event)">
        <span slot="header" class="collection-title" @click.prevent.self>
          <i class="fa fa-book"></i>&nbsp;
          {{collection.title + ' ' + collection.books.length + ' Books, ' + collection.pages + ' pages'}}
        </span>
      </div>
      <Grid id='books_grid'
          v-if="isOpenPanel(collection)"
          :data="collection.books_list"
          :columns="headers"
          :rowsPerPage="100"
          @clickRow="selectBook"
          @orderChanged="moveBook(collection, $event)"
          :selected="selectedBooks"
          :idField="'_id'"
          :filter-key="''"
          :draggable="allowCollectionsEdit"
          :sortable="false"
          :ref="'grid-' + collection._id"
          :class="['collection-books-grid']"
          :customEmptyTableText="'No books'"></Grid>
    </div>
  </div>
</template>
<script>
  import Grid from '../generic/Grid';
  import { mapGetters } from 'vuex';
  import Vue from 'vue';
  import superlogin from 'superlogin-client';
  import PouchDB from 'pouchdb';
  
  export default {
      name: 'CollectionsGrid',
      props: {
        
      },
      components: {
        Grid: Grid
      },
      data() {
        return {
          headers: [
            {
              title: 'Title',
              path: 'title',
              addClass: 'booktitle',
              html (val) {
                return `<i class='fa fa-book'></i>&nbsp;&nbsp;${val}`
              }
            },
            {
              title: 'Author',
              path: 'author',
              addClass: 'author',
              render(val) {
                return val && Array.isArray(val) ? val.join(', ') : val;
              }
            },
            {
              title: 'Size',
              path: 'wordcount',
              render (val) {
                return val ? `${Math.round(val / 300)} pages` : '0 pages';
              }
            },
            {
              title: 'Published',
              path: 'published',
              html (val) {
                return '<i class="fa ' + (val ? 'fa-check-square-o' : 'fa-square-o') + '"></i>'
              }
            }
          ],
          idField: '_id',
          selectedBooks: []
        }
      },
      methods: {
        rowClick(collection, event) {
          if (collection._id !== this.currentCollection._id/* && event.target && ['fa fa-book', 'panel-heading accordion-toggle', 'collection-title'].indexOf(event.target.className) !== -1*/) {
            this.$emit('selectCollection', collection._id);
            this.selectedBooks = [];
          } else if (this.selectedBooks.length) {
            this.selectedBooks = [];
            this.$router.replace({ path: '/collections/' + collection._id })
          }
        },
        selectBook(book) {
          this.selectedBooks = [book._id];
          this.$emit('selectBook', book._id, book.collection_id);
        },
        isOpenPanel(collection) {
          if (this.currentCollection._id) {
            return this.currentCollection._id === collection._id;
          }
          return collection.book_match || collection.books.indexOf(this.currentBookMeta._id) !== -1;
        },
        moveBook(collection, data) {
          if (this.allowCollectionsEdit && 
                  typeof data.from !== 'undefined' && 
                  typeof data.to !== 'undefined' && 
                  data.from != data.to) {
            
            
            var dbPath = superlogin.getDbUrl('ilm_collections');
            var db = new PouchDB(dbPath);
            return db.get(collection._id)
              .then(c => {
                if (c.books[data.to] && c.books[data.from]) {
                  let new_books = [];
                  c.books.forEach((b, i) => {
                    if (i == data.to) {
                      if (data.to < data.from) {
                        new_books.push(c.books[data.from]);
                        new_books.push(b);
                      } else {
                        new_books.push(b);
                        new_books.push(c.books[data.from]);
                      }
                    } else if (i != data.from) {
                      new_books.push(b);
                    }
                  });
                  c.books = new_books;
                  db.put(c)
                    .then(doc => {
                    }).catch(err => {
                      console.log(err);
                    });
                }
              })
              .catch(err => {});
          }
        }
      },
      mounted() {
        
      },
      computed: {
        ...mapGetters([
          'bookFilters',
          'bookCollections',
          'allBooks',
          'currentBookMeta',
          'currentCollection',
          'collectionsFilter',
          'allowCollectionsEdit'
        ]),
        collectionsPage: {
          get() {
            let collections = this.bookCollections;
            collections.forEach(c => {
              
              let books = [];
              c.books.forEach(b => {
                let book = this.allBooks.find(_b => {
                  return _b._id === b;
                });
                if (book) {
                  books.push(book);
                }
              });
              c.books_list = books;
              c.book_match = false;
            });
            for (var field in this.collectionsFilter) {
              if (this.collectionsFilter[field].length > 0) {
                let filter = this.collectionsFilter[field].toLowerCase();
                switch (field) {
                  case 'title':
                    collections = collections.filter(item => {
                      let match = item.title.toLowerCase().indexOf(filter) !== -1;
                      if (!match) {
                        item.books_list = item.books_list.filter(b => {
                          return b.title.toLowerCase().indexOf(filter) !== -1 || 
                                  (b.author && b.author.join('|').toLowerCase().indexOf(filter) !== -1);
                        });
                      }
                      let book_match = !match && item.books_list.length > 0;
                      item.match = match;
                      item.book_match = book_match;
                      return match || book_match;//
                    });
                    break;
                  case 'language':
                    collections = collections.filter(item => {
                      return item.language == filter;
                    });
                    break;
                }
              }
            }
            return collections;
          }
        }
      },
      watch: {
        currentBookMeta: {
          handler() {
            if (this.currentBookMeta._id) {
              this.selectedBooks = [this.currentBookMeta._id];
            }
          },
          deep: true
        },
        currentCollection: {
          handler(val, oldVal) {
            if(val._id && !oldVal._id) {
              
            }
          }
        }
      }
  }
</script>
<style lang="less">
  .collection-row {
    position: inherit;
    /*i.fa-book {
      position: absolute;
      top: 10px;
      left: 5px;
    }*/
    .panel-title {
      margin-left: 10px;
    }
    &.selected {
      .panel-heading {
        background-color: #c6c2c2;
      }
    }
    .panel-heading {
      &.selected {
        background-color: #c6c2c2;
      }
    }
  }
  body.modal-open {
    .collection-row {
        position: inherit;
    }
  }
  div.collection-title {
    padding: 10px 5px;
    background-color: #f5f5f5;
    border-color: #ddd;
    color: #333;
    cursor: pointer;
    &.selected {
      background-color: #c6c2c2;
    }
  }
  div.collection-container {
    border: 1px solid #ddd;
    div.collection-books-grid {
      margin: 10px 15px;
    }
  }
</style>