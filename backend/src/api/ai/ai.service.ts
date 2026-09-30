import { env } from "../../config/env.js";
import { createChatCompletion } from "../../config/llm.js";
import { createScenario, getScenarios, getScenarioById, getActiveScenario, updateScenario, deleteScenario, activateScenario } from "../mock-api/scenario/scenario.service.js";
import { scenarioTools } from "./tools/scenario.tools.js";

export async function chatWithScenarioAgent(userId: string, mockApiId: string, message: string): Promise<string> {
    const messages: any[] = [
        {
            role: "system",
            content: `
                You are an AI assistant for a Mock API platform.
                You manage ONLY scenarios belonging to the provided Mock API.
            
                Available operations:
                - get scenarios
                - get one scenario by ID
                - get the active scenario
                - create a scenario
                - update a scenario
                - delete a scenario
                - activate a scenario
                - test a scenario

                You MUST NOT create, update, or delete Mock APIs.
                Always use tools for scenario operations.
                Never claim an operation succeeded unless the tool result confirms it.

                IMPORTANT RESPONSE RULES:
                Keep final responses concise and structured.
                Do not provide unnecessary explanations.
                Do not use long paragraphs.
                
                For a successful creation, respond with: Scenario created successfully.
                Name: <name>
                Status: <status>
                Scenario ID: <id>
                Delay: <delay>

                For an update: Scenario updated successfully.
                Name: <name>
                Status: <status>
                Scenario ID: <id>

                For activation: Scenario activated successfully.
                Name: <name>
                Status: <status>
                Scenario ID: <id>

                For deletion: Scenario deleted successfully.
                Name: <name>
                Scenario ID: <id>

                For listing scenarios, use a numbered list.
                For getting one scenario, show its important fields.
                For getting the active scenario, clearly state the active scenario.
                For testing a scenario, show:

                Scenario test result
                Status: <status>
                Headers: <headers>
                Response Body:
                <response body>
                Delay: <delay> ms

                If the user asks to create and activate a scenario:

                1. Create the scenario.
                2. Read the scenario ID returned by create_scenario.
                3. Activate that scenario using the returned scenario ID.
                4. Only after successful activation, confirm both operations.

                Never activate a scenario unless the user explicitly asks for activation or asks to create and activate it.

                The current Mock API ID is: ${mockApiId}`.trim(),
        },
        {
            role: "user",
            content: message,
        },
    ];

    for (let iteration = 0; iteration < 6; iteration++) {
        try {
            const response = await createChatCompletion({
                model: env.CLOUDFLARE_MODEL,
                messages,
                tools: scenarioTools,
                tool_choice: "auto",
                parallel_tool_calls: false,
            });

            const assistantMessage = response.choices?.[0]?.message;

            if (!assistantMessage) {
                throw new Error("Invalid AI response");
            }

            if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
                return assistantMessage.content ?? "Operation completed.";
            }

            messages.push(assistantMessage);

            for (const toolCall of assistantMessage.tool_calls) {
                const toolName = toolCall.function.name;
                let args: any;

                try {
                    args = JSON.parse(toolCall.function.arguments);
                } catch {
                    throw new Error(`Invalid arguments returned by AI for tool: ${toolName}`);
                }

                args.mockApiId = mockApiId;

                const result = await executeScenarioTool(userId, toolName, args);

                messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    throw new Error("Maximum AI tool execution limit reached");
}

async function executeScenarioTool(userId: string, toolName: string, args: any): Promise<unknown> {
    if (!args.mockApiId) {
        throw new Error("mockApiId is required");
    }

    switch (toolName) {
        case "get_scenarios":
            return getScenarios(userId, args.mockApiId);

        case "get_scenario_by_id":
            return getScenarioById(userId, args.mockApiId, args.scenarioId);

        case "get_active_scenario":
            return getActiveScenario(userId, args.mockApiId);

        case "create_scenario":
            return createScenario(userId, args.mockApiId, {
                name: args.name,
                statusCode: args.statusCode,
                headers: args.headers ?? {},
                responseBody: parseResponseBody(args.responseBody),
                delayMs: args.delayMs ?? 0,
            });

        case "update_scenario":
            return updateScenario(userId, args.mockApiId, args.scenarioId, {
                ...(args.name !== undefined && {
                    name: args.name,
                }),

                ...(args.statusCode !== undefined && {
                    statusCode: args.statusCode,
                }),

                ...(args.headers !== undefined && {
                    headers: args.headers,
                }),

                ...(args.responseBody !== undefined && {
                    responseBody: parseResponseBody(args.responseBody),
                }),

                ...(args.delayMs !== undefined && {
                    delayMs: args.delayMs,
                }),
            });

        case "delete_scenario":
            return deleteScenario(userId, args.mockApiId, args.scenarioId);

        case "activate_scenario":
            return activateScenario(userId, args.mockApiId, args.scenarioId);

        case "test_scenario":
            return testScenario(userId, args.mockApiId, args.scenarioId);

        default:
            throw new Error(`Unknown scenario tool: ${toolName}`);
    }
}

async function testScenario(
    userId: string,
    mockApiId: string,
    scenarioId: string,
): Promise<{
    scenarioId: string;
    name: string;
    statusCode: number;
    headers: Record<string, string>;
    responseBody: unknown;
    delayMs: number;
}> {
    const scenario = await getScenarioById(userId, mockApiId, scenarioId);

    if (!scenario) {
        throw new Error("Scenario not found");
    }

    return {
        scenarioId: scenario._id.toString(),
        name: scenario.name,
        statusCode: scenario.statusCode,
        headers: scenario.headers,
        responseBody: parseResponseBody(scenario.responseBody),
        delayMs: scenario.delayMs,
    };
}

function parseResponseBody(value: unknown): unknown {
    if (value === undefined || value === null) {
        return {};
    }

    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}
