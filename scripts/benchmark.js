import { areaCodesInService } from '../dist/esm/area_codes.js';
import pkg from 'benchmark';

const { Benchmark } = pkg;
const suite = new Benchmark.Suite();

// add tests
suite
  .add('areaCode check for 734', function () {
    const result = areaCodesInService.indexOf('734');
  })
  .add('areaCode check for 205', function () {
    const result = areaCodesInService.indexOf('205');
  })
  .add('areaCode check for 999', function () {
    const result = areaCodesInService.indexOf('999');
  })

  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  // run async
  .run({ async: true });
