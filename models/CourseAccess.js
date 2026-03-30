import mongoose from "mongoose";

const courseAccessSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        accessToken: {
            type: String,
            required: true,
            unique: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        firstUsedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

courseAccessSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("CourseAccess", courseAccessSchema);