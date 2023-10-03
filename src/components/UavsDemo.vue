<template>
  <v-row no-gutters class="fill-height">
    <v-col md="4" cols="12" class="text-center px-0 mx-0">
      <l-map ref="map" v-model:zoom="zoom" @ready="onMapReady" v-on:dblclick="onMapDblclick" style="min-height: 300px;">
        <l-tile-layer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
          subdomains="abcd"
          :max-zoom="30"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        <!--<l-circle ref="searchCircle" :lat-lng="currentCenter" :radius="precisionItems[searchPrec].radius" color="green" />-->
        <l-polygon
          :lat-lngs="searchPolygon"
          color="#41b782"
          :fill="true"
          :fillOpacity="0.5"
          fillColor="#41b782"
        />
        <l-marker ref="centerMarker" :lat-lng="currentCenter" :draggable="false">
          <l-icon icon-url="/plus.png" :icon-size="[32,32]" />
        </l-marker>
      </l-map>
    </v-col>

    <v-col md="8" cols="12">
      <v-container>
        <v-row no-gutters>
          <v-col cols="12" class="text-left font-weight-bold text-body-2">
            Search
          </v-col>
        </v-row>
        <v-row class="align-center text-center" no-gutters>
          <v-col cols="12">
            <v-row>
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="searchLat"
                  label="Latitude"
                ></v-text-field>
              </v-col>

              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="searchLon"
                  label="Longitude"
                ></v-text-field>
              </v-col>

              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  v-model="searchPrec"
                  label="Precision"
                  :items="precisionItems"
                  hide-details
                  @update:modelValue="onPrecisionChanged"
                ></v-select>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="12" class="text-left font-weight-bold text-body-2">
                Search results
              </v-col>
            </v-row>


            <v-row no-gutters>
              <v-table density="compact" fixed-header class="w-100">
                <thead>
                <tr>
                  <th class="text-left">
                    Latitude
                  </th>
                  <th class="text-left">
                    Longitude
                  </th>
                  <th class="text-left">
                    Title
                  </th>
                  <th class="text-left">
                    Added at
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="item in searchResults"
                  :key="item.title"
                >
                  <td class="text-left">{{ item.lat }}</td>
                  <td class="text-left">{{ item.lon }}</td>
                  <td class="text-left">{{ item.title }}</td>
                  <td class="text-left">{{ item.addedAt }}</td>
                </tr>
                <tr v-if="searchResults.length === 0">
                  <td colspan="999" class="text-center">No results</td>
                </tr>
                </tbody>
              </v-table>
            </v-row>

            <v-divider class="my-7"></v-divider>

            <v-row no-gutters>
              <v-col cols="12" class="text-left font-weight-bold text-body-2">
                Create object
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col
                cols="12"
                class="text-left"
              >
                <v-text-field
                  v-model="newName"
                  :append-icon="newName ? 'mdi-send' : ''"
                  clear-icon="mdi-close-circle"
                  :clearable="true"
                  label="New object name"
                  type="text"
                  hint="New object will be created at the current map center"
                  @click:append="createNew"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

      <v-container>
        <v-row
          align="end"
          no-gutters
        >
          <v-col
            cols="12"
            class="bg-surface-variant text-wrap rounded">

            <div style="max-height:30vh; overflow-y:scroll;">
            <template v-for="(record,i) in log.slice().reverse()" v-bind:key="i">
              <div class="w-100 px-2 py-1" style="background-color: #F5F7FB; color:#616E8C; word-break:break-all;" v-show="record.origin === 'client'">
                <v-chip variant="outlined" class="text-center me-4" style="width: 70px;">
                  client:
                </v-chip>
                <span class="font-italic text-sm-body-2">{{record.text}}</span>
              </div>

              <div class="w-100 px-2 py-1" style="background-color: #d9e0ef; color:#616E8C; word-break:break-all;" v-show="record.origin === 'server'">
                <v-chip variant="outlined" class="text-center me-4" style="width: 70px;">
                  server:
                </v-chip>
                <span class="font-italic text-sm-body-2">{{record.text}}</span>
              </div>

              <div class="w-100 px-2 py-1" style="background-color: #ece4cc; color:#616E8C; word-break:break-all;" v-show="record.origin === 'info'">
                <v-chip variant="outlined" class="text-center me-4" style="width: 70px;">
                  info:
                </v-chip>
                <span class="font-italic text-sm-body-2">{{record.text}}</span>
              </div>
            </template>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import {inject, ref} from 'vue'
