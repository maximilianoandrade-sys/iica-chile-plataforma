import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

interface MultiFilterSelectProps {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiFilterSelect({ label, values, options, onChange, placeholder }: MultiFilterSelectProps) {
  return (
    <Autocomplete
      multiple
      limitTags={2}
      options={options}
      value={values}
      onChange={(_event, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder || label} size="small" />
      )}
      sx={{ minWidth: 220, background: '#fff', borderRadius: 2, pr: 1 }}
    />
  );
}
