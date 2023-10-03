/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import router from '../router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import qs from 'qs'

axios.defaults.baseURL = "https://se-uavs-demo.lilikovych.name/"
//axios.defaults.baseURL = "http://127.0.0.1:8000/"
axios.defaults.headers.common['X-Secret'] = 'secret API token'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.paramsSerializer = p => {
  return qs.stringify(p, { indices: false })
}

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(router)
    .provide('HASHING_SALT', 'YQ==')
    .provide('ENC_KEY', '6Le0DgMTAAAAANokdEEial')
    .provide('ENC_IV', 'mHGFxENnZLbienLyANoi.e')
    .use(VueAxios, axios)
}
