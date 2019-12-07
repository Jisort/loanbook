/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
function countryToFlag(isoCode) {
    return typeof String.fromCodePoint !== 'undefined'
        ? isoCode.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397))
        : isoCode;
}

const useStyles = makeStyles({
    option: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        },
    },
});

export default function CountrySelect(props) {
    const classes = useStyles();

    return (
        <Autocomplete
            id="autocomplete-select"
            options={props['data']}
            classes={{
                option: classes.option,
            }}
            autoHighlight
            onChange={(e, option) => props['onChange'](option)}
            getOptionLabel={option => option.label}
            renderOption={option => (
                <React.Fragment>
                    {option.optionDisplay}
                </React.Fragment>
            )}
            renderInput={params => (
                <TextField
                    {...params}
                    label={props['label']}
                    fullWidth
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'disabled', // disable autocomplete and autofill
                    }}
                />
            )}
        />
    );
}