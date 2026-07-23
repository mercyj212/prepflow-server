import mongoose from "mongoose";

const courseNoteSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    chapterTitle: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// Optional: compound index to quickly fetch notes for a course ordered by chapter
courseNoteSchema.index({ course: 1, order: 1 });

const CourseNote = mongoose.model("CourseNote", courseNoteSchema);

export default CourseNote;
