const areacodesobj = require('../dist/area_codes_obj')
const areacodes = require('../dist/area_codes')

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite;

// add tests
suite
.add('areacodesobj 734', function() {
    const boom = areacodesobj.areaCodesInServiceObj.find(x => x.npa === '734');
})
.add('areacodesobj 205', function() {
    const boom = areacodesobj.areaCodesInServiceObj.find(x => x.npa === '205');
})
.add('areacodesobj 999', function() {
    const boom = areacodesobj.areaCodesInServiceObj.find(x => x.npa === '999');
})

.add('areacodes 734', function() {
    const boom = areacodes.areaCodesInService.indexOf('734');
  })
.add('areacodes 205', function() {
    const boom = areacodes.areaCodesInService.indexOf('205');
})
.add('areacodes 999', function() {
    const boom = areacodes.areaCodesInService.indexOf('999');
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

// logs:
// => RegExp#test x 4,161,532 +-0.99% (59 cycles)
// => String#indexOf x 6,139,623 +-1.00% (131 cycles)
// => Fastest is String#indexOf