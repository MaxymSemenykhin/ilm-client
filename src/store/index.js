import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
// import superlogin from 'superlogin-client'


Vue.use(Vuex)

const API_ALLBOOKS = '/static/books.json';


export const store = new Vuex.Store({
  state: {
    users: [],
    currentUser: {},
    books: [],
    currentBookid: '',
    bookFilters: {filter: '', lang: 'en', importStatus: 'shared'},
    editMode: 'Editor',
    // ilmserver: superlogin,
    // ilmSession: {},
    // ilmAuthError: ''
  },
  getters: {
    allBooks(state) {
      return state.books
    },
    currentBookFilters(state) {
      return state.bookFilters
    },
    currentBook(state) {
      //return state.books.find(book => book.bookid == state.route.params.bookid)
      //console.log(state.route.params.bookid)
      return state.books.find(book => book.meta.bookid == state.currentBookid)
    },
    bookEditMode(state) {
      return state.editMode
    }
  },
  mutations: {
    setCurrentBookFilter(state, obj) { // replace any property of bookFilters
      for (var prop in obj) if(['filter','lang','importStatus'].indexOf(prop)>-1)  {
        state.bookFilters[prop] = obj[prop]
      }
    },
    initiateBooks(state, books) {
      state.books = books
      if (state.route.params.hasOwnProperty('bookid')) state.currentBookid = state.route.params.bookid
      //console.log('books', books)
    },
    setCurrentBook(state, bookid) {
      state.currentBookid = bookid
    },
    setEditMode(state, editMode) {
      state.editMode = editMode
    },
    // setloginSession(session) {
    //   state.session = session
    //   console.log('session', session)
    // }
  },
  actions: {
    initiateBooks(context) {
      axios.get(API_ALLBOOKS)
        .then(response => {  // JSON responses are automatically parsed.
          context.commit('initiateBooks', response.data.books)
          //console.log(response.data.books)
        })
        .catch(e => {
          //this.errors.push(e)
          console.log('Error: ', e)
        })
    },
    // ilmAuth(context) {
    //
    //
    // }
  },
});
