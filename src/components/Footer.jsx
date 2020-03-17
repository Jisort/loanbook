import React, {Component} from 'react';
import StoreImage from "../media/English_get-it-from-MS.png";
import {Box} from "@material-ui/core";

export default class Footer extends Component {
    render() {
        let store_badge_style = {
            width: 182,
            height: 56
        }
        return (
            <Box display="flex" justifyContent="center">
                <a href='//www.microsoft.com/store/apps/9NN0MFWJ5FL5?cid=storebadge&ocid=badge'><img
                    src={StoreImage}
                    alt='English badge'
                    style={store_badge_style}/></a>
                <a href="https://snapcraft.io/loanbook">
                    <img alt="Get it from the Snap Store"
                         src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg"/>
                </a>
            </Box>
        )
    }
}
