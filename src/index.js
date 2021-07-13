function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}
//this creates a VDOM
//this will return children as an array, Elements in children array
//can also be primitive stuff like strings in which case we will have to turn it into text object

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function commitWork(fiber){
  if(!fiber)return;
      
  const domParent=fiber.parent.dom;
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)  
}

function commitRoot(){
  //this is where the final render to the DOM happens      
  commitWork(wipRoot.child);
  wipRoot=null;
}

function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = key => key !== "children";

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  //this copies properties from VDOM to DOM except children as we are appending child seperately in recursive manner
  return dom;
}

let nextWork = null;
let wipRoot = null;

//render function
//we need to incorporate concurrency as rendering can take time otherwise
function render(element, container) {
  //this turns my VDOM into DOM usinf fibers
  //set root node for fiber tree (work in progress root)
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  }
  nextWork = wipRoot;
}

function workingLoop(deadline) {
  let isYield = false;
  while (nextWork && !isYield) {
    nextWork = peformUnitWork(nextWork);
    isYield = deadline.timeRemaining() < 1;
    //timeRemaining is used to see how much time is left till next work
  }
  if(!nextWork && wipRoot){
    commitRoot();
  }
  requestIdleCallback(workingLoop);
  //requestIdleCallback is like setTimeout but browser runs it automatically when
  //the main thread is idle
}

requestIdleCallback(workingLoop);

function peformUnitWork(fiber) {  
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
    //creation for root node
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    //create a fiber for each child
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };    
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
  //now we need to return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  //if sibling then return sibling else return
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }  
}

//Library
const Treact = {
  createElement,
  render,
};

//We need to tell Babel to use my function

/** @jsx Treact.createElement */
const element = (
  <div id="foo">
    <h1>Hi from TreactJS</h1>
    <b />
    <h1>Made by Hiten</h1>
  </div>
);
//this "element" is like saying <App/> from react
//this makes element into my virtual dom. We creat VDOM so that ppl dont have to
//type code like the render function

const container = document.getElementById("root");

//Now we need the render function
Treact.render(element, container);
//Like we do in reactJS project



//-------------------------------------------------------------------------------------------------------\\
//Code below is the normal code like original stuff
// const element = {
//   type:"h1",
//   props:{
//     title:"foo",
//     children: "Hello",
//   },
// }

// const node=document.createElement(element.type);
// node["title"]=element.props.title;

// const text=document.createTextNode("");
// text["nodeValue"]=element.props.children;

// node.appendChild(text);

// container.appendChild(node);
