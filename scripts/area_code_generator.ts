import * as fs from 'fs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

interface CSVRow {
  [key: string]: string;
}

/**
 * Fetch up-to-date area codes from nationalnanpa.com
 *
 * Expected CSV format:
 *  File Date,03/28/2024
 *  NPA_ID, ..., USE, ..., IN_SERVICE, ..., DIALING_PLAN_NOTES
 *  Record 1
 *  Record 2
 *  etc
 *
 * Valuable columns:
 *  NPA_ID: Area code
 *  USE: N - Non-Geographic, G - Geographic
 *  IN_SERVICE: Y - In service, N - Not in service
 *
 * @return {*}  {Promise<string>}
 */
export async function fetchAreaCodes(): Promise<string> {
  const url = 'https://nationalnanpa.com/nanp1/npa_report.csv';
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.text();
  } catch (error: any) {
    console.log('Error fetching CSV');
    throw error;
  }
}

export function parseFileDate(input: string): Date {
  const fileDateRaw = input.split('\n', 1)[0];
  const fileDate = new Date(fileDateRaw.split(',')[1]);

  if (!fileDate) {
    throw new Error(`Invalid file date: ${fileDateRaw}`);
  }

  return fileDate;
}

export async function parseAreaCodes(
  csv: string | Promise<string>,
): Promise<CSVRow[]> {
  const results: CSVRow[] = [];

  const stream = Readable.from(await csv);

  return new Promise<CSVRow[]>((resolve, reject) => {
    stream
      .pipe(
        csvParser({
          // Skip the file date row
          skipLines: 1,
        }),
      )
      .on('data', (data: any) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
}

function validateRecords(areaCodesParsed: CSVRow[]) {
  // Check for existing columns
  const requiredColumns = ['NPA_ID', 'USE', 'IN_SERVICE'];
  const missingColumns = requiredColumns.filter(
    (x) => !Object.keys(areaCodesParsed[0]).includes(x),
  );
  if (missingColumns.length) {
    const list = missingColumns.join(', ');
    throw new Error(`Missing columns: ${list}`);
  }

  // Check for valid NPA_ID format
  const invalidNpa = areaCodesParsed.filter((x) => {
    return !/^\d{3}$/.test(x['NPA_ID']);
  });
  if (invalidNpa.length) {
    const list = invalidNpa.map((x) => x['NPA_ID']).join(', ');
    throw new Error(`Invalid NPA_ID values: ${list}`);
  }

  // Check for valid USE format
  const invalidUse = areaCodesParsed.filter((x) => {
    return !/^[NG]$/.test(x['USE']) && x['USE'].length !== 0;
  });
  if (invalidUse.length) {
    const list = invalidUse.map((x) => x['USE']).join(', ');
    throw new Error(`Invalid USE values: ${list}`);
  }

  // Check for valid IN_SERVICE format
  const invalidInService = areaCodesParsed.filter((x) => {
    return !/^[YN]$/.test(x['IN_SERVICE']);
  });
  if (invalidInService.length) {
    const list = invalidInService.map((x) => x['IN_SERVICE']).join(', ');
    throw new Error(`Invalid IN_SERVICE values: ${list}`);
  }
}

export async function generateAreaCodeFile(
  areaCodes: CSVRow[] | Promise<CSVRow[]>,
  fileDate: Date,
) {
  const areaCodesByGeo = (await areaCodes)
    .filter((row) => row['IN_SERVICE'] === 'Y' && row['USE'] === 'G')
    .map((row) => `'${row['NPA_ID']}'`)
    .join(',\n');
  const areaCodesByNonGeo = (await areaCodes)
    .filter((row) => row['IN_SERVICE'] === 'Y' && row['USE'] === 'N')
    .map((row) => `'${row['NPA_ID']}'`)
    .join(',\n');

  // Create file
  const fileTemplate = `
    // This file was automatically generated from CSV file: ${fileDate.toISOString()}
    export const areaCodesByGeo: readonly string[] = [
      ${areaCodesByGeo}
    ];

    export const areaCodesByNonGeo: readonly string[] = [
      ${areaCodesByNonGeo}
    ];

    export const areaCodesInService: readonly string[] = [
      ...areaCodesByGeo,
      ...areaCodesByNonGeo,
    ];
    `;

  const filename = 'area_codes.ts';
  fs.writeFileSync(filename, fileTemplate);
  console.log(`${filename} file generated`);
}

async function main() {
  // Fetch codes
  const areaCodeResponse = fetchAreaCodes();

  // Parse date time of file
  const fileDate = parseFileDate(await areaCodeResponse);

  // Parse codes
  const areaCodesParsed = await parseAreaCodes(areaCodeResponse);

  // Validate expected format
  validateRecords(areaCodesParsed);

  // Write codes
  generateAreaCodeFile(areaCodesParsed, fileDate);
}

main();
