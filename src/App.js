import React from 'react';
import Menu from "./Menu";
import Home from "./Home";
import ViewLoans from "./loan/ViewLoans";
import FormLogin from "./user/FormLogin";
import FormSignUp from "./user/FormSignUp";
import Settings from "./admin/Settings";
import CustomReports from "./reports/CustomReports";
import {Route, Switch, MemoryRouter} from 'react-router-dom';
import './App.css';

function App() {
    return (
        <MemoryRouter>
            <Switch>
                <Route exact path="/signUp" component={FormSignUp} key={1}/>
                <Route exact path="/login" component={FormLogin} key={2}/>
                <Menu key={3}>
                    <Switch>
                        <Route exact path="/" component={Home} key={3.1}/>
                        <Route exact path="/viewLoans" component={ViewLoans} key={3.2}/>
                        <Route exact path="/settings" component={Settings} key={3.3}/>
                        <Route exact path="/customReports" component={CustomReports} key={3.4}/>
                    </Switch>
                </Menu>
            </Switch>
        </MemoryRouter>
    );
}

export default App;
