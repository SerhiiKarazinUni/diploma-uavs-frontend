import cryptojs from 'crypto-js';
import axios from "axios";

export default {
  trunc_num(num, len){
    if(len === 0){
      return Math.trunc(num);
    }
    let re = new RegExp("^-?\\d+(?:\\.\\d{0,"+len+"})?", "g")
    return num.toString().match(re)[0];
  },

  latlon_to_path(latlon){
    // 1. prepare prefix tree vertices for the search
    let vertices = [];
    const root = Math.trunc(latlon[0]).toString()+Math.trunc(latlon[1]).toString();

    // root vertex is always whole integer part of latitude and longitude
    // e.g. latlon = [59.123, -43.456], then root vertex is string "59-43"
    vertices.push(root);

    // remove already used integer parts
    if((latlon[0]+'').includes('.')) {
      let lat = (latlon[0] + '').replace(Math.trunc(latlon[0]).toString() + '.', '');
      let lon = (latlon[1] + '').replace(Math.trunc(latlon[1]).toString() + '.', '');

      // loop through every digit of fractional parts
      // each next vertex is made from two digits - one from lat and one from lon
      for (let i = 0; i < lat.length; i++) {
        vertices.push((lat[i] + '') + (lon[i] + ''));
      }
    }

    // 2. append hashing salt to every vertex
    vertices.forEach((el, i)=>{
      vertices[i] = cryptojs.enc.Utf8.parse(vertices[i]).concat(this.hashing_salt);
    });

    // 3. calculate sha256 hashes
    let result = cryptojs.SHA256(vertices[0]);
    vertices.forEach((el, i)=>{
      if(i === 0) return;
      result.concat(cryptojs.SHA256(el));
    });

    return cryptojs.enc.Base64.stringify(result);
  },

  add(latlon, log, info, callback){
    const path = this.latlon_to_path(latlon);
    const encrypted_info = cryptojs.AES.encrypt(JSON.stringify(info), this.aes_key, { iv: this.aes_iv }).toString();
    const data = {
      'path': path,
      'document': encrypted_info
    };

    log('client', 'POST '+JSON.stringify(data));

    axios.post('uav', data)
      .then(response => {
        // receive and decrypt found items
        callback(response.status);
      }).catch(ex => {
        callback(ex.toString());
    });
  },

  search(latlon, log, callback){
    const path = this.latlon_to_path(latlon);

    log('client', 'GET q='+path);

    axios.get('uav', {params:{q:path}})
      .then(response => {
        log('server', JSON.stringify(response.data));

        let records = [];
        if(response.status !== 200){
          callback([], response.status);
        }
        response.data.forEach((v)=>{
          records.push(JSON.parse(cryptojs.enc.Utf8.stringify(cryptojs.AES.decrypt(v.data, this.aes_key, { iv: this.aes_iv }))));
        });
        callback(records, 200);
      }).catch(ex => {
        callback([], ex);
    })
  }
}
