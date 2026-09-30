import mongoose from "mongoose";
import { MockApi, type MockScenario } from "../../../models/mock-api.model.js";
import type { CreateScenarioInput, UpdateScenarioInput } from "./scenario.validation.js";

function toObjectId(id: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(id);
}

function findScenario(scenarios: MockScenario[], scenarioId: string): MockScenario | undefined {
    return scenarios.find((scenario) => scenario._id.toString() === scenarioId);
}

export async function createScenario(userId: string, mockApiId: string, data: CreateScenarioInput): Promise<MockScenario | null> {
    if (!mongoose.isValidObjectId(mockApiId)) {
        return null;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return null;
    }

    const scenario = {
        _id: new mongoose.Types.ObjectId(),
        ...data,
    } as MockScenario;

    mockApi.scenarios.push(scenario);

    if (!mockApi.activeScenarioId) {
        mockApi.activeScenarioId = scenario._id;
    }

    await mockApi.save();

    return scenario;
}

export async function getScenarios(userId: string, mockApiId: string): Promise<MockScenario[] | null> {
    if (!mongoose.isValidObjectId(mockApiId)) {
        return null;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return null;
    }

    return mockApi.scenarios;
}

export async function getScenarioById(userId: string, mockApiId: string, scenarioId: string): Promise<MockScenario | null> {
    if (!mongoose.isValidObjectId(mockApiId) || !mongoose.isValidObjectId(scenarioId)) {
        return null;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return null;
    }

    const scenario = findScenario(mockApi.scenarios, scenarioId);

    return scenario ?? null;
}

export async function updateScenario(userId: string, mockApiId: string, scenarioId: string, data: UpdateScenarioInput): Promise<MockScenario | null> {
    if (!mongoose.isValidObjectId(mockApiId) || !mongoose.isValidObjectId(scenarioId)) {
        return null;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return null;
    }

    const scenario = findScenario(mockApi.scenarios, scenarioId);

    if (!scenario) {
        return null;
    }

    Object.assign(scenario, data);

    await mockApi.save();

    return scenario;
}

export async function deleteScenario(userId: string, mockApiId: string, scenarioId: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(mockApiId) || !mongoose.isValidObjectId(scenarioId)) {
        return false;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return false;
    }

    const scenarioIndex = mockApi.scenarios.findIndex((scenario) => scenario._id.toString() === scenarioId);

    if (scenarioIndex === -1) {
        return false;
    }

    const wasActive = mockApi.activeScenarioId?.toString() === scenarioId;

    mockApi.scenarios.splice(scenarioIndex, 1);

    if (wasActive) {
        const nextScenario = mockApi.scenarios[0];

        mockApi.activeScenarioId = nextScenario ? nextScenario._id : undefined;
    }

    await mockApi.save();

    return true;
}

export async function activateScenario(userId: string, mockApiId: string, scenarioId: string): Promise<MockScenario | null> {
    if (!mongoose.isValidObjectId(mockApiId) || !mongoose.isValidObjectId(scenarioId)) {
        return null;
    }

    const mockApi = await MockApi.findOne({
        _id: toObjectId(mockApiId),
        userId: toObjectId(userId),
    });

    if (!mockApi) {
        return null;
    }

    const scenario = findScenario(mockApi.scenarios, scenarioId);

    if (!scenario) {
        return null;
    }

    mockApi.activeScenarioId = scenario._id;

    await mockApi.save();

    return scenario;
}
