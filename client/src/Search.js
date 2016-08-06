import React  from 'react'
import {Link} from 'react-router'
import {ListMaster, ListDetail} from './ListMasterDetail'
import {AjaxAdapter} from './TinyListView'
import ApplicationContext from './ApplicationContext'

var adapter = new AjaxAdapter({
	method: 'get',
	url: '/api/Search',
	params: {}
});
adapter.setTerm = function(term, shouldNotNotify) {
	if(this.cfg.params.term != term) {
		this.cfg.params.term = term;
		adapter.refresh(shouldNotNotify);
	}
};
adapter.getView = function(position) {
	var item = this.getItem(position);
	var loading = item == null;

	var cont;
	if(!loading) {
		
		var className = "label";
		var urlname;
		if(item.type == "TechnicalDoc") {
			className = "label label-info";
			urlname = 'technical-docs';
		} else if(item.type == "Sample") {
			className = "label label-warning";
			urlname = 'samples';
		} else if(item.type == "Project") {
			var className = "label label-primary";
			urlname = 'projects';
		}

		var links = [];
		if(ApplicationContext.admin) {
			links.push(
				<Link key="edit" to={
					{
						pathname: "/web/search/" + urlname + "/" + item.link + "/edit",
						query: {term: this.cfg.params.term}
					}
				}>
					<span className="label label-success">Edit</span>
				</Link>
			);
		}

		if(item.type == "Sample")
			links.push(
				<a key="view_a" href={"/web/search/" + urlname + "/" + item.link} target="_blank">
					{item.title}
				</a>
			);
		else
			links.push(
				<Link key="view_link"
					to={
						{
							pathname: "/web/search/" + urlname + "/" + item.link,
							query: {term: this.cfg.params.term}
						}
				}>
					{item.title}
				</Link>
			);

		cont = (
			<div>
				<span className={className}>#{position + 1}</span>
				{links}
			</div>
		);

	} else {
		cont = <div></div>;
	}

	return cont;

};

var Search = React.createClass({
	componentWillReceiveProps: function(nextProps) {
		var term = nextProps.location && nextProps.location.query && nextProps.location.query.term;
		adapter.setTerm(term);
	},

	componentWillMount: function() {
		var term = this.props.location && this.props.location.query && this.props.location.query.term;
		adapter.setTerm(term, true);
	},

	render() {
		return (
			<ListMaster adapter={adapter} params={this.props.params}>
				{this.props.children && React.cloneElement(this.props.children, {adapter: adapter})}
			</ListMaster>
		);
	}
});

module.exports = {
	Search: Search,
};