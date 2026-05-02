"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRegistry = void 0;
class ModelRegistry {
    constructor() {
        this.models = {};
    }
    register(id, model) {
        this.models[id] = model;
    }
    get(id) {
        const model = this.models[id];
        if (!model) {
            throw new Error(`Model with id '${id}' not found.`);
        }
        return model;
    }
}
exports.ModelRegistry = ModelRegistry;
