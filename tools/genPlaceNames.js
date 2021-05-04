const OsGridRef = require('mt-osgridref');
const fs = require('fs');
const { parseFile } = require('fast-csv');
const OpenLocationCode = require('open-location-code/js/src/openlocationcode.js');
const {
    compress,
    decompress
} = require('compress-json');


const HEADERFILE = '../data/OS_Open_Names_Header.csv'
const DATAFILE = '../data/rawOSdata.csv'
const PLACEDATA = '../src/places.json'
const SMALLESTPLACE = 'Village'

let headerLine = fs.readFileSync(HEADERFILE, {encoding: 'UTF8'});

let opts = { headers: headerLine.split(',') };
console.log({ headerLine, opts });

let plusMap = new Map();
let placeHierarchy = new Map([
    ['Other Settlement', 1],
    ['Hamlet', 2],
    ['Village', 3],
    ['Town', 4],
    ['City', 5],
    ['County', 6]
]);

if (!placeHierarchy.has(SMALLESTPLACE)) {
    console.error(`SMALLEST PLACE ${SMALLESTPLACE} must be one of ${Array.from(placeHierarchy.keys())}`);
    process.exit(1);
}

let places = {};

let complexity = name => (name.length * (1 + name.length - name.match(/[a-zA-Z]/g).length));
    

parseFile(DATAFILE, opts)
    .on('error', error => console.error(error))
    .on('data', row => {
        let { LOCAL_TYPE: type, GEOMETRY_X: easting, GEOMETRY_Y: northing, NAME1: name, NAME2: altName, POSTCODE_DISTRICT: postcode, COUNTRY: country } = row;
        let hierarchy = placeHierarchy.get(row.LOCAL_TYPE);
        if (hierarchy >= placeHierarchy.get(SMALLESTPLACE)) {
            let point = new OsGridRef(easting, northing);
            let { _lat: lat, _lon: long } = OsGridRef.osGridToLatLong(point);
            let plusCode = OpenLocationCode.encode(lat, long);
            let codes = [
                plusCode.slice(0, 3),
                plusCode.slice(0, 4),
                plusCode.slice(0, 5),
                plusCode.slice(0, 7),
                plusCode.slice(0, 8),
            ];
            codes.forEach(code => {
                if (places[code] === undefined
                    || places[code].hierarchy < hierarchy
                    || (places[code].hierarchy == hierarchy && complexity(places[code].name) > complexity(name))
                )
                    places[code] = {
                        type,
                        name,
                        hierarchy,
                        lat,
                        long,
                        code,
                        postcode,
                        country
                    };
            })

            console.log({
                type,
                easting,
                northing,
                name,
                altName,
                postcode,
                country, 
                location: { lat, long },
                plusCode,
                codes
//                row
            });

            
        }

    })
    .on('end', (number) => {
        let compressed = compress(places)
        fs.writeFileSync(PLACEDATA, JSON.stringify(compressed));
        console.log(`Parsed ${number} rows`, `wrote ${Object.keys(places).length} places`);
    });


//var point = new OsGridRef(651409, 313177);
//var latlon = OsGridRef.osGridToLatLong(point);