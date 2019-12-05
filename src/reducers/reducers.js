import { combineReducers } from 'redux'
import {
    SELECT_API_ENDPOINT,
    INVALIDATE_DATA,
    REQUEST_DATA,
    RECEIVE_DATA
} from '../actions/actions'

function sessionVariables(state = {}, action) {
    switch (action.type) {
        case SELECT_API_ENDPOINT:
            return Object.assign({}, state, {
                [action.var_name]: action.var_value
            });
        default:
            return state
    }
}

function urlData(
    state = {
        isFetching: false,
        didInvalidate: false,
        items: []
    },
    action
) {
    switch (action.type) {
        case INVALIDATE_DATA:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case REQUEST_DATA:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case RECEIVE_DATA:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.items,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}

function dataByUrl(state = {}, action) {
    switch (action.type) {
        case INVALIDATE_DATA:
        case RECEIVE_DATA:
        case REQUEST_DATA:
            return Object.assign({}, state, {
                [action.endpoint]: urlData(state[action.endpoint], action)
            });
        default:
            return state
    }
}

const rootReducer = combineReducers({
    dataByUrl: dataByUrl,
    sessionVariables
});

export default rootReducer