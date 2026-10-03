import mongoose, { Document, Model, Schema } from "mongoose";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type MockResponseType = "success" | "error";

export type MockResponseData = Record<string, unknown>;

export interface MockScenario {
    _id: mongoose.Types.ObjectId;
    name: string;
    statusCode: number;
    headers: Record<string, string>;
    responseBody: unknown;
    delayMs: number;
}

export interface MockApiDocument extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    method: HttpMethod;
    path: string;
    description?: string;
    activeScenarioId?: mongoose.Types.ObjectId;
    scenarios: MockScenario[];
    successResponse?: MockResponseData;
    errorResponse?: MockResponseData;
    createdAt: Date;
    updatedAt: Date;
}

const scenarioSchema = new Schema<MockScenario>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        statusCode: {
            type: Number,
            required: true,
            min: 100,
            max: 599,
        },

        headers: {
            type: Schema.Types.Mixed,
            default: {},
        },

        responseBody: {
            type: Schema.Types.Mixed,
            default: {},
        },

        delayMs: {
            type: Number,
            default: 0,
            min: 0,
            max: 30000,
        },
    },
    {
        _id: true,
    },
);

const mockApiSchema = new Schema<MockApiDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 100,
        },

        method: {
            type: String,
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            required: true,
        },

        path: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 500,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        activeScenarioId: {
            type: Schema.Types.ObjectId,
        },

        scenarios: {
            type: [scenarioSchema],
            default: [],
        },

        successResponse: {
            type: Schema.Types.Mixed,
        },

        errorResponse: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    },
);

mockApiSchema.index({
    userId: 1,
    path: 1,
    method: 1,
});

export const MockApi: Model<MockApiDocument> = mongoose.model<MockApiDocument>("MockApi", mockApiSchema);
