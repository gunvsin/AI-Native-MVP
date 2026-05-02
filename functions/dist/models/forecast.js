"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastModel = void 0;
// A simple forecast model that uses a linear regression to predict the next value.
class ForecastModel {
    async predict(input) {
        if (input.values.length < 2) {
            throw new Error('ForecastModel requires at least two data points.');
        }
        const n = input.values.length;
        const sx = n * (n + 1) / 2;
        const sy = input.values.reduce((a, b) => a + b, 0);
        const sxy = input.values.map((y, i) => (i + 1) * y).reduce((a, b) => a + b, 0);
        const sxx = (n * (n + 1) * (2 * n + 1)) / 6;
        const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
        const intercept = (sy - slope * sx) / n;
        const nextX = n + 1;
        const predictedValue = slope * nextX + intercept;
        return { predictedValue };
    }
}
exports.ForecastModel = ForecastModel;
