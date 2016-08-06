import React  from 'react'
import { formatPattern, Link } from 'react-router'
import jsCookie from 'js-cookie'

import Header from './Header'
import {Footer} from './Footer'
import ApplicationContext from './ApplicationContext'


var Login = React.createClass({
	_checkLoginTimeout: null,

	clearCookie() {
		jsCookie.remove('admin');
		jsCookie.remove('admin_auth');
	},

	clear() {
		this.clearCookie();
		this.refs['passwd'].value = "";
		$(this.refs['login']).modal('hide');

		this.checkLogin();
	},

	login() {
		var _this = this;
		var hxq = $.post('/api/Admin/login', {passwd: this.refs['passwd'].value}, null, 'json');
		hxq.always(function(data) {
			var login = $(_this.refs['login']);
			if(hxq === data || !data || !data.isLogin) {
				_this.refs['passwd'].value = "";
				login.modal('show');
			} else {
				_this.refs['passwd'].value = "";
				login.modal('hide');
			}
		});
	},

	checkLogin() {
		if(this._checkLoginTimeout !== null) {
			clearTimeout(this._checkLoginTimeout);
			this._checkLoginTimeout = null;
		}

		this._checkLogin();
	},

	_checkLogin() {
		this._checkLoginTimeout = null;

		var admin = parseInt(jsCookie.get('admin')) || 0;
		if(admin != ApplicationContext.admin) {
			location.href = location.pathname;
			return;
		}

		if(ApplicationContext.admin) {
			var _this = this;
			var hxq = $.get('/api/Admin/isLogin', {}, null, 'json');
			hxq.always(function(data) {
				var login = $(_this.refs['login']);
				if(hxq !== data) {
					if(!data || !data.isLogin) {
						if(!login.hasClass('in')) {
							_this.refs['passwd'].value = "";
							login.modal('show');
						}
					} else {
						_this.refs['passwd'].value = "";
						login.modal('hide');
					}
				}

				_this._checkLoginTimeout = setTimeout(_this._checkLogin, 10000);
			});

		}
	},

	componentWillMount() {
		var loc = this.props.location;
		if(loc.query.admin !== undefined) {
			var admin = parseInt(loc.query.admin) || 0;
			if(admin) {
				jsCookie.set('admin', 1);
			} else {
				this.clearCookie();
			}
		}

		ApplicationContext.admin = parseInt(jsCookie.get('admin')) || 0;
	},

	render() {
		return (
			<div ref="login" data-backdrop="static" className="modal fade" tabindex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 className="modal-title" id="myModalLabel">Admin - Log In</h4>
						</div>
						<div className="modal-body">
							<input ref="passwd" type="password" className="form-control" placeholder="Password" />
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-danger" onClick={this.clear}>Clear</button>
							<button type="button" className="btn btn-primary" onClick={this.login}>Log In</button>
						</div>
					</div>
				</div>
			</div>
		);
	},

	componentDidMount() {
		this.checkLogin();
	},

	componentWillUnmount() {
		if(this._checkLoginTimeout !== null) {
			clearTimeout(this._checkLoginTimeout);
			this._checkLoginTimeout = null;
		}

	}

});




var App = React.createClass({

	breadcrumb() {
		var lis = [];
		var routes = this.props.routes;
		var params = this.props.params;

		var path = "";
		for(var i = 0; i < this.props.routes.length - 1; i++) {
			if(routes[i].path === undefined) continue;
			if(path.length > 0 && path[path.length - 1] !== '/') path += '/';
			path += formatPattern(routes[i].path, params);
			lis.push(<li key={i}><Link to={path}>{routes[i].component.title}</Link></li>);
		}

		return <ol id="breadcrumb" className="breadcrumb container">{lis}</ol>
	},

	render() {
		return (
			<div>
				<Login location={this.props.location} />
				<div id="header">
					<Header location={this.props.location} />
				</div>
				<div id="app_body">{this.props.children}</div>
				<div id="footer">
					<Footer />
				</div>
			</div>
		)
	}

});
App.title = "Home"

export default App;
