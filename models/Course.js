import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "pdf", "other"], default: "other" },
  publicId: { type: String }, // cloudinary public_id for deletion
  uploadedAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        // ── Hierarchy Fields ──────────────────────────────────
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },
        level: {
            type: String,
            enum: ["100L", "200L", "300L", "400L", "500L", "ND1", "ND2", "HND1", "HND2", null],
            default: null,
        },
        path: {
            type: String,
            enum: ["university", "polytechnic", "entrance", null],
            default: null,
        },
        materials: [materialSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);