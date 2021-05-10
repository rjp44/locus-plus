const OsGridRef = require('mt-osgridref');
const fs = require('fs');
const { parseFile } = require('fast-csv');
const OpenLocationCode = require('open-location-code/js/src/openlocationcode.js');


const HEADERFILE = '../data/OS_Open_Names_Header.csv';
const DATAFILE = '../data/rawOSdata.csv';
const PLACEDATA = '../src/places.json';
// Smallest place we want to associate with a tile - Town seems to be the best compromise but needs more research
const SMALLESTPLACE = 'Town';

// Header is in a separate file with OS data
let headerLine = fs.readFileSync(HEADERFILE, { encoding: 'UTF8' });
let opts = { headers: headerLine.trim().split(',') };


let placeHierarchy = new Map([
  ['Hamlet', 20],
  ['Other Settlement', 30],
  ['Village', 30],
  ['Suburban Area', 35],
  ['Town', 40],
  ['City', 50]
]);

if (!placeHierarchy.has(SMALLESTPLACE)) {
  console.error(`SMALLEST PLACE ${SMALLESTPLACE} must be one of ${Array.from(placeHierarchy.keys())}`);
  process.exit(1);
}

let threshold = placeHierarchy.get(SMALLESTPLACE);

let places = {};
let reservePlaces = {};
let names = {};
let blocklist = {};

// If we have more than 1 place of the same type in the same digit square then we choose the
// one with the simplest name. We really don't like big complex names with spaces, hyphens and
// punctuation so these suffer a big penalty.
let complexity = name => (name.length * (1 + name.length - name.match(/[a-zA-Z]/g).length));


parseFile(DATAFILE, opts)
  .on('error', error => console.error(error))
  .on('data', row => {
    let { ID: id, LOCAL_TYPE: type, GEOMETRY_X: easting, GEOMETRY_Y: northing, NAME1: name, NAME2: altName, POSTCODE_DISTRICT: postcode, COUNTRY: country } = row;
    let hierarchy = placeHierarchy.get(row.LOCAL_TYPE);
    // The OS dataset is huge, we are only interested in identifiable settlements.
    if (hierarchy > 0) {
      let point = new OsGridRef(easting, northing);
      let { _lat: lat, _lon: long } = OsGridRef.osGridToLatLong(point);
      let plusCode = OpenLocationCode.encode(lat, long);
      // Now we have the plus code for the point at the centre of our thing, lets zoom in and record associations
      // with smaller and smaller tile areas, optomisticaly down to all first 10 digits (11 because of +).
      let codes = [
        plusCode.slice(0, 4),
        plusCode.slice(0, 6),
        plusCode.slice(0, 8),
        plusCode.slice(0, 11)
      ];
      let place = {
        id: id.replace(/.*osgb40*/, ''),
        name,
        altName,
        hierarchy,
        lat,
        long,
        country
      };
      let alreadyHave = names[name];
      if (alreadyHave) {
        // Smaller place with same name, taint it
        if (alreadyHave.hierarchy < hierarchy) {
          blocklist[alreadyHave.id] = true;
        }
        // Bigger place with same name, omit data for this one
        else if (alreadyHave.hierarch > hierarchy) {
          return;
        }
        // Two places of same kind with same name, taint the other one and omit this one
        else {
          blocklist[alreadyHave.id] = true;
          return;
        }
      }
      names[name] = id;
      codes.forEach(code => {
        let list = (hierarchy > threshold) ? places : reservePlaces;
        // If there is no place associated with this tile, or there is but this one is a better choice
        //  because it is more noaable or simpler name to say...
        list[place.id] = place;
        list[code] = list[code] || [];
        list[code].push(place.id);
      });
    }
  })
  .on('end', (number) => {
    // If we have a small area with no places, or a larger tile with very few, then add the smaller
    // categories of object in.
    Object.entries(reservePlaces).forEach(([code, entries]) => {
      if ((places[code] === undefined || (code.length === 6 && places[code].length < 2))
        && entries && entries.length) {
        places[code] = (places[code] || []).concat(entries);
        entries.forEach(entry => (places[entry] = reservePlaces[entry]));
      }
    });
    let output = Object.fromEntries(
      Object.entries(places)
        .filter(([key, value]) => !blocklist[key])
        .map(([key, value]) => (Array.isArray(value)) ? [key, value.filter(v => !blocklist[v])] : [key, value])
    );
    fs.writeFileSync(PLACEDATA, JSON.stringify(output));
    console.info(`Parsed ${number} rows`, `wrote ${Object.keys(places).length} places`);
  });