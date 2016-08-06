import { Link } from 'react-router'
import React  from 'react'

export default React.createClass({
	componentWillMount: function() {
		$(window).scrollTop(0);
	},
	
	render: function() {
    	return <div>About</div>
    }
})