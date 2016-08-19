import { Link } from 'react-router'
import React  from 'react'
import {CMS}  from './ReactModules'

export default React.createClass({
    componentWillMount: function() {
		$(window).scrollTop(0);
	},

	render: function() {
    	return (
            <CMS link="/api/Docs/getCmsItem?link=about-me" />
    	);
    }
})