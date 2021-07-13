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
  let wipRoot = null; //work in progress root
  
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
  
  export default Treact;