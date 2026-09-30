import mongoose, { Document, Model, Schema } from "mongoose";

export interface RefreshTokenDocument extends Document {
    userId: mongoose.Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    revokedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: { type: Date },
    },
    {
        timestamps: true,
    },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken: Model<RefreshTokenDocument> = mongoose.model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);
