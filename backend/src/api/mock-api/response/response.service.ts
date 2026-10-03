import mongoose from "mongoose";
import { MockApi, type MockResponseData, type MockResponseType } from "../../../models/mock-api.model.js";
import type { ResponseDataInput } from "./response.validation.js";

type ResponseField = "successResponse" | "errorResponse";

function getResponseField(type: MockResponseType): ResponseField {
    return type === "success" ? "successResponse" : "errorResponse";
}

function toObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
}

export type CreateResponseResult =
    | { status: "not-found" }
    | { status: "already-exists" }
    | { status: "created"; response: MockResponseData };

export async function createResponse(
    userId: string,
    mockApiId: string,
    type: MockResponseType,
    data: ResponseDataInput,
): Promise<CreateResponseResult> {
    if (!mongoose.isValidObjectId(mockApiId) || !mongoose.isValidObjectId(userId)) {
        return { status: "not-found" };
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return { status: "not-found" };
    }

    const field = getResponseField(type);

    if (mockApi[field]) {
        return { status: "already-exists" };
    }

    mockApi.set(field, data);
    mockApi.markModified(field);
    await mockApi.save();

    return { status: "created", response: mockApi[field]! };
}

export async function getResponse(
    userId: string,
    mockApiId: string,
    type: MockResponseType,
): Promise<MockResponseData | null> {
    if (!mongoose.isValidObjectId(mockApiId) || !mongoose.isValidObjectId(userId)) {
        return null;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    return mockApi?.[getResponseField(type)] ?? null;
}

export async function updateResponse(
    userId: string,
    mockApiId: string,
    type: MockResponseType,
    data: ResponseDataInput,
): Promise<MockResponseData | null> {
    if (!mongoose.isValidObjectId(mockApiId) || !mongoose.isValidObjectId(userId)) {
        return null;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return null;
    }

    const field = getResponseField(type);
    const response = mockApi[field];

    if (!response) {
        return null;
    }

    mockApi.set(field, data);
    mockApi.markModified(field);
    await mockApi.save();

    return mockApi[field]!;
}
