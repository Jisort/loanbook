import React from 'react'
import SocialLogin from 'react-social-login';
import {Fab} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import Icon from '@mdi/react';

function SocialButton(props) {

    const {children, triggerLogin} = props;
    const childProps = { ...props };
    delete childProps.triggerLogin;

    const useStyles = makeStyles(theme => ({
        root: {
            '& > *': {
                margin: theme.spacing(1),
            },
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
    }));

    const classes = useStyles();
    const ButtonIcon = props['icon'];

    return (
        <div>
            <Fab variant="extended" style={props['styles']}
                 onClick={triggerLogin} {...childProps}
            >
                <Icon path={ButtonIcon}
                      size={1.1}
                      className={classes.extendedIcon}
                      color={props['iconcolor']}
                />
                {children}
            </Fab>
        </div>
    );
}

export default SocialLogin(SocialButton);
