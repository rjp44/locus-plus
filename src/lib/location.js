import OpenLocationCode from "open-location-code/js/src/openlocationcode.js";
import phonetic from "alpha-bravo";
import {
  decompress
} from "compress-json";

const places = decompress(require("../places.json"));

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
        .then(({ latitude, longitude, altitude }) => (this._position = { latitude, longitude, altitude }));
    return this.position;
  }

  shortCodes(num = 5) {
    return this.shortCode && this._shortCodes.slice(0, num);
  }

  phoneticCodes(num = 5) {
    return this.shortCode && this._phoneticCodes.slice(0, num);
  }

  _buildShortCodes(position) {
    let {
      latitude,
      longitude
    } = position;
    let plusCode = this.plusCode;
    let seenCode = {};


    let references = [
      plusCode.slice(0, 4),
      plusCode.slice(0, 6),
      plusCode.slice(0, 8),
      plusCode.slice(0, 11),
    ]
      // All of the places in all of the above arrays
      .reduce((o, code) => o.concat(places[code] || []), [])
      .map((r) => ({
        ...r,
        // Dont bother with the square root calc, we just want to know which distances are smaller not by how much
        distance: (r.lat - latitude) ** 2 + (r.long - longitude) ** 2,
        shortCode: OpenLocationCode.shorten(this.plusCode, r.lat, r.long),
      }))
      .filter((r) => r.shortCode.length !== plusCode.length)
      .sort((a, b) => {
        // Primary sort criteria is shortcode length, then distance, then notability
        let res = a.shortCode.length - b.shortCode.length;
        res = res || a.distance - b.distance;
        res = res || b.hierarchy - a.hierarchy;
        return res;
      })
      // Add reference place name
      .map((r) => ({
        ...r,
        shortCode: r.shortCode.trim() + `, ${r.name} ${r.country}`,
        phoneticCode: phonetic.returnAsString(r.shortCode).replace(/\+/, "plus").trim() +
          `, ${r.name}, ${r.country}`,
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
    phoneticCodes.push(
      phonetic.returnAsString(this.plusCode).replace(/\+/, "plus")
    );
    Object.assign(this, {
      _shortCodes: shortCodes,
      _phoneticCodes: phoneticCodes,
      _shortCode: shortCodes[0],
      _phoneticCode: phoneticCodes[0],
    });
  }
}