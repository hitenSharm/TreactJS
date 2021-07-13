import "./index.css"
import Treact from "./Treact/treact";
import App from "./app";

//We need to tell Babel to use my function
/** @jsx Treact.createElement */

const element = (
  <div className="hello">
    {App}
  </div>
);
//this "element" is like saying <App/> from react
//this makes element into my virtual dom. We creat VDOM so that ppl dont have to
//type code like the render function

const container = document.getElementById("root");

//Now we need the render function
Treact.render(element, container);
//Like we do in reactJS project

