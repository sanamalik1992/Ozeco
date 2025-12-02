import { getUncachableGoogleSheetClient } from '../server/google-sheets';

const SPREADSHEET_ID = '1FyGvqJ3YUc8gh9m3gNxhsFIRAsZPcRTiYfrzyVf8O8k';

async function checkSheet() {
  const sheets = await getUncachableGoogleSheetClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A1:L35',
  });
  
  const rows = response.data.values;
  if (!rows) return;
  
  console.log('Headers:', rows[0]);
  console.log('\n--- Link Column (D) ---\n');
  
  rows.forEach((row, i) => {
    if (i === 0) return; // Skip header
    const title = row[1] || '';
    const link = row[3] || 'EMPTY';
    console.log(`Row ${i+1}: ${title.substring(0, 40).padEnd(42)} | Link: ${link}`);
  });
}

checkSheet().catch(console.error);
