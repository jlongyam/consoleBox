if(location.protocol === 'https') {
  let link_0 = document.querySelector('link');
  console.log(location.origin);
}

let container = document.querySelector('#container');

console.dirxml(container);
console.dir({
  one: "ONE",
  two: {
    a: "A",
    b: "B"
  },
  three: [1,3,5]
});
