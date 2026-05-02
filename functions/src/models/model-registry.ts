
import { z } from 'zod';
import { TimeSeriesInputSchema } from './timeseries.js';

export interface Model {
  predict(input: z.infer<typeof TimeSeriesInputSchema>): Promise<{ predictedValue: number }>;
}

export class ModelRegistry {
  private models: Record<string, Model> = {};

  register(id: string, model: Model) {
    this.models[id] = model;
  }

  get(id: string): Model {
    const model = this.models[id];
    if (!model) {
      throw new Error(`Model with id '${id}' not found.`);
    }
    return model;
  }
}
