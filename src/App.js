import React from 'react';
import FormLogin from "./user/FormLogin";
import Menu from "./Menu";
import Home from "./Home";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';

function App() {
    return (
        <Router>
            <Switch>
                <Route exact path="/login" component={FormLogin} key={2}/>
                <Menu>
                    <Switch>
                        <Route exact path="/" component={Home} key={3.1}/>
                    </Switch>
                </Menu>
            </Switch>
        </Router>
    );
}

export default App;
