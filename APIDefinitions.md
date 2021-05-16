## Classes

<dl>
<dt><a href="#Location">Location</a></dt>
<dd><p>Location utility class. Acts as an abstraction for everything we need to know about a location:</p>
<ul>
<li>Fetching it from the Geolocation API</li>
<li>Initialising it from OLC codes, OS Grid ref, or lan/lon</li>
<li>Querying it as long or short OLC codes, OSGR or lat/lon</li>
<li>Generating a short OLC code by referencing the internal places database in places.json</li>
</ul>
<p>Many of these functions could be performed more succinctly by calling external services, but
this class was developed for use in an application which needs to run in an environment where there may
be no connectivity. The only dependency is on places.json in the current source tree.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Position">Position</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#plusCodeString">plusCodeString</a> : <code>String</code></dt>
<dd><p>A full 10 or 11 digit OLC (plus code) string</p>
</dd>
<dt><a href="#shortPlusCodeString">shortPlusCodeString</a> : <code>String</code></dt>
<dd><p>The least significant digits of a plus code which are relative to a
  reference point, followed by <code>comma</code>, <code>space</code> and the name of the reference point.</p>
</dd>
<dt><a href="#OSGRString">OSGRString</a> : <code>String</code></dt>
<dd><p>An OS grid reference in human readable form:
3, 4, or 5 digit reference, two upper case alphabetics followed by two groups of 3, 4, or 5 digits.</p>
</dd>
<dt><a href="#plusCode">plusCode</a> : <code>Object</code></dt>
<dd><p>Object representing a parsed long or short OLC plusCode</p>
</dd>
<dt><a href="#OSGridRef">OSGridRef</a> : <code>Object</code></dt>
<dd><p>Object representing a parsed OS grid reference</p>
</dd>
</dl>

<a name="Location"></a>

## Location
Location utility class. Acts as an abstraction for everything we need to know about a location:
* Fetching it from the Geolocation API
* Initialising it from OLC codes, OS Grid ref, or lan/lon
* Querying it as long or short OLC codes, OSGR or lat/lon
* Generating a short OLC code by referencing the internal places database in places.json

Many of these functions could be performed more succinctly by calling external services, but
this class was developed for use in an application which needs to run in an environment where there may
be no connectivity. The only dependency is on places.json in the current source tree.

**Kind**: global class  

