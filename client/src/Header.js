import React  from 'react'
import { Link, browserHistory } from 'react-router'

export default React.createClass({

  _onEnter: function() {
    var term = $.trim(this.refs['searchTerm'].value);
    //console.log(term);
    if(term.length <= 0) return;
    browserHistory.push("/web/search?term=" + encodeURIComponent(term));
  },

  _onKeyUp: function(evt) {
    if(evt.which !== 13) return;
    this._onEnter();
  },

  render() {
    var value = this.props.location && this.props.location.query && this.props.location.query.term;
    //console.log(this.props);
    return (
<nav className="navbar navbar-default" id="navbar">
  <div className="container">
    <div className="navbar-header">
      <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar_menu" aria-expanded="false">
        <span className="sr-only">Toggle navigation</span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
      </button>


      <Link className="navbar-brand" to="/web"><img src="/img/logo.png" alt="TinyAppsDev" /></Link>

      <div id="searchbox">
        <div className="input-group">
          <input ref="searchTerm" defaultValue={value} type="text" className="form-control" placeholder="search.." onKeyUp={this._onKeyUp} />
          <div className="input-group-btn" onClick={this._onEnter}>
            <button type="button" className="btn btn-default">
              <span className="glyphicon glyphicon-search"></span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <div className="collapse navbar-collapse" id="navbar_menu">
      <ul className="nav navbar-nav">
        <li><Link activeClassName="active" to="/web/projects" data-toggle="collapse" data-target="#navbar_menu.in">My Projects</Link></li>
        <li><Link activeClassName="active" to="/web/technical-docs" data-toggle="collapse" data-target="#navbar_menu.in">Technical Docs</Link></li>
        <li><Link activeClassName="active" to="/web/samples" data-toggle="collapse" data-target="#navbar_menu.in">Samples</Link></li>
        <li><Link activeClassName="active" to="/web/about-me" data-toggle="collapse" data-target="#navbar_menu.in">About Me</Link></li>
      </ul>
    </div>
  </div>
</nav>
)
  }

});