import type { Request, Response } from "express";
import { createResponseSchema, responseTypeSchema, updateResponseSchema } from "./response.validation.js";
import { createResponse, deleteResponse, getResponse, updateResponse } from "./response.service.js";

interface ResponseParams {
    id: string;
    responseType: string;
}

function parseResponseType(value: string) {
    return responseTypeSchema.safeParse(value);
}

export async function create(req: Request<ResponseParams>, res: Response) {
    const type = parseResponseType(req.params.responseType);

    if (!type.success) {
        return res.status(404).json({ success: false, message: "Response type not found" });
    }

    const result = createResponseSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid response data",
            errors: result.error.flatten(),
        });
    }

    const created = await createResponse(req.user!.userId, req.params.id, type.data, result.data);

    if (created.status === "not-found") {
        return res.status(404).json({ success: false, message: "Mock API not found" });
    }

    if (created.status === "already-exists") {
        return res.status(409).json({ success: false, message: `${type.data} response already exists` });
    }

    return res.status(201).json({
        success: true,
        message: `${type.data} response created successfully`,
        data: created.response,
    });
}

export async function get(req: Request<ResponseParams>, res: Response) {
    const type = parseResponseType(req.params.responseType);

    if (!type.success) {
        return res.status(404).json({ success: false, message: "Response type not found" });
    }

    const response = await getResponse(req.user!.userId, req.params.id, type.data);

    if (!response) {
        return res.status(404).json({ success: false, message: `${type.data} response not found` });
    }

    return res.status(200).json({ success: true, data: response });
}

export async function update(req: Request<ResponseParams>, res: Response) {
    const type = parseResponseType(req.params.responseType);

    if (!type.success) {
        return res.status(404).json({ success: false, message: "Response type not found" });
    }

    const result = updateResponseSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid response data",
            errors: result.error.flatten(),
        });
    }

    const response = await updateResponse(req.user!.userId, req.params.id, type.data, result.data);

    if (!response) {
        return res.status(404).json({ success: false, message: `${type.data} response not found` });
    }

    return res.status(200).json({
        success: true,
        message: `${type.data} response updated successfully`,
        data: response,
    });
}

export async function remove(req: Request<ResponseParams>, res: Response) {
    const type = parseResponseType(req.params.responseType);

    if (!type.success) {
        return res.status(404).json({ success: false, message: "Response type not found" });
    }

    const deleted = await deleteResponse(req.user!.userId, req.params.id, type.data);

    if (!deleted) {
        return res.status(404).json({ success: false, message: `${type.data} response not found` });
    }

    return res.status(200).json({
        success: true,
        message: `${type.data} response deleted successfully`,
    });
}
