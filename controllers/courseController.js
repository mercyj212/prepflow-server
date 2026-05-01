import Course from "../models/Course.js";
import Student from "../models/Student.js";
import CourseAccess from "../models/CourseAccess.js";
import sendEmail from "../utils/emailService.js";
import { cloudinary } from "../config/cloudinary.js";

// @desc    Get all courses (optionally filter by department, level)
// @route   GET /api/courses?department=&level=
// @access  Public (Access checked if logged in)
export const getCourses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.path) filter.path = req.query.path;

    let courses = await Course.find(filter)
      .populate({
        path: "department",
        select: "name faculty",
        populate: { path: "faculty", select: "name path" },
      })
      .sort({ title: 1 });

    courses = courses.map((course) => {
      const courseObj = course.toObject();
      courseObj.faculty = courseObj.department?.faculty || null;
      return courseObj;
    });

    if (req.user && req.user.role === "student") {
      const studentAccess = await CourseAccess.find({ student: req.user._id, isActive: true });
      const accessedCourseIds = studentAccess.map((access) => access.course.toString());

      courses = courses.map((course) => ({
        ...course,
        hasAccess: accessedCourseIds.includes(course._id.toString()),
      }));
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  const { title, description, department, level, path } = req.body;

  try {
    const courseExists = await Course.findOne({ title: title.toUpperCase() });
    if (courseExists) {
      return res.status(400).json({ message: "Course already exists" });
    }

    const course = new Course({
      title,
      description,
      department: department || null,
      level: level || null,
      path: path || null,
    });
    const createdCourse = await course.save();

    if (req.body.notifyStudents) {
      handleAutoBroadcast(createdCourse.title);
    }

    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const handleAutoBroadcast = async (courseTitle) => {
  try {
    const students = await Student.find({ role: "student" });
    if (!students || students.length === 0) return;

    const subject = `New Curriculum: ${courseTitle} is now available!`;
    const loginUrl = `${process.env.FRONTEND_URL || "https://prepupcbt.vercel.app"}/login`;

    console.log(`[AUTO-BROADCAST]: Starting for ${students.length} students...`);

    for (const student of students) {
      try {
        await sendEmail({
          email: student.email,
          subject,
          template: "courseUpdate",
          context: {
            name: student.fullName,
            courseTitle,
            loginUrl,
          },
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`[AUTO-BROADCAST][FAILED]: ${student.email} - ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log(`[AUTO-BROADCAST]: Successfully completed for "${courseTitle}".`);
  } catch (err) {
    console.error("[AUTO-BROADCAST][CRITICAL ERROR]:", err);
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
      url: req.file.path,
      publicId: req.file.filename,
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

// @desc    Update a course (price, title, description, etc.)
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const allowedFields = ["price", "title", "description", "level", "path"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    const updated = await course.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
