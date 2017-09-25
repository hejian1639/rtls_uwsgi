
import React from 'react'
import ReactDOM from 'react-dom'

import { useBasename } from 'history'

import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import $ from 'jquery'



function withExampleBasename(history, dirname) {
    return useBasename(() => history)({ basename: dirname });
}



// import Home from 'home'


ReactDOM.render((
    <Router history={withExampleBasename(browserHistory, '/')}>
        {/*<Route path="/" component={props => < Home {...props} subtitle='Rect Router' />} />*/}
        <Route path="/" getComponent={(nextState, cb) => {
            window.require(['dist/dashboard'], (Dashboard) => {
                cb(null, Dashboard.default);
            });
        }} />

    </Router>
), document.getElementById('root'), function () {

});


