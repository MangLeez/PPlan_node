nn = require('nearest-neighbor');

var items = [
     { name: 'Bill', age: 10, pc: 'Mac', ip: '68.23.13.8' },
     { name: 'Alice', age: 22, pc: 'Windows', ip: '193.186.11.3' },
     { name: 'Bob', age: 12, pc: 'Windows', ip: '56.89.22.1' },
];

var query = { name: 'Bob', age: 12, pc: 'Windows', ip: '68.23.13.10' };

var fields = [
     { name: 'name', measure: nn.comparisonMethods.word },
     { name: 'age', measure: nn.comparisonMethods.number, max: 100 },
     { name: 'pc', measure: nn.comparisonMethods.word },
     { name: 'ip', measure: nn.comparisonMethods.ip },
];

nn.findMostSimilar(query, items, fields, function (x) {
     console.log(x);
});
