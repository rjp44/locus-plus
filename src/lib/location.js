import OpenLocationCode from "open-location-code/js/src/openlocationcode.js";
import phonetic from 'alpha-bravo';
import { decompress} from 'compress-json'

const places = decompress(require('../places.json'));


export default class Location {

    constructor() {
        let geolocation = navigator.geolocation || global.navigator.geolocation;
        this.position = new Promise((resolve, reject) => 
            geolocation.getCurrentPosition(position => {
                this.build(position.coords);
                resolve(this);
            }, 
                err => reject(err),
                { enableHighAccuracy: true }
            )
        )
     }

    build(position) {
        this.phoneticCodes = [];
        this.shortCodes = [];
        let {
            latitude,
            longitude,
            altitude
        } = position;
        let plusCode = OpenLocationCode.encode(latitude, longitude, OpenLocationCode.CODE_PRECISION_EXTRA);
        let seenCode = {};

        Object.assign(this, {
            latitude,
            longitude,
            altitude,
            plusCode
        });
        let references = [
            plusCode.slice(0, 4),
            plusCode.slice(0, 6),
            plusCode.slice(0, 8),
            plusCode.slice(0, 11)
        ]
            .reduce((o, code) => o.concat(places[code] || []), [])
            .map(r => ({
                ...r,
                distance: (r.lat - latitude) ** 2 + (r.long - longitude) ** 2,
                shortCode: OpenLocationCode.shorten(this.plusCode, r.lat, r.long)
            }))
            .filter(r => r.shortCode.length !== plusCode.length)
            .sort((a, b) => {
               let res = a.shortCode.length - b.shortCode.length;
               if (res === 0)
                 res = a.distance - b.distance;
              if (res === 0)
                 res = b.hierarchy - a.hierarchy;
              return (res);
            })
            .map(r => ({
                ...r,
                shortCode: r.shortCode.trim() + `, ${r.name} ${r.country}`,
                phoneticCode: phonetic.returnAsString(r.shortCode).replace(/\+/, 'plus').trim() + `, ${r.name}, ${r.country}`
            }))
  
            .filter(r => !(seenCode[r.shortCode] || !(seenCode[r.shortCode] = true)))
     
        let [shortCodes, phoneticCodes] = [references.map(r => r.shortCode).slice(0, 5), references.map(r => r.phoneticCode).slice(0, 5)];
        Object.assign(this, { shortCodes, phoneticCodes });

        this.shortCodes.push(this.plusCode)
        this.phoneticCodes.push(phonetic.returnAsString(this.plusCode).replace(/\+/, 'plus'));
        // Primary short and phonetic codes are the longest prefixes we found first.
        this.shortCode = this.shortCodes[0];
        this.phoneticCode = this.phoneticCodes[0];

    

    }
 
}