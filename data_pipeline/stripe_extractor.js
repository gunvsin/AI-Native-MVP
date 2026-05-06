
// Import necessary libraries
const Stripe = require('stripe');
const { BigQuery } = require('@google-cloud/bigquery');

// Set up the Stripe API key
const stripe = new Stripe(process.env.STRIPE_API_KEY);

// Set up the BigQuery client
const bigquery = new BigQuery({projectId: 'ai-finance-mvp'});

// Define the BigQuery table names
const TRANSACTIONS_TABLE = 'ai-finance-mvp.ai_finance_db.fct_transactions';
const CUSTOMERS_TABLE = 'ai-finance-mvp.ai_finance_db.dim_customers';
const PRODUCTS_TABLE = 'ai-finance-mvp.ai_finance_db.dim_products';

/**
 * Fetches data from a Stripe resource using auto-pagination.
 * @param {object} resource - The Stripe resource to fetch data from (e.g., stripe.customers).
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of objects.
 */
async function fetchStripeData(resource) {
  console.log(`Fetching data from Stripe for ${resource.constructor.name}...`);
  const data = [];
  try {
    for await (const item of resource.list({ limit: 100 })) {
      data.push(item);
    }
    console.log(`Successfully fetched ${data.length} items.`);
    return data;
  } catch (e) {
    console.error(`Error fetching data from Stripe: ${e.message}`);
    return [];
  }
}

/**
 * Loads data into a BigQuery table.
 * @param {string} tableId - The full ID of the table (e.g., 'your_project.your_dataset.your_table').
 * @param {Array<object>} data - The data to load.
 */
async function loadDataToBigQuery(tableId, data) {
  if (!data || data.length === 0) {
    console.log('No data to load.');
    return;
  }
  console.log(`Loading ${data.length} rows into ${tableId}...`);
  try {
    const [projectId, datasetId,tableName] = tableId.split('.');
    await bigquery.dataset(datasetId, {projectId: projectId}).table(tableName).insert(data);
    console.log(`Successfully loaded data into ${tableId}`);
  } catch (e) {
    console.error(`Error loading data into ${tableId}:`, e.response ? e.response.insertErrors : e);
  }
}

/**
 * Main function to orchestrate the data extraction and loading process.
 */
async function main() {
  // Fetch and load balance transactions
  const transactions = await fetchStripeData(stripe.balanceTransactions);
  const transformedTransactions = transactions.map(t => ({
    id: t.id,
    amount: t.amount / 100,
    created: t.created,
    currency: t.currency,
    description: t.description,
    type: t.type,
    fee: t.fee / 100,
    status: t.status
  }));
  await loadDataToBigQuery(TRANSACTIONS_TABLE, transformedTransactions);

  // Fetch and load customers
  const customers = await fetchStripeData(stripe.customers);
  const transformedCustomers = customers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    created: c.created,
  }));
  await loadDataToBigQuery(CUSTOMERS_TABLE, transformedCustomers);

  // Fetch and load products
  const products = await fetchStripeData(stripe.products);
  const transformedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    created: p.created,
  }));
  await loadDataToBigQuery(PRODUCTS_TABLE, transformedProducts);
}

main().catch(console.error);
