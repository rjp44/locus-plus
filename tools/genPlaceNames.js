const OsGridRef = require('mt-osgridref');
const fs = require('fs');
const { parseFile } = require('fast-csv');
const OpenLocationCode = require('open-location-code/js/src/openlocationcode.js');
const { compress } = require('compress-json');


const HEADERFILE = '../data/OS_Open_Names_Header.csv'
const DATAFILE = '../data/rawOSdata.csv'
const PLACEDATA = '../src/places.json'
// Smallest place we want to associate with a tile - Town seems to be the best compromise but needs more research
const SMALLESTPLACE = 'Town'

// Header is in a separate file with OS data
let headerLine = fs.readFileSync(HEADERFILE, {encoding: 'UTF8'});
let opts = { headers: headerLine.split(',') };


let placeHierarchy = new Map([
    ['Hamlet', 20],
    ['Village', 30],
    ['Town', 40],
    ['Other Settlement', 45],
    ['City', 50]
]);

if (!placeHierarchy.has(SMALLESTPLACE)) {
    console.error(`SMALLEST PLACE ${SMALLESTPLACE} must be one of ${Array.from(placeHierarchy.keys())}`);
    process.exit(1);
}

let places = {};

// If we have more than 1 place of the same type in the same digit square then we choose the
// one with the simplest name. We really don't like big complex names with spaces, hyphens and
// punctuation so these suffer a big penalty.
let complexity = name => (name.length * (1 + name.length - name.match(/[a-zA-Z]/g).length));
    

parseFile(DATAFILE, opts)
    .on('error', error => console.error(error))
    .on('data', row => {
        let { LOCAL_TYPE: type, GEOMETRY_X: easting, GEOMETRY_Y: northing, NAME1: name, NAME2: altName, POSTCODE_DISTRICT: postcode, COUNTRY: country } = row;
        let hierarchy = placeHierarchy.get(row.LOCAL_TYPE);
        // The OS dataset is huge, we are only interested in identifiable settlements.
        if (hierarchy >= placeHierarchy.get(SMALLESTPLACE)) {
            let point = new OsGridRef(easting, northing);
            let { _lat: lat, _lon: long } = OsGridRef.osGridToLatLong(point);
            let plusCode = OpenLocationCode.encode(lat, long);
            // Now we have the plus code for the point at the centre of our thing, lets zoom in and record associations
            // with smaller and smaller tile areas, optomisticaly down to all first 8 digits.
            let codes = [
                plusCode.slice(0, 3),
                plusCode.slice(0, 4),
                plusCode.slice(0, 5),
                plusCode.slice(0, 7),
                plusCode.slice(0, 8),
            ];
            codes.forEach(code => {
                // If there is no place associated with this tile, or there is but this one is a better choice
                //  because it is more noaable or simpler name to say...
                if (places[code] === undefined
                    || places[code].hierarchy < hierarchy
                    || (places[code].hierarchy === hierarchy && complexity(places[code].name) > complexity(name))
                )
                    places[code] = {
                        type,
                        name,
                        altName,
                        hierarchy,
                        lat,
                        long,
                        code,
                        postcode,
                        country
                    };
            })
        }
    })
    .on('end', (number) => {
        // compress and write JSON file.
        let compressed = compress(places)
        fs.writeFileSync(PLACEDATA, JSON.stringify(compressed));
        console.info(`Parsed ${number} rows`, `wrote ${Object.keys(places).length} places`);
    });