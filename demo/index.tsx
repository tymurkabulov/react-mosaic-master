import React from 'react';
import ReactDOM from 'react-dom';
import {ExampleApp} from "./ExampleApp";
import './tailwind.css'



const APP_ELEMENT = document.getElementById('app')!;
const render = (Component: React.ComponentClass<any>) => {
  ReactDOM.render(<Component />, APP_ELEMENT);
};

render(ExampleApp);
