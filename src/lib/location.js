import OpenLocationCode from "open-location-code/js/src/openlocationcode.js";
import OsGridRef, { LatLon } from 'geodesy/osgridref.js';
import phonetic from "alpha-bravo";

let places = require("../places.json");

places.byName = Object.fromEntries(
  Object.entries(places)
    .filter(([key, value]) => !Array.isArray(value))
    .map(([key, value]) => [value.name && value.name.toLowerCase(), key])
);


/**
 * @typedef {Object} Position
 * @property {number} latitude  Decimal degrees of latitude
 * @property {number} longitude Decimal degrees of longitude
 * @property {number} altitude  Altitude above mean sea level in metres
 * @property {number} accuracy  The radius of uncertainty for of the location.
 */
/**
 * @typedef {String} plusCodeString
 * @description A full 10 or 11 digit OLC (plus code) string
 * @example 85GCQ2XF+C84
 * @example 85GCQ2XF+C8
 */
/**
 * @typedef {String} shortPlusCodeString
 * @description The least significant digits of a plus code which are relative to a
 *   reference point, followed by `comma`, `space` and the name of the reference point.
 * @example G8+7GV, Hoxton, England
 */

/**
 * @typedef {String} OSGRString
 * @description An OS grid reference in human readable form:
 * 3, 4, or 5 digit reference, two upper case alphabetics followed by two groups of 3, 4, or 5 digits.
 * @example NY 12345 67890
 * @example ST123456
 */

/**
 * Location utility class. Acts as an abstraction for everything we need to know about a location:
 * * Fetching it from the Geolocation API
 * * Initialising it from OLC codes, OS Grid ref, or lan/lon
 * * Querying it as long or short OLC codes, OSGR or lat/lon
 * * Generating a short OLC code by referencing the internal places database in places.json
 * 
 * Many of these functions could be performed more succinctly by calling external services, but
 * this class was developed for use in an application which needs to run in an environment where there may
 * be no connectivity. The only dependency is on places.json in the current source tree.
 */
class Location {


  /**
   * Creates an instance of Location.
   * It can either be created as an un-initialised container, in which case a later call on the
   * queryDevice() method is used to populate it with the device location from the geolocation API,
   * or we can instantiate it with various forms of location anchor:
   * 
   * * _latitude, longitude, altitude, accuracy_: Decimal degrees of position using WGS84 (GPS) Datum</li>
   * * _Full Open Location Code_
   * * _Short Location Code, with placename reference_
   * * _OS Grid Reference_ 3, 4, or 5 digit reference in the form "NY 12345 67890"
   * 
   * Once set, Locations are immutable by design, there is no "set" or "update" method. This may or
   * may not be a good design decision. In particular, there are use cases where the location should
   * track a moving device.
   *
   * @constructor
   * @param {Position|plusCodeString|shortPlusCodeString|OSGRString} [location] If passed then the new location
   *     instance will be initialised to these coordinates.
   */
  constructor(...params) {

    let [latitude, longitude, altitude, accuracy] = (params.length >= 2 && params) || [];
    if (params[0]?.latitude) {
      ({ latitude, longitude, altitude, accuracy } = params[0]);
    }
    else {
      let parsed = (typeof params[0] === 'string') && Location.parseLocationString(params[0]);
      let { plusCode, osgr } = parsed || {};
      if (plusCode) {
        let [recovery] = (parsed?.places?.length === 1 && parsed.places) || [];
        plusCode = (recovery && OpenLocationCode.recoverNearest(parsed.plusCode, recovery.lat, recovery.long)) || plusCode;
        if (plusCode.length >= 11 && plusCode.indexOf('+') === 8) {
          let area = OpenLocationCode.decode(plusCode);
          ({ latitudeCenter: latitude, longitudeCenter: longitude } = area);
        }
      }
      if (osgr) {
        let gridref = new OsGridRef(osgr.easting, osgr.northing);
        ({ latitude, longitude } = gridref.toLatLon());
      }
    }
    this._position = latitude != null && longitude != null && { latitude, longitude, altitude, accuracy };
  }


  /**
   * 
   * Query the GeoLocation API on the current device and initialise the internal representation if successful.
   *
   * @return {Promise} Resolves when location is retrieved from device
   *                    rejects on error.
   * @fulfill {Position}
   * @reject {Error}
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

  /**
   * Has this instance been initialised with a valid location?
   *
   * @type boolean
   * @readonly
   * @memberof Location
   */
  get isValid() {
    return this._position?.latitude != null;
  }

  /**
   * Latitude of represented location
   *
   * @type number
   * @readonly
   * @memberof Location
   */
  get latitude() {
    return this._position?.latitude;
  }

  /**
   *  Longitude of represented location
   * 
   * @type number
   * @readonly
   * @memberof Location
   */
  get longitude() {
    return this._position?.longitude;
  }

