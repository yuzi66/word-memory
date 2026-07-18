import { createRouter, createWebHistory } from 'vue-router'
import WordList from '../views/WordList.vue'
import AddWord from '../views/AddWord.vue'
import Practice from '../views/Practice.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/words' },
    { path: '/words', component: WordList },
    { path: '/words/add', component: AddWord },
    { path: '/practice', component: Practice },
  ]
})
