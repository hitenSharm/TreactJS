//-------------------------------------------------------------------------------------------------------\\
//Code below is the normal code like original stuff(can be executed even in simple html js no bable needed)
const element = {
  type:"h1",
  props:{
    title:"foo",
    children: "Hello",
  },
}

const node=document.createElement(element.type);
node["title"]=element.props.title;

const text=document.createTextNode("");
text["nodeValue"]=element.props.children;

node.appendChild(text);

container.appendChild(node);