  /**
   * The radius of uncertainty for the location, or zero
   * if unknown or unsupported.
   * 
   * Currently only supported for values obtained using #queryDevice
   *
   * @type number
   * @readonly
   * @memberof Location
   */
  get accuracy() {
    return this._position?.accuracy || 0;
  }


  /**
   * 
   * @type plusCodeString
   * @readonly
   * @memberof Location
   */
  get plusCode() {
    if (!this._position?.latitude)
      return undefined;

    return this._plusCode || (this._pluscode = OpenLocationCode.encode(
      this._position.latitude,
      this._position.longitude,
      OpenLocationCode.CODE_PRECISION_EXTRA
    ));
  }

  /**
   *
   * @type shortPlusCodeString
   * @readonly
   */
  get shortCode() {
    if (!this._position?.latitude)
      return undefined;
    if (!this._shortCodes)
      this._buildShortCodes(this._position);
    return this._shortCodes[0];
  }

  /**
   * shortCode, transcribed into a string using the NATO phonetic alphabet
   * for alpha characters and the English word spelling for digits and the `+` sign.
   * 
   * @readonly
   * @type String
   */
  get phoneticCode() {
    return this.shortCode && this._phoneticCodes[0];
  }

  /**
   * A list of possible short OLC codes that are valid for this location,
   * typically sorted in a sensible order:
   * * shortest codes first
   * * within codes of same length, nearest location references
   * * nearest large location (e.g. City)
   *
   * @param {number} [num=5] Maximum number of results to return
   * @return {shortPlusCodeString[]} 
   */
  shortCodes(num = 5) {
    return this.shortCode && this._shortCodes.slice(0, num);
  }

  /**
   * List of possible short OLC codes spelt out phonetically
   * Identical to shortCodes, but alpabetic characters are mapped onto NATO
   * phonetic alphabet
   *
   * @param {number} [num=5]
   * @return {String[]} 
   * @memberof Location
   */
  phoneticCodes(num = 5) {
    return this.shortCode && this._phoneticCodes.slice(0, num);
  }
  /**
   * Get the complete list of nearby locations that are candidate shorteners for this location
   * 
   * @readonly
   * @private
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
   * @private
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
    }));
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

  /**
   * The OS Grid ref in conventional (two alpha tile prefix) format
   *
   * @type OSGRString
   * @readonly
   * @memberof Location
   */
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


  /**
   * Object representing a parsed long or short OLC plusCode
   * @typedef {Object} plusCode
   * @property {String} plusCode The full or short pluscode
   * @property {String} separator The separator between the plusCode and any trailing placename (usually ", ")
   * @property {String} placeName The placename in the input
   * @property {String} places Places in the internal names database which match placeName
   */

  /**
   * Object representing a parsed OS grid reference
   * @typedef {Object} OSGridRef
   * @property {number} easting
   * @property {number} northing
   */
  /**
   * Takes an input string and tries to determine what format it is in and then
   * parse it to provide a complete or partial location.
   * 
   * Currently handles OLC codes and OS grid references, should extend this to include
   * literal lat/lon.
   *
   * @static
   * @param {plusCodeString|shortPlusCodeString|OSGRString} input
   * @return {plusCode|OSGridRef} 
   * @memberof Location
   */
  static parseLocationString(input) {
    // Is it a pluscode?
    let [, plusCode, separator, placeName] = input.match(
      /^([23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,3})(, )?(.*)?$/i
    ) || [];

    if (plusCode)
      return ({
        plusCode,
        separator,
        placeName,
        places: placeName && Object.entries(places.byName)
          .filter(([key, value]) => key.startsWith(placeName.replace(/, .*/, '').toLowerCase()))
          .map(([key, value]) => places[value])
      });

    // Is it an OS Grid Reference
    let osgr = input.match(/^([H-T][A-Y])? ?([0-9]{3,6}) ?([0-9]{3,6})$/);
    if (osgr) {
      try {
        osgr = OsGridRef.parse(input);
        return { osgr };
      }
      catch (e) {
        //  Nowt
      }
    }
    // TODO Is it a decimal Lat/Lon
    return {};

  }
  /**
   * Takes a textual input and generates an array of possible completions, at present targets 
   * only OLC shortened plus codes, where the completions are possible reference placenames.
   * 
   * @static
   * @param {String} input A partial location
   * @return {String[]} An array of possible completions
   * @memberof Location
   */
  static async autoComplete(input) {
    let suggestions = [];
    let { plusCode, separator, placeName } = Location.parseLocationString(input);
    placeName = placeName && placeName.toLowerCase();

    if (plusCode) {
      if (!separator && plusCode.match(/^[23456789CFGHJMPQRVWX]{2,6}\+[23456789CFGHJMPQRVWX]{3,3}$/)) {
        suggestions.push(`${plusCode}, `);
      }
      else if (separator && placeName && placeName.length) {
        suggestions = Object.entries(places.byName)
          .filter(([key, value]) => key.startsWith(placeName))
          .map(([key, value]) => `${plusCode}, ${places[value].name}, ${places[value].country}`);
      }
    }
    return (suggestions);
  }
}


export default Location;