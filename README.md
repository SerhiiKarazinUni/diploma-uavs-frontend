![screenshot](https://github.com/SerhiiKarazinUni/diploma-uavs-frontend/blob/main/screenshot.png?raw=true)

# Prefix tree based searchable encryption (front-end)

This is Vue 3 front-end implementation for [the backend](https://github.com/SerhiiKarazinUni/diploma-uavs-backend).

This project is deployed at `https://se-uavs.lilikovych.name/`.

## Setting up

* `git clone https://github.com/SerhiiKarazinUni/diploma-uavs-frontend`
* `npm install`
* Adjust API endpoint in `src/plugins/index.js` (by default it uses `https://se-uavs-demo.lilikovych.name/`)
* `npm run dev`
* Navigate to `http://localhost:3000/`

## Points on interest

This part of the project performs encryption\decryption of documents (in this case by documents we mean points on the map), and prefix path preparation for search queries and for insertion operations. These operations are implemented in `src/service/api.js`:

* `latlon_to_path` converts latitude/longitude to a valid prefix tree
* `search` prepares and makes search queries to the backend. It also decrypts retrieved objects (if any)
* `add` prepares search prefix, encrypts the document, and sends all the data to the backend

Encryption/decryption and prefix hashing are implemented on the client side (by utilizing an awesome library [crypto-js](https://github.com/brix/crypto-js)) only, there is no need to decrypt data to perform search by prefix.
