import React, { useState } from 'react';
import MomentUtils from '@date-io/moment';
import {
    DatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';

export default function App(props) {
    const [selectedDate, handleDateChange] = useState(new Date());

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
                onChange={handleDateChange}
                maxDate={props['maxDate']}
                value={props['value']}
                format={props['format']}
                label={props['label']}
                fullWidth={props['fullWidth']}
            />
        </MuiPickersUtilsProvider>
    );
}