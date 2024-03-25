import * as fs from 'fs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

interface CSVRow {
  [key: string]: string;
}

async function fetchAreaCodes(): Promise<string> {
  const url = 'https://nationalnanpa.com/nanp1/npa_report.csv';
  try {
    console.log('AA');
    const response = await fetch(url);
    console.log('BB');

    if (!response.ok) {
    //   throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log('CC');

    return response.text();
  } catch (error: any) {
    console.log('CC', error);
    throw new Error(`Error fetching CSV: ${error}`);
  }
}

async function parseAreaCodes(csv: Promise<string>): Promise<CSVRow[]> {
  const results: CSVRow[] = [];

  const stream = Readable.from(await csv);

  return new Promise<CSVRow[]>((resolve, reject) => {
    stream
      .pipe(csvParser())
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

function generateAreaCodeFile() {
  const filename = 'area_codes.ts';
  const fileTemplate = `
    // This file was automatically generated
    export const areaCodesByGeo: readonly string[] = [
        '201',
        '202',
    ];
    `;

  fs.writeFileSync(filename, fileTemplate);
  console.log(`${filename} file generated`);
}

async function main() {
  // Fetch codes
  const areaCodeResponse = fetchAreaCodes();

  console.log('tony', {hello: await areaCodeResponse});

  // Parse codes
  parseAreaCodes(areaCodeResponse);

  // console.log(await areaCodeParsed);

  // Write codes
  generateAreaCodeFile();
}

main();
