import Course from "../models/Course.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  const { title, description } = req.body;
  try {
    const courseExists = await Course.findOne({ title: title.toUpperCase() });
    if (courseExists) {
      return res.status(400).json({ message: "Course already exists" });
    }

    const course = new Course({ title, description });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename a course
// @route   PUT /api/courses/:id/rename
// @access  Private/Admin
export const renameCourse = async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if another course already uses this title
    const duplicate = await Course.findOne({
      title: title.trim().toUpperCase(),
      _id: { $ne: course._id },
    });
    if (duplicate) {
      return res.status(400).json({ message: "A course with that title already exists" });
    }

    course.title = title.trim();
    const updated = await course.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload material (image or PDF) to a course
// @route   POST /api/courses/:id/materials
// @access  Private/Admin
export const uploadMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const isPdf = req.file.mimetype === "application/pdf";
    const material = {
      name: req.file.originalname,
      url: req.file.path,          // Cloudinary secure URL
      publicId: req.file.filename, // Cloudinary public_id
      type: isPdf ? "pdf" : "image",
    };

    course.materials.push(material);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a material from a course
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private/Admin
export const deleteMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const material = course.materials.id(req.params.materialId);
    if (!material) return res.status(404).json({ message: "Material not found" });

    // Remove from Cloudinary
    if (material.publicId) {
      const resourceType = material.type === "pdf" ? "raw" : "image";
      try {
        await cloudinary.uploader.destroy(material.publicId, { resource_type: resourceType });
      } catch (cdnErr) {
        console.warn("Cloudinary deletion warning:", cdnErr.message);
      }
    }

    material.deleteOne();
    await course.save();
    res.json({ message: "Material removed", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Clean up all cloudinary materials
    for (const mat of course.materials) {
      if (mat.publicId) {
        const resourceType = mat.type === "pdf" ? "raw" : "image";
        try {
          await cloudinary.uploader.destroy(mat.publicId, { resource_type: resourceType });
        } catch (e) {
          console.warn("Cloudinary cleanup warning:", e.message);
        }
      }
    }

    await Course.deleteOne({ _id: course._id });
    res.json({ message: "Course removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
