"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultTimeSeriesModel = exports.TimeSeriesInputSchema = void 0;
const zod_1 = require("zod");
// Zod schema for time series input
exports.TimeSeriesInputSchema = zod_1.z.object({
    times: zod_1.z.array(zod_1.z.string()),
    values: zod_1.z.array(zod_1.z.number()),
});
class DefaultTimeSeriesModel {
    async predict(input) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable not set.');
        }
        const prompt = `
        Given the following time series data, what is the next predicted value? 
        Return only the predicted value, with no additional text or formatting.

        ${input.values.join(', ')}
      `;
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }]
            })
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API call failed with status ${response.status}: ${errorBody}`);
        }
        const responseData = await response.json();
        const modelResponseText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!modelResponseText) {
            throw new Error('Model returned an empty or invalid response.');
        }
        // 1. Pre-process the string to remove known non-numeric characters.
        const cleanedText = modelResponseText
            .replace(/,/g, '') // Remove thousands separators
            .replace(/[\$€£]/g, ''); // Remove common currency symbols
        // 2. Use a regex to find the first valid number (including negatives and decimals).
        const match = cleanedText.match(/-?\d+(\.\d+)?/);
        const predictedValue = match ? parseFloat(match[0]) : NaN;
        // Add an explicit check for NaN, as parseFloat can return this.
        if (isNaN(predictedValue)) {
            throw new Error('Model returned a non-numeric value.');
        }
        return { predictedValue };
    }
}
exports.DefaultTimeSeriesModel = DefaultTimeSeriesModel;
