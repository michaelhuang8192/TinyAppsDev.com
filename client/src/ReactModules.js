import React  from 'react'

exports.CMS = React.createClass({
    _status: 0,

	getInitialState() {
        return {};
    },

    componentWillMount() {
		$(window).scrollTop(0);
	},

    load() {
        var _this = this;
        $.get(this.props.link, {}, function(js) {
            _this._status = 2;
            _this.setState({html: js.html});
        });
    },
	
	render() {
        if(this._status == 0) {
            this._status = 1;
            this.load();
        }

        var html;
        if(this._status == 2)
            html = <div dangerouslySetInnerHTML={{__html: this.state.html || ""}}></div>;
        else
            html = <div><img style={{margin: 'auto'}} className="img-responsive" src="/img/loading.gif" /></div>;

    	return (
    	<div className="container miniHeightProtected">
    		{html}
    	</div>
    	);
    }
});


