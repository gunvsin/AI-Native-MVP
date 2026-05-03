'use client';
import Image from 'next/image';
import styles from './page.module.css';
import FinancialSummaryCard from "../components/FinancialSummaryCard/FinancialSummaryCard";
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "test", "1"), (doc) => {
      setTestData(doc.data());
    });
    return () => unsub();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.js</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <FinancialSummaryCard/>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Firebase Test</h2>
          {testData ? (
            <pre>{JSON.stringify(testData, null, 2)}</pre>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </main>
  );
}
