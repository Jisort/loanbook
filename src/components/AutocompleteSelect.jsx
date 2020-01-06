/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';

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
            options={props['data']}
            classes={{
                option: classes.option,
            }}
            autoHighlight
            onChange={(e, option) => props['onChange'](option || {})}
            defaultValue={props['defaultValue']}
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