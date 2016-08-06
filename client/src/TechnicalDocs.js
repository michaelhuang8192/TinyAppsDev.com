import React  from 'react'
import {Link, browserHistory} from 'react-router'
import {ListMaster, ListDetail} from './ListMasterDetail'
import {AjaxAdapter} from './TinyListView'
import ApplicationContext from './ApplicationContext'
import {parentLink, editLink} from "./Utils"

var adapter = new AjaxAdapter({
	method: 'get',
	url: '/api/TechnicalDocs/getPage',
	params: {}
});
adapter.getView = function(position) {
	var item = this.getItem(position);
	var loading = item == null;

	var cont;
	if(!loading) {
		
		var edit;
		if(ApplicationContext.admin) {
			edit = (
				<Link key="edit" to={"/web/technical-docs/" + item.link + "/edit"}>
					<span className="label label-success">Edit</span>
				</Link>
			);
		}

		cont = (
			<div>
				<span className="label label-info">#{position + 1}</span>
				{edit}
				<Link key="view" to={"/web/technical-docs/" + item.link}>
					{item.title}
				</Link>
			</div>
		);

	} else {
		cont = <div></div>;
	}

	return cont;
};

function getDetailAjax(id) {
	return $.get('/api/TechnicalDocs/getItem', {id: id}, null, 'json');
}

var Form = React.createClass({
	componentWillMount: function() {
		this.setState(this.props.doc || {});
	},

	handleChange(evt) {
		var ns = {};
		ns[ evt.target.getAttribute('data-pname') ] = evt.target.value;
		this.setState(ns);
	},

	handleChangeLink(evt) {
		this.setState({link: evt.target.value.toLowerCase().replace(/[^a-z]+/gi, '-')});
	},

	onSave() {
		var adapter = this.props.adapter;
		var link = this.state.link;
		if($.trim(link.toLowerCase()) == 'new') return;

		if(this.state._id) {
			$.post("/api/Admin/update/TechnicalDoc", {js: JSON.stringify(this.state)}, function(r) {
				if(r.ok) {
					adapter.refresh();
				}
			});

		} else {
			$.post("/api/Admin/new/TechnicalDoc", {js: JSON.stringify(this.state)}, function(r) {
				if(r.id) {
					adapter.refresh();
					browserHistory.push('/web/technical-docs/' + link);
				}
			});
		}
	},

	onDelete() {
		if(!confirm("delete?")) return;

		var adapter = this.props.adapter;
		$.post("/api/Admin/delete/TechnicalDoc", {js: JSON.stringify({_id: this.state._id})}, function(r) {
			if(r.ok) {
				adapter.refresh();
				browserHistory.push( parentLink() );
			}
		});

	},

	render() {
		return (
			<form>
				<fieldset className="form-group form-group-lg">
					<label>Link</label>
					<input type="text" className="form-control" data-pname="link" value={this.state.link||""} onChange={this.handleChangeLink} />
				</fieldset>
				<fieldset className="form-group form-group-lg">
					<label>Title</label>
					<input type="text" className="form-control" data-pname="title" value={this.state.title||""} onChange={this.handleChange} />
				</fieldset>
				<fieldset className="form-group form-group-lg">
					<label>Keywords</label>
					<input type="text" className="form-control" data-pname="keywords" value={this.state.keywords||""} onChange={this.handleChange} />
				</fieldset>
				<fieldset className="form-group form-group-lg">
					<label>HTML</label>
					<textarea style={{height:"300px"}} className="form-control" data-pname="html" value={this.state.html||""} onChange={this.handleChange} />
				</fieldset>

				<div className="btn-group btn-group-justified btn-group-lg" role="group">
					<a className="btn btn-default btn-danger" role="button" onClick={this.onDelete}>delete</a>
					<a className="btn btn-default btn-success" role="button" onClick={this.onSave}>save</a>
				</div>
				<br />

			</form>
		);
	}
});

function renderEdit(ctx) {
	var state = ctx.state;
	var params = ctx.props.params;

	var form;
	if(state.doc && state.doc._id !== undefined) {
		form = (<Form doc={state.doc} adapter={ctx.props.adapter} />);
	}

	return (
		<div className="container">
			<h3 className="text-center">
				{state.doc ? state.doc.title : 'Loading...'}
			</h3>
			{form}
		</div>
	);
}

function renderView(ctx) {
	var state = ctx.state;
	var params = ctx.props.params;
	var visible = ApplicationContext.admin ? 'block' : 'none';

	return (
		<div className="container">
			<div className="container clearfix" style={{display: visible, marginBottom: "10px"}}>
				<Link className="btn btn-default pull-right" to={editLink()}>Edit</Link>
			</div>
			<h3 className="text-center">
				{state.doc ? state.doc.title : 'Loading...'}
			</h3>
			<div key="view" dangerouslySetInnerHTML={{__html: state.doc && state.doc.html}}></div>
		</div>
	);
}

var TechnicalDocEdit = React.createClass({
	render() {
		return <ListDetail
			params={this.props.params}
			getDetailAjax={getDetailAjax}
			renderDetail={renderEdit}
			adapter={this.props.adapter}
			/>;
	}
});

var TechnicalDoc = React.createClass({
	render() {
		return <ListDetail
			params={this.props.params}
			getDetailAjax={getDetailAjax}
			renderDetail={renderView}
			/>;
	}
});

var TechnicalDocs = React.createClass({

	render() {
		var header;

		var visible = ApplicationContext.admin ? 'block' : 'none';
		header = (
			<div className="container clearfix" style={{display: visible, marginBottom: "10px"}}>
				<Link className="btn btn-default pull-right" to="/web/technical-docs/NEW/edit">Add New</Link>
			</div>
		);

		return (
			<ListMaster adapter={adapter} params={this.props.params} header={header}>
				{this.props.children && React.cloneElement(this.props.children, {adapter: adapter})}
			</ListMaster>
		);
	}
});

module.exports = {
	TechnicalDocs: TechnicalDocs,
	TechnicalDoc: TechnicalDoc,
	TechnicalDocEdit: TechnicalDocEdit
};

