import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";

// @desc    Get all faculties (optionally filter by path)
// @route   GET /api/faculties?path=university
// @access  Public
export const getFaculties = async (req, res) => {
  try {
    const filter = {};
    if (req.query.path) filter.path = req.query.path;
    const faculties = await Faculty.find(filter).sort({ name: 1 });
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a faculty
// @route   POST /api/faculties
// @access  Private/Admin
export const createFaculty = async (req, res) => {
  const { name, path, description } = req.body;
  if (!name || !path) {
    return res.status(400).json({ message: "Name and path are required" });
  }
  try {
    const exists = await Faculty.findOne({ name: name.trim(), path });
    if (exists) {
      return res.status(400).json({ message: "Faculty already exists for this path" });
    }
    const faculty = await Faculty.create({ name: name.trim(), path, description: description || "" });
    res.status(201).json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a faculty
// @route   PUT /api/faculties/:id
// @access  Private/Admin
export const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const { name, path, description } = req.body;
    if (name) faculty.name = name.trim();
    if (path) faculty.path = path;
    if (description !== undefined) faculty.description = description;

    const updated = await faculty.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a faculty (also deletes child departments)
// @route   DELETE /api/faculties/:id
// @access  Private/Admin
export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    // Cascade delete departments
    await Department.deleteMany({ faculty: faculty._id });
    await Faculty.deleteOne({ _id: faculty._id });

    res.json({ message: "Faculty and its departments removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
