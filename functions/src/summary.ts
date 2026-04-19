import { configureGenkit } from 'genkit';
import { firebase } from '@genkit-ai/firebase';
import { googleGenai, geminiPro } from '@genkit-ai/google-genai';
import { defineFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/ai';
import * as z from 'zod';
import { onFlow } from '@genkit-ai/firebase/functions';

configureGenkit({
  plugins: [
    firebase(),
    googleGenai(),
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
  async (textToSummarize) => {
    const llmResponse = await generate({
      model: geminiPro,
      prompt: `Please provide a concise summary of the following text: ${textToSummarize}`,
    });

    return llmResponse.text();
  }
);

export const summary = onFlow(summaryFlow, {});
