import React  from 'react'
import ReactDOM from 'react-dom'
import {AjaxAdapter, ListView} from './TinyListView'

var Editor = React.createClass({
	_editor: null,
	_req: null,
	_status: 0,

	getInitialState() {
		return {doc: {}, _id: 0};
	},

	componentWillReceiveProps(nextProps) {
		this.setState({_id: nextProps._id});
	},

	componentWillMount() {
		this.setState({_id: this.props._id});
	},

	setId(_id) {
		if(!_id || _id != this.state._id) {
			this.setState({_id: _id, doc: {}});
		}
	},

	shouldComponentUpdate(nextProps, nextState) {
		if(nextState._id != this.state._id) {
			if(this._req != null) {
				this._req.abort();
				this._req = null;
			}
			nextState.doc = {};
			this._status = 0;
		}

		return true;
	},

	handleChange(evt) {
		var doc = this.state.doc;
		doc[ evt.target.getAttribute('data-pname') ] = evt.target.value;
	},

	handleChangeLink(evt) {
		var doc = this.state.doc;
		doc.link = evt.target.value.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
		this.setState({doc: doc});
	},

	getHtml() {
		return this._editor.markdown(this.state.doc.text || '');
	},

	loadItem(_id) {
		var _this = this;
		var req = this._req = $.get('/api/Docs/getCmsItemById', {_id: _id}, null, 'json')
		.always(function(data) {
			_this._req = null;
			if(data === req) {
				_this._status = -1;
				_this.setState({doc: {}});
			}
			else {
				_this._status = 2;
				_this.setState({doc: data});
			}
		});
	},

	render() {
		var doc = this.state.doc;

		if(this.state._id && this._status == 0) {
			this._status =1;
			this.loadItem(this.state._id);
		}

		return (
			<div>
				<div className="alert alert-info" role="alert">ID: {this.state._id}</div>
				<p><input type="text" placeholder="link" className="form-control" data-pname="link" value={doc.link||""} onChange={this.handleChangeLink} /></p>
				<p><textarea ref="text" className="form-control"></textarea></p>
			</div>
		);
	},

	componentDidMount() {
		this._editor = new SimpleMDE({
			element: this.refs['text']
		});
		var this_ = this;
		this._editor.codemirror.on("change", function() {
			var doc = this_.state.doc;
			doc.text = this_._editor.value();
		});
	},

	componentDidUpdate() {
		var doc = this.state.doc;
		if(doc.text != this._editor.value())
			this._editor.value(doc.text || "");
	}

});

function getView(position) {
	var item = this.getItem(position);

	if(item == null) return <div></div>;

	return (
		<div onClick={this.app.onItemClick.bind(this.app, item._id)}>{item.link}</div>
	);

};

function getViewHeader() {
	return <div ref="header"><div>CMS</div></div>;
};

function getViewFooter() {
	return <Footer />;
};

var Footer = React.createClass({
	_change() {
		this.forceUpdate();
	},

	render() {
		return <div ref="footer"><div>Total: {this.props.adapter.getCount()}</div></div>;
	},

	componentDidMount() {
		this.props.adapter.registerDataSetObserver(this._change);
	},

	componentWillUnmount() {
		this.props.adapter.unregisterDataSetObserver(this._change);
	}
});

var App = React.createClass({
	_adapter: null,
	_curItemId: 0,

	getInitialState() {
		return {};
	},

	onItemClick(_id) {
		this._curItemId = _id;
		this.refs['editor'].setId(_id);
	},

	componentWillMount() {
		this._adapter = new AjaxAdapter({
			url: '/api/Docs/getCmsPage'
		});
		this._adapter.getView = getView;
		this._adapter.getViewHeader = getViewHeader;
		this._adapter.getViewFooter = getViewFooter;
		this._adapter.app = this;
	},

	newItem() {
		this.onItemClick(0);
	},

	deleteItem() {
		if(!confirm("delete?")) return;

		var _this = this;
		$.post("/api/Admin/delete/CMS", {js: JSON.stringify({_id: this._curItemId})}, function(r) {
			if(r.ok) {
				_this._adapter.refresh();
				_this.newItem();
			}
		});

	},

	saveItem() {
		var editor = this.refs['editor'];
		if(editor.state.doc.link == '') return;

		var data = $.extend({}, editor.state.doc);
		data.html = editor.getHtml() || '';
		data._id = editor.state._id;

		var _this = this;
		if(data._id) {
			$.post("/api/Admin/update/CMS", {js: JSON.stringify(data)}, function(r) {
				if(r.ok)
					_this._adapter.refresh();
			});

		} else {
			$.post("/api/Admin/new/CMS", {js: JSON.stringify(data)}, function(r) {
				if(r.id) {
					_this._adapter.refresh();
					_this.onItemClick(r.id);
				}
			});
		}
	},

	render() {
		return (
		<div id="mainCont" className="fluid-container">
			<ListView adapter={this._adapter} />
			<div className="btn-group-lg">
				<button type="button" className="btn btn-default" onClick={this.newItem}>New</button>
				&nbsp;
				<button type="button" className="btn btn-success" onClick={this.saveItem}>Save</button>
				<button type="button" className="btn btn-danger pull-right" onClick={this.deleteItem}>Delete</button>
			</div>
			<Editor ref="editor" _id={this._curItemId} />
		</div>
		);
	}

});

$(function() {

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

});