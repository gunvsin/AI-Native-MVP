"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.summary = exports.summaryFlow = void 0;
const genkit_1 = require("genkit");
const firebase_1 = require("@genkit-ai/firebase");
const google_genai_1 = require("@genkit-ai/google-genai");
const flow_1 = require("@genkit-ai/flow");
const ai_1 = require("@genkit-ai/ai");
const z = __importStar(require("zod"));
const functions_1 = require("@genkit-ai/firebase/functions");
(0, genkit_1.configureGenkit)({
    plugins: [
        (0, firebase_1.firebase)(),
        (0, google_genai_1.googleGenai)(),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});
exports.summaryFlow = (0, flow_1.defineFlow)({
    name: 'summaryFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
}, async (textToSummarize) => {
    const llmResponse = await (0, ai_1.generate)({
        model: google_genai_1.geminiPro,
        prompt: `Please provide a concise summary of the following text: ${textToSummarize}`,
    });
    return llmResponse.text();
});
exports.summary = (0, functions_1.onFlow)(exports.summaryFlow, {});
//# sourceMappingURL=summary.js.map