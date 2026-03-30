import mongoose from "mongoose";

const accessLinkSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
                type: Date,
                default: null,
            },
    },
    { timestamps: true }
);

export default mongoose.model("AccessLink", accessLinkSchema);