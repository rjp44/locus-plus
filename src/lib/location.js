import OpenLocationCode from "open-location-code/js/src/openlocationcode.js";
import { LatLon } from 'geodesy/osgridref.js';
import phonetic from "alpha-bravo";

const places = require("../places.json");

export default class Location {


  constructor(latitude, longitude, altitude) {
    this._position = latitude != null && longitude != null && { latitude, longitude, altitude };
  }


  get plusCode() {
    if (!this._position?.latitude)
      return undefined;

    return this._plusCode || (this._pluscode = OpenLocationCode.encode(
      this._position.latitude,
      this._position.longitude,
      OpenLocationCode.CODE_PRECISION_EXTRA
    ));
  }

  get shortCode() {
    if (!this._position?.latitude)
      return undefined;
      if (!this._shortCodes)
        this._buildShortCodes(this._position);
    return this._shortCodes[0];
  }

  get phoneticCode() {
    return this.shortCode && this._phoneticCodes[0];
  }

  get accuracy() {
    return this?._position?.accuracy;
  }


  /**
   *
   *
   * @return {*} 
   * @memberof Location
   */
  queryDevice() {
    let geolocation = navigator.geolocation || global.navigator.geolocation;
    if (!this.position)
      this.position = new Promise((resolve, reject) =>
        geolocation.getCurrentPosition(
          (location) => resolve(location.coords),
          (err) => reject(err), {
          enableHighAccuracy: true,
        }
        )
      )
        .then(({ latitude, longitude, altitude, accuracy }) => (this._position = { latitude, longitude, altitude, accuracy }));
    return this.position;
  }

  shortCodes(num = 5) {
    return this.shortCode && this._shortCodes.slice(0, num);
  }

  phoneticCodes(num = 5) {
    return this.shortCode && this._phoneticCodes.slice(0, num);
  }
  /**
   *
   * @readonly
   * @memberof Location
   */
  get relatedCodes() {
    if (this._position?.latitude === undefined)
      return undefined;
    if (!this._relatedCodes) {
      let lengthResolution = { 4: 1.0, 6: 0.05, 8: 0.0025, 10: 0.000125 };
      // For each code length, 3x3 array of permutations centred on the location +- one digit of precision
      let permutations = Object.entries(lengthResolution)
        .map(([length, resolution]) =>
          [-resolution, 0, resolution].map(xoffset =>
            [-resolution, 0, resolution].map(yoffset =>
              OpenLocationCode.encode(this._position.latitude + xoffset, this._position.longitude + yoffset, length)
                .replace(/0+\+/, '')
            )
          )
        );
      this._relatedCodes = permutations
        .reduce((o, l) => o.concat(l), [])
        .reduce((o, l) => o.concat(l), []);
    }
    return this._relatedCodes;
  }
  /**
   *
   *
   * @param {*} position
   * @memberof Location
   */
  _buildShortCodes(position) {

    function toPhonetic(str) {
      return phonetic.returnAsString(str)
        .replace(/\+/, "plus")
        .trim()
        .split(' ')
        .map((word) => (word[0].toUpperCase() + word.toLowerCase().substring(1)))
        .join(" ");
    }

    let {
      latitude,
      longitude
    } = position;
    let plusCode = this.plusCode;
    let seenCode = {};

    let references = this.relatedCodes
      // All of the places in all of the above arrays
      .reduce((o, code) => o.concat((places[code] || []).map(id => places[id]) || []), [])
      .map((r) => ({
        ...r,
        // Dont bother with the square root calc, we just want to know which distances are smaller not by how much
        distance: (r.lat - latitude) ** 2 + (r.long - longitude) ** 2,
        shortCode: OpenLocationCode.shorten(this.plusCode, r.lat, r.long),
      }))
      .filter((r) => r.shortCode.length !== plusCode.length);
    let size = [].concat(references.sort((a, b) => {
      // Primary sort criteria is shortcode length, then notability
      let res = a.shortCode.length - b.shortCode.length;
      res = res || b.hierarchy - a.hierarchy;
      res = res || a.distance - b.distance;
      return res;
    }))
    let distance = references.sort((a, b) => {
      // Primary sort criteria is shortcode length, then distance
      let res = a.shortCode.length - b.shortCode.length;
      res = res || a.distance - b.distance;
      return res;
    });
    references = [];

    while (distance.length || size.length) {
      references.push(distance.shift());
      references.push(size.shift());
    }
      // Add reference place name
    references = references
      .filter(r => r != null)
      .map((r) => ({
        ...r,
        shortCode: r.shortCode.trim() + `, ${r.name} ${r.country}`,
        phoneticCode: `${toPhonetic(r.shortCode)}, ${r.name}, ${r.country}`,
      }))
      // remove dups
      .filter(
        (r) => !(seenCode[r.shortCode] || !(seenCode[r.shortCode] = true))
      );

    let [shortCodes, phoneticCodes] = [
      references.map((r) => r.shortCode),
      references.map((r) => r.phoneticCode),
    ];
    // Push the full code as a backstop.
    shortCodes.push(this.plusCode);
    phoneticCodes.push(toPhonetic(this.plusCode));
    Object.assign(this, {
      _shortCodes: shortCodes,
      _phoneticCodes: phoneticCodes,
      _shortCode: shortCodes[0],
      _phoneticCode: phoneticCodes[0],
    });
  }


  get osGridRef() {
    if (!this._position?.latitude)
      return undefined;
    if (!this._osGridRef) {
      try {
        let latlon = new LatLon(this._position.latitude, this._position.longitude);
        this._osGridRef = latlon.toOsGrid().toString();
      }
      catch (err) {
        // We are OOB for OS, just record nothing
        console.info(err);
      }
    }
    return this._osGridRef;
  }
}