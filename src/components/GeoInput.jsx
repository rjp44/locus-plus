import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Location from '../lib/location';


export default function GeoInput(props) {
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);



  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    const getLongestPrefix = (str) => str.reduce((o, r) => {
      let conseq = 0;
      return r.split('')
        .map((c, index) =>
          (c === o[index] && conseq++ === index && c) || '');
    }, str[0].split(''))
      .join('');

    Location.autoComplete(inputValue).then((results) => {
      if (active) {
        let prefix = results && results.length && getLongestPrefix(results);
        let newOptions = [];
        if (value) {
          newOptions = [value];
        }
        if (results) {
          newOptions = [...newOptions, ...results];
        }
        if (prefix && prefix.length > inputValue.length) {
          setValue(prefix);
        }
        else {
          setOptions(newOptions);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue]);

  return (
    <Autocomplete
      id="geo-input"
      freeSolo
      style={{ minWidth: '40%' }}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
      filterOptions={(x) => x}
      options={options}
      includeInputInList
      value={value}
      onChange={(event, newValue) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        let location = new Location(newInputValue);
        props.setLocation(location);
      }}
      renderInput={(params) => (
        <TextField {...params}
          label="User stated location"
          placeholder="Enter a short or long plus code, or OS Grid Reference here"
          variant="outlined"
          fullWidth />
      )}
    />
  );
}
