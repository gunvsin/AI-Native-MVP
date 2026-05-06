
// query_data.js
const { BigQuery } = require('@google-cloud/bigquery');

async function queryData() {
  try {
    const bigquery = new BigQuery({projectId: 'ai-finance-mvp'});
    const datasetId = 'ai_finance_db';
    const tableId = 'fct_transactions';

    console.log(`Querying data from ${datasetId}.${tableId}...`);

    const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();

    console.log(JSON.stringify(rows));

  } catch (error) {
    console.error('Error querying data:', error);
  }
}

queryData();
