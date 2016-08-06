import React  from 'react'
import ReactDOM from 'react-dom'
import {ListView, ArrayAdapter} from '../../../src/TinyListView'


var adapter = new ArrayAdapter();

adapter.getCount = function() {
	return 99999;
}

adapter.getItem = function(position) {
	return {id: position, name: "Row #" + position};
};

adapter.getView = function(position) {
	if(position < 0 || position >= this.getCount()) {
		return <div></div>;
	} else {
		var item = this.getItem(position);

		return (
			<div>
				<div>{item.id}</div><div>{item.name}</div>
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
		return <div ref="header"><div>ID</div><div>Name</div></div>;
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

