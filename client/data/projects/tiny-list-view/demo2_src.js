import React  from 'react'
import ReactDOM from 'react-dom'
import {ListView, AjaxAdapter} from '../../../src/TinyListView'


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
				<div></div>
			</div>
		);
	} else {
		return (
			<div>
				<div><img src={item.imageSrc} alt="" /></div>
				<div>{item.cate}</div>
				<div>{item.name}</div>
			</div>
		);
	}

};

adapter.getViewHeader = function() {
	return <DemoListViewHeader />;
};

adapter.getViewFooter = function() {
	return <DemoListViewFooter />;
};


var DemoListViewHeader = React.createClass({

	isScrollable() {
		return true;
	},

	render() {
		return <div ref="header"><div>IMG</div><div>Category</div><div>Name</div></div>;
	}

});

var DemoListViewFooter = React.createClass({

	_change() {
		this.forceUpdate();
	},

	render() {
		return <div className="text-center">Total: {this.props.adapter.getCount()}</div>;
	},

	componentDidMount() {
		this.props.adapter.registerDataSetObserver(this._change);
	},

	componentWillUnmount() {
		this.props.adapter.unregisterDataSetObserver(this._change);

	}

});


var DemoListView = React.createClass({

	render() {
		return <ListView adapter={adapter} />;
	}

});

$(function() {
	
ReactDOM.render(
	<DemoListView />,
	document.getElementById('app')
);

});

