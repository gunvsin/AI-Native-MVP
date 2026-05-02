
"use client";

import styles from "./page.module.css";
import dynamic from 'next/dynamic';

// Dynamically import components and disable SSR to prevent build errors
const NetworkModeToggle = dynamic(
  () => import('../components/NetworkModeToggle/NetworkModeToggle'),
  { ssr: false }
);

const FinancialSummaryCard = dynamic(
  () => import('../components/FinancialSummaryCard/FinancialSummaryCard'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Financial Guardian Prototype
        </p>
        <div>
          <a
            href="https://firebase.google.com/docs/genkit"
            target="_blank"
            rel="noopener noreferrer"
          >
            By
            Build with Google
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <FinancialSummaryCard summaryText={'Loading summary...'} />
      </div>

      <div className={styles.grid}>
        <a
          href="https://github.com/firebase/genkit/tree/main/sample"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Genkit Samples <span>-&gt;</span>
          </h2>
          <p>Explore more Genkit features and integrations.</p>
        </a>

        <a
          href="https://firebase.google.com/docs/rules"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Security Rules <span>-&gt;</span>
          </h2>
          <p>Learn how to secure your Firestore database.</p>
        </a>

        <a
          href="https://www.npmjs.com/package/langchain"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            LangChain <span>-&gt;</span>
          </h2>
          <p>Discover the power of the LangChain framework.</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=app&utm_campaign=create-next-app-readme"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
      <NetworkModeToggle />
    </main>
  );
}
