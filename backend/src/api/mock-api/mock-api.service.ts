import mongoose from "mongoose";

import { MockApi, type MockApiDocument } from "../../models/mock-api.model.js";

import type { CreateMockApiInput, UpdateMockApiInput } from "./mock-api.validation.js";

function toObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
}

export async function createMockApi(userId: string, data: CreateMockApiInput): Promise<MockApiDocument> {
    const mockApi = await MockApi.create({
        userId: toObjectId(userId),
        ...data,
    });

    return mockApi;
}

export async function getMockApis(userId: string): Promise<MockApiDocument[]> {
    return MockApi.find({
        userId: toObjectId(userId),
    }).sort({
        createdAt: -1,
    });
}

export async function getMockApiById(userId: string, id: string): Promise<MockApiDocument | null> {
    if (!mongoose.isValidObjectId(id)) {
        return null;
    }

    return MockApi.findOne({
        _id: toObjectId(id),
        userId: toObjectId(userId),
    });
}

export async function updateMockApi(userId: string, id: string, data: UpdateMockApiInput): Promise<MockApiDocument | null> {
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
    };

    return MockApi.findOneAndUpdate(
        {
            _id: toObjectId(id),
            userId: toObjectId(userId),
        },
        {
            $set: updateData,
        },
        {
            new: true,
            runValidators: true,
        },
    );
}

export async function deleteMockApi(userId: string, id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) {
        return false;
    }

    const result = await MockApi.deleteOne({
        _id: toObjectId(id),
        userId: toObjectId(userId),
    });

    return result.deletedCount === 1;
}
