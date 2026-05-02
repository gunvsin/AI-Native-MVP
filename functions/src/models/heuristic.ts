
import { Model } from './model-registry.js';

// A simple heuristic model that returns the last value in the time series
export class HeuristicModel implements Model {
  async predict(input: { times: string[]; values: number[] }): Promise<{ predictedValue: number }> {
    if (input.values.length === 0) {
      throw new Error('HeuristicModel requires at least one data point.');
    }
    const lastValue = input.values[input.values.length - 1];
    return { predictedValue: lastValue };
  }
}
