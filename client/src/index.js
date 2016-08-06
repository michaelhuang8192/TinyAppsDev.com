
import React  from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, browserHistory, IndexRoute, Redirect } from 'react-router'
import App from './App'
import About from './About'
import Home from './Home'
import {Search} from './Search'
import {Samples, Sample, SampleEdit} from './Samples'
import {Projects, Project, ProjectEdit} from './Projects'
import {TechnicalDocs, TechnicalDoc, TechnicalDocEdit} from './TechnicalDocs'


$(function() {


ReactDOM.render((
<Router history={browserHistory}>
  <Route path="/web" component={App}>
    <IndexRoute component={Home}/>
    <Route path="about-me" component={About}/>
    <Route path="samples" component={Samples}>
      <Route path=":id" component={Sample}/>
      <Route path=":id/edit" component={SampleEdit}/>
    </Route>
    <Route path="projects" component={Projects}>
      <Route path=":id" component={Project}/>
      <Route path=":id/edit" component={ProjectEdit}/>
    </Route>
    <Route path="technical-docs" component={TechnicalDocs}>
      <Route path=":id" component={TechnicalDoc}/>
      <Route path=":id/edit" component={TechnicalDocEdit}/>
    </Route>
    <Route path="search" component={Search}>
      <Route path="projects/:id" component={Project}/>
      <Route path="projects/:id/edit" component={ProjectEdit}/>
      <Route path="technical-docs/:id" component={TechnicalDoc}/>
      <Route path="technical-docs/:id/edit" component={TechnicalDocEdit}/>
      <Route path="samples/:id" component={Sample}/>
      <Route path="samples/:id/edit" component={SampleEdit}/>
    </Route>
  </Route>
  <Redirect from="/" to="/web" />
</Router>

), document.getElementById('app'));



});