"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeuristicModel = void 0;
// A simple heuristic model that returns the last value in the time series
class HeuristicModel {
    async predict(input) {
        if (input.values.length === 0) {
            throw new Error('HeuristicModel requires at least one data point.');
        }
        const lastValue = input.values[input.values.length - 1];
        return { predictedValue: lastValue };
    }
}
exports.HeuristicModel = HeuristicModel;
