import Department from "../models/Department.js";

// @desc    Get all departments (optionally filter by faculty)
// @route   GET /api/departments?faculty=:id
// @access  Public
export const getDepartments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.faculty) filter.faculty = req.query.faculty;
    const departments = await Department.find(filter)
      .populate("faculty", "name path")
      .sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req, res) => {
  const { name, faculty, description } = req.body;
  if (!name || !faculty) {
    return res.status(400).json({ message: "Name and faculty are required" });
  }
  try {
    const exists = await Department.findOne({ name: name.trim(), faculty });
    if (exists) {
      return res.status(400).json({ message: "Department already exists in this faculty" });
    }
    const department = await Department.create({
      name: name.trim(),
      faculty,
      description: description || "",
    });
    const populated = await department.populate("faculty", "name path");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    const { name, faculty, description } = req.body;
    if (name) dept.name = name.trim();
    if (faculty) dept.faculty = faculty;
    if (description !== undefined) dept.description = description;

    const updated = await dept.save();
    res.json(await updated.populate("faculty", "name path"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    await Department.deleteOne({ _id: dept._id });
    res.json({ message: "Department removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
