import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';
import { defineFlow, startFlows } from '@genkit-ai/flow';
import * as z from 'zod';

configureGenkit({
  plugins: [
    firebase(),
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const summaryFlow = defineFlow(
  {
    name: 'summaryFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    // TODO: Implement the flow logic here
    return `Summary of "${prompt}"`;
  }
);

startFlows();
