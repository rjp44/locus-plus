import OpenLocationCode from "open-location-code/js/src/openlocationcode.js";
import phonetic from 'alpha-bravo';
import {
  compress,
  decompress
} from 'compress-json'

const places = decompress(require('../places.json'));

export class Location {
    constructor() {
        this.position = new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(position => {
                console.log('got', position);
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
        let nameCode = this.plusCode.slice(0, 8);
        while (nameCode.length >= 3) {
            let reference = places[nameCode];
            console.log('place', { nameCode, reference });
            let locator = '';
            let shortCode = this.plusCode
            if (reference) {
                shortCode = OpenLocationCode.shorten(this.plusCode, reference.lat, reference.long);
                if (shortCode !== this.plusCode) {
                    locator = `, ${reference.name} ${reference.country}`;
                    this.shortCodes.push(shortCode + locator)
                    this.phoneticCodes.push(phonetic.returnAsString(shortCode).replace(/\+/, 'plus') + locator);
                }
            }
            nameCode = nameCode.slice(0, -1);
        }
        this.shortCodes.push(this.plusCode)
        this.phoneticCodes.push(phonetic.returnAsString(this.plusCode).replace(/\+/, 'plus'));
        this.shortCode = this.shortCodes[0];
        this.phoneticCode = this.phoneticCodes[0];
        console.log('returning', {...this})


    

    }
 
}