import React  from 'react'
import ReactDOM from 'react-dom'
import {ListViewBody, AjaxAdapter} from '../../../src/TinyListView'


var adapter = new AjaxAdapter({
	url: '/api/Samples/getAFDEmo'
});


adapter.getView = function(position) {
	var item = this.getItem(position);

	if(item == null) {
		return (
			<div>
				<div><img src="loading.gif" alt="" /></div>
				<div></div>
			</div>
		);
	} else {
		return (
			<div>
				<div><img src={item.imageSrc} alt="" /></div>
				<div>{item.name}</div>
			</div>
		);
	}

};

var DemoListView = React.createClass({

	_onScroll: function() {
		this.refs['listViewBody']._onScroll();
	},

	_onResize: function() {
		this.refs['listViewBody']._onResize();
	},

	render: function() {
		return (
				<ListViewBody
					ref="listViewBody"
					adapter={adapter}
					/>
		);
	},

	componentDidMount: function() {
		$(window).on('scroll', this._onScroll).on('resize', this._onResize);
		this.refs['listViewBody'].parentDidMount(window);
	},

	componentWillUnmount: function() {
		$(window).off('scroll', this._onScroll).off('resize', this._onResize);
		this.refs['listViewBody'].parentWillUnmount();
	}

});

$(function() {
	
ReactDOM.render(
	<DemoListView />,
	document.getElementById('app')
);

});