* [Location](#Location)
    * [new Location([location])](#new_Location_new)
    * _instance_
        * [.isValid](#Location+isValid) : <code>boolean</code>
        * [.latitude](#Location+latitude) : <code>number</code>
        * [.longitude](#Location+longitude) : <code>number</code>
        * [.accuracy](#Location+accuracy) : <code>number</code>
        * [.plusCode](#Location+plusCode) : [<code>plusCodeString</code>](#plusCodeString)
        * [.shortCode](#Location+shortCode) : [<code>shortPlusCodeString</code>](#shortPlusCodeString)
        * [.phoneticCode](#Location+phoneticCode) : <code>String</code>
        * [.osGridRef](#Location+osGridRef) : [<code>OSGRString</code>](#OSGRString)
        * [.queryDevice()](#Location+queryDevice) ⇒ <code>Promise</code>
        * [.shortCodes([num])](#Location+shortCodes) ⇒ [<code>Array.&lt;shortPlusCodeString&gt;</code>](#shortPlusCodeString)
        * [.phoneticCodes([num])](#Location+phoneticCodes) ⇒ <code>Array.&lt;String&gt;</code>
    * _static_
        * [.parseLocationString(input)](#Location.parseLocationString) ⇒ [<code>plusCode</code>](#plusCode) \| [<code>OSGridRef</code>](#OSGridRef)
        * [.autoComplete(input)](#Location.autoComplete) ⇒ <code>Array.&lt;String&gt;</code>

<a name="new_Location_new"></a>

### new Location([location])
Creates an instance of Location.
It can either be created as an un-initialised container, in which case a later call on the
queryDevice() method is used to populate it with the device location from the geolocation API,
or we can instantiate it with various forms of location anchor:

* _latitude, longitude, altitude, accuracy_: Decimal degrees of position using WGS84 (GPS) Datum</li>
* _Full Open Location Code_
* _Short Location Code, with placename reference_
* _OS Grid Reference_ 3, 4, or 5 digit reference in the form "NY 12345 67890"

Once set, Locations are immutable by design, there is no "set" or "update" method. This may or
may not be a good design decision. In particular, there are use cases where the location should
track a moving device.


| Param | Type | Description |
| --- | --- | --- |
| [location] | [<code>Position</code>](#Position) \| [<code>plusCodeString</code>](#plusCodeString) \| [<code>shortPlusCodeString</code>](#shortPlusCodeString) \| [<code>OSGRString</code>](#OSGRString) | If passed then the new location     instance will be initialised to these coordinates. |

<a name="Location+isValid"></a>

### location.isValid : <code>boolean</code>
Has this instance been initialised with a valid location?

**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+latitude"></a>

### location.latitude : <code>number</code>
Latitude of represented location

**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+longitude"></a>

### location.longitude : <code>number</code>
Longitude of represented location

**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+accuracy"></a>

### location.accuracy : <code>number</code>
The radius of uncertainty for the location, or zero
if unknown or unsupported.

Currently only supported for values obtained using #queryDevice

**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+plusCode"></a>

### location.plusCode : [<code>plusCodeString</code>](#plusCodeString)
**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+shortCode"></a>

### location.shortCode : [<code>shortPlusCodeString</code>](#shortPlusCodeString)
**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+phoneticCode"></a>

### location.phoneticCode : <code>String</code>
shortCode, transcribed into a string using the NATO phonetic alphabet
for alpha characters and the English word spelling for digits and the `+` sign.

**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+osGridRef"></a>

### location.osGridRef : [<code>OSGRString</code>](#OSGRString)
The OS Grid ref in conventional (two alpha tile prefix) format

**Kind**: instance property of [<code>Location</code>](#Location)  
**Read only**: true  
<a name="Location+queryDevice"></a>

### location.queryDevice() ⇒ <code>Promise</code>
Query the GeoLocation API on the current device and initialise the internal representation if successful.

**Kind**: instance method of [<code>Location</code>](#Location)  
**Returns**: <code>Promise</code> - Resolves when location is retrieved from device
                   rejects on error.  
**Fulfill**: [<code>Position</code>](#Position)  
**Reject**: <code>Error</code>  
<a name="Location+shortCodes"></a>

### location.shortCodes([num]) ⇒ [<code>Array.&lt;shortPlusCodeString&gt;</code>](#shortPlusCodeString)
A list of possible short OLC codes that are valid for this location,
typically sorted in a sensible order:
* shortest codes first
* within codes of same length, nearest location references
* nearest large location (e.g. City)

**Kind**: instance method of [<code>Location</code>](#Location)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [num] | <code>number</code> | <code>5</code> | Maximum number of results to return |

<a name="Location+phoneticCodes"></a>

### location.phoneticCodes([num]) ⇒ <code>Array.&lt;String&gt;</code>
List of possible short OLC codes spelt out phonetically
Identical to shortCodes, but alpabetic characters are mapped onto NATO
phonetic alphabet

**Kind**: instance method of [<code>Location</code>](#Location)  

| Param | Type | Default |
| --- | --- | --- |
| [num] | <code>number</code> | <code>5</code> | 

<a name="Location.parseLocationString"></a>

### Location.parseLocationString(input) ⇒ [<code>plusCode</code>](#plusCode) \| [<code>OSGridRef</code>](#OSGridRef)
Takes an input string and tries to determine what format it is in and then
parse it to provide a complete or partial location.

Currently handles OLC codes and OS grid references, should extend this to include
literal lat/lon.

**Kind**: static method of [<code>Location</code>](#Location)  

| Param | Type |
| --- | --- |
| input | [<code>plusCodeString</code>](#plusCodeString) \| [<code>shortPlusCodeString</code>](#shortPlusCodeString) \| [<code>OSGRString</code>](#OSGRString) | 

<a name="Location.autoComplete"></a>

### Location.autoComplete(input) ⇒ <code>Array.&lt;String&gt;</code>
Takes a textual input and generates an array of possible completions, at present targets 
only OLC shortened plus codes, where the completions are possible reference placenames.

**Kind**: static method of [<code>Location</code>](#Location)  
**Returns**: <code>Array.&lt;String&gt;</code> - An array of possible completions  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | A partial location |

<a name="Position"></a>

## Position : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| latitude | <code>number</code> | Decimal degrees of latitude |
| longitude | <code>number</code> | Decimal degrees of longitude |
| altitude | <code>number</code> | Altitude above mean sea level in metres |
| accuracy | <code>number</code> | The radius of uncertainty for of the location. |

<a name="plusCodeString"></a>

## plusCodeString : <code>String</code>
A full 10 or 11 digit OLC (plus code) string

**Kind**: global typedef  
**Example**  
```js
85GCQ2XF+C84
```
**Example**  
```js
85GCQ2XF+C8
```
<a name="shortPlusCodeString"></a>

## shortPlusCodeString : <code>String</code>
The least significant digits of a plus code which are relative to a
  reference point, followed by `comma`, `space` and the name of the reference point.

**Kind**: global typedef  
**Example**  
```js
G8+7GV, Hoxton, England
```
<a name="OSGRString"></a>

## OSGRString : <code>String</code>
An OS grid reference in human readable form:
3, 4, or 5 digit reference, two upper case alphabetics followed by two groups of 3, 4, or 5 digits.

**Kind**: global typedef  
**Example**  
```js
NY 12345 67890
```
**Example**  
```js
ST123456
```
<a name="plusCode"></a>

## plusCode : <code>Object</code>
Object representing a parsed long or short OLC plusCode

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| plusCode | <code>String</code> | The full or short pluscode |
| separator | <code>String</code> | The separator between the plusCode and any trailing placename (usually ", ") |
| placeName | <code>String</code> | The placename in the input |
| places | <code>String</code> | Places in the internal names database which match placeName |

<a name="OSGridRef"></a>

## OSGridRef : <code>Object</code>
Object representing a parsed OS grid reference

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| easting | <code>number</code> | 
| northing | <code>number</code> | 