import api from '@/service/api'
import "leaflet/dist/leaflet.css"
import "leaflet"
import { LMap, LTileLayer, LPolygon, LMarker, LIcon } from "@vue-leaflet/vue-leaflet"
import {icon, marker} from "leaflet/src/layer";
import cryptojs from "crypto-js";
export default {
  components: {
    LMap,
    LTileLayer,
    LPolygon,
    LMarker,
    LIcon
  },
  setup(){
    const map = ref(null);

    api.aes_key = cryptojs.enc.Base64.parse(inject('ENC_KEY'));
    api.aes_iv = cryptojs.enc.Base64.parse(inject('ENC_IV'));
    api.hashing_salt = cryptojs.enc.Base64.parse(inject('HASHING_SALT'));

    return {
      map
    }
  },
  mounted() {

  },
  methods:{
    onMapReady(){
      this.map.leafletObject.doubleClickZoom.disable();
      this.map.leafletObject.setView(this.currentCenter, this.precisionItems[this.searchPrec].zoom);
      this.searchLat = this.currentCenter[0];
      this.searchLon = this.currentCenter[1];
      this.doSearch();
    },
    onMapDblclick(e){
      console.log(e.latlng);
      this.currentCenter = e.latlng;
      this.map.leafletObject.flyTo(e.latlng);
      this.searchLon = e.latlng.lng;
      this.searchLat = e.latlng.lat;
      this.doSearch();
    },
    onPrecisionChanged(){
      this.map.leafletObject.flyTo(this.currentCenter, this.precisionItems[this.searchPrec].zoom);
      this.doSearch();
    },
    createNew(){
      const targetLat = api.trunc_num(this.searchLat, 7);
      const targetLon = api.trunc_num(this.searchLon, 7);

      const info = {'latlon': [this.searchLat, this.searchLon], 'title': this.newName, 'added_at': new Date().toLocaleString('en-US')};
      this.newName = "";

      this.log.push({
        origin:'client',
        text:'Insert at ('+targetLat+', '+targetLon+') :'+JSON.stringify(info)
      });

      api.add([targetLat, targetLon], this.logCallback, info, (result)=>{
        this.log.push({
          origin:'client',
          text:'Insert response: '+result
        });

        this.doSearch();
      });
    },
    doSearch(){
      const targetLat = api.trunc_num(this.searchLat, this.precisionItems[this.searchPrec].value);
      const targetLon = api.trunc_num(this.searchLon, this.precisionItems[this.searchPrec].value);

      this.searchPolygon = [
        [
          this.replaceLastDigit(this.searchLat, this.precisionItems[this.searchPrec].value, '000000000'),
          this.replaceLastDigit(this.searchLon, this.precisionItems[this.searchPrec].value, '000000000')
        ],
        [
          this.replaceLastDigit(this.searchLat, this.precisionItems[this.searchPrec].value, '000000000'),
          this.replaceLastDigit(this.searchLon, this.precisionItems[this.searchPrec].value, '999999999')
        ],
        [
          this.replaceLastDigit(this.searchLat, this.precisionItems[this.searchPrec].value, '999999999'),
          this.replaceLastDigit(this.searchLon, this.precisionItems[this.searchPrec].value, '999999999')
        ],
        [
          this.replaceLastDigit(this.searchLat, this.precisionItems[this.searchPrec].value, '999999999'),
          this.replaceLastDigit(this.searchLon, this.precisionItems[this.searchPrec].value, '000000000')
        ]
      ];

      console.log(JSON.stringify(this.searchPolygon));

      this.log.push({
        origin:'info',
        text:'Searching for objects around ('+targetLat+', '+targetLon+'), r='+this.precisionItems[this.searchPrec].title
      });

      this.clearMarkers();
      this.searchResults = [];

      api.search([targetLat, targetLon], this.logCallback, (results)=>{
        results.forEach((el)=>{
          this.markers.push(marker(el.latlon, {icon: icon({iconUrl: '/pin.png', iconSize: [24,24]})}).bindTooltip(el.title, {permanent:true, opacity: 0.5}));
          this.searchResults.push({
            'lat':el.latlon[0],
            'lon':el.latlon[1],
            'title':el.title,
            'addedAt':el.added_at
          });
        });
        this.drawMarkers();
      });
    },
    drawMarkers(){
      this.markers.forEach((el)=>{
        this.map.leafletObject.addLayer(el);
      });
    },
    clearMarkers(){
      this.markers.forEach((el)=>{
        this.map.leafletObject.removeLayer(el);
      });
      this.markers = []
    },
    replaceLastDigit(num, digitCount, replacement){
      if(digitCount === 0){
        return parseFloat(Math.trunc(num)+'.'+replacement);
      }

      return parseFloat(api.trunc_num(num ,digitCount)+''+replacement);
    },
    logCallback(who, str){
      this.log.push({
        origin:who,
        text: str
      });
    }
  },
  data(){
    return{
      currentCenter: [49.9923937,36.2291383],
      searchLon: 36.2291383,
      searchLat: 49.9923937,
      newName: "",
      searchPrec: 1,
      searchPolygon: [],
      precisionItems: [
        {title:'Lat/Lon whole numbers (78km)', value:0, zoom:8},
        {title:'1 decimal place (7.8km)', value:1, zoom: 12},
        {title:'2 decimal places (780m)', value:2, zoom: 15},
        {title:'3 decimal places (78m)', value:3, zoom:18},
        {title:'4 decimal places (7.8m)', value:4, zoom:22},
        {title:'5 decimal places (78cm)', value:5, zoom:25},
        {title:'6 decimal places (7.8cm)', value:6, zoom:30}
      ],
      markers: [],
      searchResults: [],
      log: [],
      zoom: 2
    }
  }
}
</script>
<style>
svg ellipse,path{
  stroke:#EBCA88!important;
}
svg path:nth-child(14),path:nth-child(16),path:nth-child(24){
  fill:#EBCA88!important;
}
svg div{
  color:#333!important;
}
.filled-vertex{
  fill:#616E8C!important;
}
</style>
