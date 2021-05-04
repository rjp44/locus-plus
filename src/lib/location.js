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
      
        Object.assign(this, {
            latitude,
            longitude,
            altitude,
            plusCode: OpenLocationCode.encode(latitude, longitude, OpenLocationCode.CODE_PRECISION_EXTRA)
        });
        // Do an any prefix length match on up to the first 8 chars of our code with the known places codes.
        let nameCode = this.plusCode.slice(0, 8);
        while (nameCode.length >= 3) {
            let reference = places[nameCode];
            let shortCode = this.plusCode;
            // If we have a place, and it can be used to shorten the plus code then add it as an alternative
            if (reference) {
                shortCode = OpenLocationCode.shorten(this.plusCode, reference.lat, reference.long);
                if (shortCode !== this.plusCode) {
                    let anchor = `, ${reference.name} ${reference.country}`;
                    this.shortCodes.push(shortCode + anchor)
                    this.phoneticCodes.push(phonetic.returnAsString(shortCode).replace(/\+/, 'plus') + anchor);
                }
            }
            nameCode = nameCode.slice(0, -1);
        }
        // Backstop is the full code, no shortening possible.
        this.shortCodes.push(this.plusCode)
        this.phoneticCodes.push(phonetic.returnAsString(this.plusCode).replace(/\+/, 'plus'));
        // Primary short and phonetic codes are the longest prefixes we found first.
        this.shortCode = this.shortCodes[0];
        this.phoneticCode = this.phoneticCodes[0];

    

    }
 
}