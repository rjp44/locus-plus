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

    Location.autoComplete(inputValue).then((results) => {
      if (active) {
        let newOptions = [];
        if (value) {
          newOptions = [value];
        }
        if (results) {
          newOptions = [...newOptions, ...results];
        }
        if (results[0] === `${inputValue}, `) {
          setValue(results[0]);
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
