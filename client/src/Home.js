import React  from 'react'
import { Link } from 'react-router'


export default React.createClass({
	componentWillMount: function() {
		$(window).scrollTop(0);
	},
	
	render: function() {
    	return (
    		<div className="container">
    			<h1 className="text-center">Coming Soon</h1>
    		</div>
    	);
    }
})
