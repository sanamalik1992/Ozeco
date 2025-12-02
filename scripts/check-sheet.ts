import { getUncachableGoogleSheetClient } from '../server/google-sheets';

const SPREADSHEET_ID = '1FyGvqJ3YUc8gh9m3gNxhsFIRAsZPcRTiYfrzyVf8O8k';

async function checkSheet() {
  const sheets = await getUncachableGoogleSheetClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1:E35',
  });
  
  const rows = response.data.values;
  if (!rows) return;
  
  console.log('Current data in Google Sheet:\n');
  rows.forEach((row, i) => {
    const title = row[1] || '';
    const imageLink = row[4] || '';
    console.log(`Row ${i+1}: ${title.substring(0, 45).padEnd(47)} | Image: ${imageLink}`);
  });
}

checkSheet().catch(console.error);
