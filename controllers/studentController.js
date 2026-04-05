import Student from "../models/Student.js";
import AccessLink from "../models/AccessLink.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/emailService.js";

// @desc    Create student access manually
export const createStudentAccess = async (req, res) => {
    try {
        const { fullName, email, phone } = req.body;

        const student = await Student.create({ 
            fullName, 
            email, 
            phone,
            haspaid: true,
            accessStatus: "active"});

        const token = generateToken();
        const accessLink = await AccessLink.create({
            student: student._id,
            token,
            isActive: true,
        });

        res.status(201).json({
            message: "Access created",
            link: `http://localhost:5173/access/${token}`,
            student,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get total count of scholars
export const getAllStudentsCount = async (req, res) => {
    try {
        const count = await Student.countDocuments({ role: 'student' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all scholars for the registry
export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({ role: 'student' })
            .select('-password')
            .sort({ lastLogin: -1, createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a scholar from the platform
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Scholar not found" });
        }
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Scholar removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a custom manual email to a scholar
export const sendScholarEmail = async (req, res) => {
    try {
        const { id, subject, message } = req.body;
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: "Scholar not found" });
        }

        await sendEmail({
            email: student.email,
            subject: subject || "Update from PrepUp CBT",
            message: message,
        });

        res.json({ message: `Message successfully dispatched to ${student.fullName}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};