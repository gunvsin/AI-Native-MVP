
// create_dataset.js
const { BigQuery } = require('@google-cloud/bigquery');

async function createDataset() {
  try {
    const bigquery = new BigQuery({projectId: 'ai-finance-mvp'});
    const datasetId = 'ai_finance_db';

    console.log(`Creating dataset: ${datasetId}`);

    // Creates the new dataset
    const [dataset] = await bigquery.createDataset(datasetId);
    console.log(`Dataset ${dataset.id} created.`);

  } catch (error) {
    console.error('Error creating dataset:', error);
  }
}

createDataset();
