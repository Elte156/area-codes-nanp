const areaCodes = require('../dist/area_codes')

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;

// add tests
suite
.add('areaCode check for 734', function() {
    const result = areaCodes.areaCodesInService.indexOf('734');
  })
.add('areaCode check for 205', function() {
    const result = areaCodes.areaCodesInService.indexOf('205');
})
.add('areaCode check for 999', function() {
    const result = areaCodes.areaCodesInService.indexOf('999');
})

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });