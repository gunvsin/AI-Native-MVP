
// create_tables.js
const { BigQuery } = require('@google-cloud/bigquery');

async function createTables() {
  try {
    const bigquery = new BigQuery({projectId: 'ai-finance-mvp'});
    const datasetId = 'ai_finance_db';

    console.log(`Creating tables in dataset: ${datasetId}`);

    // Schema for fct_transactions
    const transactionsSchema = [
      {name: 'id', type: 'STRING'},
      {name: 'amount', type: 'NUMERIC'},
      {name: 'created', type: 'TIMESTAMP'},
      {name: 'currency', type: 'STRING'},
      {name: 'description', type: 'STRING'},
      {name: 'type', type: 'STRING'},
      {name: 'fee', type: 'NUMERIC'},
      {name: 'status', type: 'STRING'},
    ];

    // Schema for dim_customers
    const customersSchema = [
        {name: 'id', type: 'STRING'},
        {name: 'name', type: 'STRING'},
        {name: 'email', type: 'STRING'},
        {name: 'created', type: 'TIMESTAMP'},
    ];

    // Schema for dim_products
    const productsSchema = [
        {name: 'id', type: 'STRING'},
        {name: 'name', type: 'STRING'},
        {name: 'description', type: 'STRING'},
        {name: 'created', type: 'TIMESTAMP'},
    ];

    // Create the tables
    await bigquery.dataset(datasetId).createTable('fct_transactions', {schema: transactionsSchema});
    console.log('Table fct_transactions created.');
    await bigquery.dataset(datasetId).createTable('dim_customers', {schema: customersSchema});
    console.log('Table dim_customers created.');
    await bigquery.dataset(datasetId).createTable('dim_products', {schema: productsSchema});
    console.log('Table dim_products created.');

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();
