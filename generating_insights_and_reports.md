# Generating Insights and Reports

This document explains how to use the data in our data warehouse to generate valuable insights and reports.

## 1. Answering Business Questions with SQL

Once your data is in the data warehouse, you can use SQL to answer common business questions. Here are a few examples:

### Monthly Recurring Revenue (MRR)

```sql
SELECT
  EXTRACT(YEAR FROM created_at) AS year,
  EXTRACT(MONTH FROM created_at) AS month,
  SUM(amount) / 100 AS mrr
FROM
  your_project.your_dataset.fct_transactions
WHERE
  type = 'charge'
GROUP BY
  1, 2
ORDER BY
  1, 2;
```

### Customer Lifetime Value (LTV)

```sql
WITH customer_revenue AS (
  SELECT
    customer_id,
    SUM(amount) / 100 AS total_revenue
  FROM
    your_project.your_dataset.fct_transactions
  WHERE
    type = 'charge'
  GROUP BY
    1
)
SELECT
  AVG(total_revenue) AS ltv
FROM
  customer_revenue;
```

### Churn Rate

Calculating churn rate is more complex and depends on how you define churn. A simple approach is to count the number of customers who had a subscription in the previous month but not in the current month.

## 2. Creating Interactive Dashboards

We will use a Business Intelligence (BI) tool like Looker Studio or Tableau to create interactive dashboards and visualizations. These tools allow you to connect to your data warehouse and build reports by dragging and dropping different components.

### Example Dashboard Components

*   **MRR Trend:** A line chart showing the MRR over time.
*   **LTV:** A single-value visualization showing the average LTV.
*   **Churn Rate:** A single-value visualization showing the current churn rate.
*   **Customer Segmentation:** A pie chart showing the distribution of customers by different segments (e.g., by subscription plan).

## 3. Key Metrics and Reports

Here are some of the key metrics and reports that we can build to monitor the health of our business:

*   **Financial Metrics:** MRR, LTV, churn rate, gross merchandise volume (GMV), net revenue.
*   **Customer Metrics:** Number of active customers, customer acquisition cost (CAC), customer retention rate.
*   **Product Metrics:** Product adoption rate, feature usage, user engagement.
