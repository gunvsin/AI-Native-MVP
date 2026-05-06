
// list_tables.js
const { BigQuery } = require('@google-cloud/bigquery');

async function listTables() {
  try {
    const bigquery = new BigQuery({projectId: 'ai-finance-mvp'});
    const datasetId = 'ai-finance-db'; // The dataset we're interested in

    console.log(`Listing tables in dataset: ${datasetId}`);

    // Lists all tables in the specified dataset
    const [tables] = await bigquery.dataset(datasetId).getTables();

    if (tables.length === 0) {
        console.log('No tables found in this dataset.');
    } else {
        console.log('Tables:');
        tables.forEach(table => {
            console.log(table.id);
        });
    }

  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

listTables();
