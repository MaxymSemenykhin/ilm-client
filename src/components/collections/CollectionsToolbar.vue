<template>
  <div class="toolbar table">
    <div class="tr">
      <div class="td">
        <h3><img src='/static/bookstack_crop.svg' class='bookstack'/>
          {{ collectionCount() }} Collection{{ (collectionCount()<=1 ? '':'s')}}
        </h3>
      </div>


      <div class="td">
        <input type="text" @keyup="filterChange('title', $event)" class="form-control" placeholder="Search by author or title" v-model="collectionsFilter['title']"></input>
        <select @change="filterChange('language', $event)" v-model="collectionsFilter['language']">
          <option v-for="(name, code) in languages" :value="code">{{name}}</option>
        </select>
      </div>
      
      <div class="td">
        <button v-if="allowBookEditMode" @click="editBook" class='btn btn-default'>
          <i class="fa fa-pencil fa-lg"></i>&nbsp;Edit Book
        </button>
        
      </div>
      <div class="td">
        <button class="btn btn-primary" v-on:click="addCollection" v-if="allowCollectionsEdit">
          <i class="fa fa-plus"></i>&nbsp;Add Collection
        </button>
      </div>
      <div class="td">
        <button v-if='hasItemSelected' class='btn btn-default btn-meta' @click='toggleMetaVisible'>
          <i :class="[metaVisible ? 'fa-chevron-right': 'fa-chevron-left', 'fa fa-lg collapsebtn']" aria-hidden="true"></i>&nbsp;Meta
        </button>
      </div>
    </div>

  </div>
</template>
<script>
  import superlogin from 'superlogin-client';
  import PouchDB from 'pouchdb';
  import {mapGetters} from 'vuex';
  import Vue from 'vue';
  export default {
    name: 'CollectionsToolbar',
    data() {
      return {
        languages: {
          '' : '',
          en: 'English',
          es: 'Spanish',
          de: 'German',
          ru: 'Russian',
          ar: 'Arabic',
          fs: 'Farsi',
          zh: 'Chinese',
          ro: 'Romanian'
        }/*,
        metaVisible: false*/
      };
    },
    props: [
      'hasItemSelected', 'metaVisible'
    ],
    mounted() {
      
    },
    methods: {
      hasBookSelected() {

      },
      collectionCount() {
        return this.bookCollections ? this.bookCollections.length : 0;
      },
      textFilterChange() {

      },
      languageFilterChange() {

      },
      filterChange(field, event) {
        if (this.$route.params.hasOwnProperty('collectionid')) {
          this.$router.replace({ path: '/collections'});
        }
        let filter = {};
        filter[field] = event.target.value;
        this.$store.commit('SET_COLLECTIONS_FILTER', filter);
      },
      addCollection() {
        var dbPath = superlogin.getDbUrl('ilm_collections')
        var db = new PouchDB(dbPath)
        return db.post({
          books: [],
          state: 'unpublished',
          title: '',
          language: 'en',
          description: ''
        }).then(doc => {
          let self = this;
          Vue.nextTick(() => {
            self.$emit('collectionAdded', doc.id)
          });
        }).catch(err => {
        })
      },
      toggleMetaVisible() {
        //this.metaVisible = !this.metaVisible;
        this.$emit('toggleMetaVisible', !this.metaVisible);
      },
      editBook() {
        this.$router.push('/collections/' + this.currentBookMeta.collection_id + '/' + this.currentBookMeta._id + '/edit');
      }
    },
    computed: {
      
      ...mapGetters(['bookCollections', 'collectionsFilter', 'allowCollectionsEdit', 'allowBookEditMode', 'currentBookMeta'])
    }
  }
</script>
<style lang="less" scoped>
  .toolbar {
    width:inherit;
    position: fixed;
    z-index: 9999;
    margin-top: -20px;
    background: #FFFFFF;
  }

  h3 {
    margin: 0;
    padding-top: 0;
    display: inline-block;
  }

  select {
    padding: 3px; height: 2.5em;
  }

  .btn {
    margin-right: .5em;

    &.btn-meta {
      margin-left: 40px;
      &:focus {
        background: rgb(255, 255, 255);
        border-color: rgb(204, 204, 204);
      }
      .collapsebtn {
        margin-right: 5px;
      }
    }
  }


  button:hover {
    color: darkgreen;
    background: #F0FFF0
  }

  img.bookstack {
    width: 30px;
    opacity: .75
  }

  input {width: 14em}

  .form-control {display: inline}
  div {
    &.table {
      display: table;
    }
    &.tr {
      display: table-row;
    }
    &.td {
      display: table-cell;
    }
  }
</style>