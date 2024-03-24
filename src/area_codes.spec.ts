import {
  areaCodesByNonGeo,
  areaCodesInService,
  areaCodesByGeo,
} from './area_codes';

describe('area codes', () => {
  it('should be an array', () => {
    expect(areaCodesInService).toEqual(expect.any(Array));
  });

  it('should not be empty', () => {
    expect(areaCodesInService.length).toBeGreaterThan(0);
  });

  it('should equal geo and non geo arrays', () => {
    expect(areaCodesInService).toStrictEqual(
      expect.arrayContaining([...areaCodesByGeo, ...areaCodesByNonGeo]),
    );
  });
});
