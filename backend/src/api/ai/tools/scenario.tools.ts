export const scenarioTools = [
    {
        type: "function" as const,
        function: {
            name: "get_scenarios",
            description: "Get all scenarios configured for the current mock API.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                        description: "The mock API ID.",
                    },
                },
                required: ["mockApiId"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "get_scenario_by_id",
            description: "Get one specific scenario by its scenario ID.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                    },
                    scenarioId: {
                        type: "string",
                    },
                },
                required: ["mockApiId", "scenarioId"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "get_active_scenario",
            description: "Get the currently active scenario for the mock API.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                    },
                },
                required: ["mockApiId"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "create_scenario",
            description: "Create a new response scenario for an existing mock API.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                        description: "Scenario name.",
                    },
                    statusCode: {
                        type: "number",
                        description: "HTTP response status code.",
                    },
                    headers: {
                        type: "object",
                        additionalProperties: {
                            type: "string",
                        },
                        description: "HTTP response headers.",
                    },
                    responseBody: {
                        description: "JSON response body.",
                    },
                    delayMs: {
                        type: "number",
                        description: "Response delay in milliseconds.",
                    },
                },
                required: ["mockApiId", "name", "statusCode", "responseBody"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "update_scenario",
            description: "Update an existing scenario.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                    },
                    scenarioId: {
                        type: "string",
                    },
                    name: {
                        type: "string",
                    },
                    statusCode: {
                        type: "number",
                    },
                    headers: {
                        type: "object",
                        additionalProperties: {
                            type: "string",
                        },
                    },
                    responseBody: {},
                    delayMs: {
                        type: "number",
                    },
                },
                required: ["mockApiId", "scenarioId"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "delete_scenario",
            description: "Delete an existing scenario.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                    },
                    scenarioId: {
                        type: "string",
                    },
                },
                required: ["mockApiId", "scenarioId"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "activate_scenario",
            description: "Activate one scenario for the mock API. Only one scenario can be active at a time.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                    },
                    scenarioId: {
                        type: "string",
                    },
                },
                required: ["mockApiId", "scenarioId"],
            },
        },
    },

    {
        type: "function" as const,
        function: {
            name: "test_scenario",
            description:
                "Test a scenario by returning the exact HTTP response that the mock API would produce, including status code, headers, response body, and configured delay. This does not modify the scenario.",
            parameters: {
                type: "object",
                properties: {
                    mockApiId: {
                        type: "string",
                    },
                    scenarioId: {
                        type: "string",
                    },
                },
                required: ["mockApiId", "scenarioId"],
            },
        },
    },
];
