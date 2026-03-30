import Course from "../models/Course.js";

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public or Private depending on needs
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

    const course = new Course({
      title,
      description,
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
