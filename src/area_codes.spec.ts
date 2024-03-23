import { test, expect } from 'bun:test';
import {
  areaCodesByNonGeo,
  areaCodesInService,
  areaCodesByGeo,
} from './area_codes';

test('areaCodes', () => {
  expect(areaCodesInService).toBeArray();
  expect(areaCodesInService).not.toBeEmpty();
});

test('equal', () => {
  expect(areaCodesInService).toStrictEqual(
    expect.arrayContaining([...areaCodesByGeo, ...areaCodesByNonGeo]),
  );
});
