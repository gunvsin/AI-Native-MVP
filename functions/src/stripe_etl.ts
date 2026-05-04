
import { getStripe } from './init';
import { getChargesWithBackoff } from './stripe-service';
import { Stripe } from 'stripe';

interface FctTransaction {
  transaction_id: string;
  date_id: number;
  customer_id: string | null;
  product_id: string | null;
  transaction_type: string;
  amount: number;
  currency: string;
  stripe_charge_id: string;
  stripe_refund_id: string | null;
  stripe_payout_id: string | null;
  status: string;
}

const transformChargesToFctTransactions = (charges: Stripe.Charge[]): FctTransaction[] => {
  console.log('Transforming charges to fct_transactions format...');
  const transformedData: FctTransaction[] = charges.map(charge => ({
    transaction_id: charge.id,
    date_id: charge.created,
    customer_id: typeof charge.customer === 'string' ? charge.customer : null,
    product_id: null, // Product information is not directly on the charge object
    transaction_type: 'charge',
    amount: charge.amount / 100.0, // Stripe amounts are in cents
    currency: charge.currency,
    stripe_charge_id: charge.id,
    stripe_refund_id: null,
    stripe_payout_id: null,
    status: charge.status,
  }));
  console.log(`Successfully transformed ${transformedData.length} records.`);
  return transformedData;
};

const loadDataToWarehouse = (data: FctTransaction[], tableName: string) => {
  console.log(`Loading ${data.length} records into data warehouse table: ${tableName}...`);
  // In a real implementation, this would use a library like
  // @google-cloud/bigquery or a Snowflake connector to load the data.
  data.slice(0, 5).forEach(record => console.log(record)); // Print first 5 records as a sample
  console.log('Data loading simulation complete.');
};

export const runStripeEtl = async () => {
  // For this example, we'll need a way to get all charges, not just for a specific customer.
  // The current `getChargesWithBackoff` is customer-specific. We'll adapt this.
  const stripe = getStripe();
  console.log('Extracting all charges from Stripe...');

  try {
    const charges: Stripe.Charge[] = [];
    for await (const charge of stripe.charges.list({ limit: 100 })) {
      charges.push(charge);
    }

    console.log(`Successfully extracted ${charges.length} charges.`);
    if (charges.length > 0) {
      const fct_transactions = transformChargesToFctTransactions(charges);
      loadDataToWarehouse(fct_transactions, 'fct_transactions');
    }
  } catch (err: any) {
    if (err.statusCode === 429) {
      console.error('Stripe API rate limit exceeded. In a real implementation, we would handle this with backoff and retry.');
    } else {
      console.error('An error occurred during the ETL process:', err);
    }
  }
};

// If this script were to be run directly, you'd call runStripeEtl()
// For now, it's designed to be called from another part of the Firebase Functions code.
