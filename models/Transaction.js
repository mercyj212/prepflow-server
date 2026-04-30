import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
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
        amount: {
            type: Number,
            required: true,
        },
        reference: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        paystackResponse: {
            type: Object,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
