import React  from 'react'
import { Link } from 'react-router'


export default React.createClass({
    _first: true,
    _history: [],
    _curPosition: 0,

    getInitialState() {
        return {statement: ''};
    },

	componentWillMount() {
		$(window).scrollTop(0);
	},
	
    evalJS(js) {
        var contentWindow = this.refs['consoleWnd'].contentWindow;
        if(contentWindow && contentWindow.evalJS) {
            contentWindow.evalJS(js);
        }
    },

    handleChange(evt) {
        this.setState({statement: evt.target.value});
    },

    onKeyUp(evt) {
        if(evt.key == 'ArrowUp') {
            var nextPos = this._curPosition - 1;
            if(nextPos >= 0 && nextPos < this._history.length) {
                this._curPosition = nextPos;
                this.setState({statement: this._history[nextPos]});
            }
            return;
        } else if(evt.key == 'ArrowDown') {
            var nextPos = this._curPosition + 1;
            if(nextPos >= 0 && nextPos <= this._history.length) {
                this._curPosition = nextPos;
                this.setState({statement: this._history[nextPos] || ''});
            }
            return;
        }

        if(evt.key != 'Enter') return;
        var val = $.trim(evt.target.value);
        if(!val) return;

        if(!this._history.length || this._history[this._history.length - 1] != val) {
            this._history.push(val);
            if(this._history.length > 20)
                this._history.shift();
        }
        this._curPosition = this._history.length;

        this._first = false;
        this.evalJS(val);
        this.setState({statement: ''});
    },

	render() {
    	return (
            <div id="console" style={{backgroundColor: "#fff"}}>
                <div className="container">
                    <div><iframe ref="consoleWnd" src="/helper/console.html" className="consoleWnd"></iframe></div>
                    <div className="input-group input-group-lg">
                        <span className="input-group-addon" style={{backgroundColor: '#5cb85c', color: '#fff'}}>&gt;</span>
                        <input type="text" onKeyUp={this.onKeyUp} value={this.state.statement||""} onChange={this.handleChange} className="form-control" spellcheck="false" placeholder={this._first ? "I'm MR.JS. How Can I help You?" : ""} />
                    </div>
                </div>
            </div>
        );
    }

})
