var React = require('react');
var ReactDOM = require('react-dom');

class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (<div>Hola mundo</div>);
  }

}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

