
# Reporting Data Model for Stripe Analytics

This document outlines the proposed dimensional data model for Stripe reporting and analytics. This model is designed to be stored in a data warehouse like BigQuery or Snowflake and is optimized for querying large volumes of data to generate business insights.

## 1. Dimensional Modeling Principles

We will follow the principles of dimensional modeling, which involves organizing data into:

- **Fact Tables:** These tables contain the quantitative measurements of business events (e.g., transaction amount, subscription MRR). They are generally long and narrow.
- **Dimension Tables:** These tables contain the descriptive attributes that provide context to the fact tables (e.g., customer details, product information, date attributes). They are generally wide and short.

## 2. Proposed Schema

### Fact Tables

#### `fct_transactions`

This will be the central fact table, with each row representing a single financial transaction or movement of money.

- `transaction_id` (Primary Key)
- `date_id` (Foreign Key to `dim_dates`)
- `customer_id` (Foreign Key to `dim_customers`)
- `product_id` (Foreign Key to `dim_products`)
- `transaction_type` (e.g., 'charge', 'refund', 'payout')
- `amount` (Decimal)
- `currency` (String)
- `stripe_charge_id` (String)
- `stripe_refund_id` (String)
- `stripe_payout_id` (String)
- `status` (e.g., 'succeeded', 'failed')

### Dimension Tables

#### `dim_customers`

This table holds all information related to a customer.

- `customer_id` (Primary Key)
- `stripe_customer_id` (String)
- `email` (String)
- `name` (String)
- `created_at` (Timestamp)

#### `dim_products`

This table contains details about each product or plan sold.

- `product_id` (Primary Key)
- `stripe_product_id` (String)
- `name` (String)
- `description` (String)
- `price` (Decimal)
- `interval` (e.g., 'month', 'year', 'one-time')

#### `dim_dates`

A utility table to allow for easy filtering and grouping by date components.

- `date_id` (Primary Key, e.g., '2023-10-27')
- `date` (Date)
- `year` (Integer)
- `month` (Integer)
- `day` (Integer)
- `day_of_week` (String)
- `quarter` (Integer)

## 3. Next Steps

With this data model as our guide, the next step is to implement the ETL (Extract, Transform, Load) process to populate these tables from the Stripe API.
