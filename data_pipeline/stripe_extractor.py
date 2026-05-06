# Import necessary libraries
import stripe
from google.cloud import bigquery
import os

# Set up the Stripe API key
# In a real-world scenario, you would use a secret management system to store your API key.
# For this example, we'll read it from an environment variable.
stripe.api_key = os.environ.get("STRIPE_API_KEY")

# Set up the BigQuery client
# This assumes you have authenticated with Google Cloud CLI.
client = bigquery.Client()

# Define the BigQuery table names
# In a real-world scenario, you would likely have a separate configuration file for these.
TRANSACTIONS_TABLE = "your_project.your_dataset.fct_transactions"
CUSTOMERS_TABLE = "your_project.your_dataset.dim_customers"
PRODUCTS_TABLE = "your_project.your_dataset.dim_products"

def fetch_stripe_data(endpoint, **kwargs):
    """
    Fetches data from the Stripe API using auto-pagination.
    """
    print(f"Fetching data from {endpoint}...")
    try:
        # It's better to use the specific list methods, e.g., stripe.Charge.list()
        # but for this generic example, we'll use this approach.
        data = getattr(stripe, endpoint).list(**kwargs)
        return data.auto_paging_iter()
    except Exception as e:
        print(f"Error fetching data from {endpoint}: {e}")
        return []

def load_data_to_bigquery(table_id, data):
    """
    Loads data into a BigQuery table.
    """
    print(f"Loading data into {table_id}...")
    try:
        errors = client.insert_rows_json(table_id, data)
        if not errors:
            print(f"Successfully loaded data into {table_id}")
        else:
            print(f"Errors loading data into {table_id}: {errors}")
    except Exception as e:
        print(f"Error loading data into {table_id}: {e}")


def main():
    """
    Main function to orchestrate the data extraction and loading process.
    """
    # Fetch and load balance transactions
    transactions = fetch_stripe_data("BalanceTransaction")
    # A simple transformation to match a hypothetical schema.
    # In a real pipeline, this would be more robust.
    transformed_transactions = [
        {
            "transaction_id": t.id,
            "amount": t.amount,
            "fee": t.fee,
            "net": t.net,
            "created_at": t.created,
        }
        for t in transactions
    ]
    if transformed_transactions:
        load_data_to_bigquery(TRANSACTIONS_TABLE, transformed_transactions)

    # Fetch and load customers
    customers = fetch_stripe_data("Customer")
    transformed_customers = [
        {
            "customer_id": c.id,
            "email": c.email,
            "name": c.name,
            "created_at": c.created,
        }
        for c in customers
    ]
    if transformed_customers:
        load_data_to_bigquery(CUSTOMERS_TABLE, transformed_customers)

    # Fetch and load products
    products = fetch_stripe_data("Product")
    transformed_products = [
        {
            "product_id": p.id,
            "name": p.name,
            "description": p.description,
            "created_at": p.created,
        }
        for p in products
    ]
    if transformed_products:
        load_data_to_bigquery(PRODUCTS_TABLE, transformed_products)


if __name__ == "__main__":
    main()
