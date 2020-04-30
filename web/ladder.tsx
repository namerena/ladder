import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {App} from './lib/app';

if(window.location.protocol ==='https:') {
  window.location.replace("http://deepmess.com/zh/namerena/ladder.html");
} else {
  ReactDOM.render(<App />, document.getElementById('app'));
}

