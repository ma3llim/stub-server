import mongoose from "mongoose";

import { MockApi, type MockApiDocument } from "../../models/mock-api.model.js";

import type { CreateMockApiInput, UpdateMockApiInput } from "./mock-api.validation.js";

function toObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
}

export async function createMockApi(data: CreateMockApiInput): Promise<MockApiDocument> {
    const { requestBody, ...rest } = data;

    const mockApi = await MockApi.create({
        ...rest,
        ...(requestBody !== undefined && requestBody !== null && { requestBody }),
    });

    return mockApi;
}

export async function getMockApis(): Promise<MockApiDocument[]> {
    return MockApi.find().sort({
        createdAt: -1,
    });
}

export async function getMockApiById(id: string): Promise<MockApiDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return MockApi.findOne({
        _id: toObjectId(id),
    });
}

export async function updateMockApi(id: string, data: UpdateMockApiInput): Promise<MockApiDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    const updateData = {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.method !== undefined && { method: data.method }),
        ...(data.path !== undefined && { path: data.path }),
        ...(data.description !== undefined && {
            description: data.description,
        }),
        ...(data.successResponse !== undefined && { successResponse: data.successResponse }),
        ...(data.errorResponse !== undefined && { errorResponse: data.errorResponse }),
        ...(data.requestBody !== undefined && data.requestBody !== null && { requestBody: data.requestBody }),
    };

    return MockApi.findOneAndUpdate(
        {
            _id: toObjectId(id),
        },
        {
            $set: updateData,
            // Sending requestBody: null clears it.
            ...(data.requestBody === null && { $unset: { requestBody: 1 } }),
        },
        {
            new: true,
            runValidators: true,
        },
    );
}

export async function deleteAllMockApis(): Promise<number> {
    const result = await MockApi.deleteMany({});

    return result.deletedCount;
}

export async function deleteMockApi(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) {
        return false;
    }

    const result = await MockApi.deleteOne({
        _id: toObjectId(id),
    });

    return result.deletedCount === 1;
}
