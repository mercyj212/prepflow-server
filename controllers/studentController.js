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
            message: "Access granted",
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
            return res.status(404).json({ message: "Student record not found" });
        }
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: "Student account removed successfully" });
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
            return res.status(404).json({ message: "Student record not found" });
        }

        await sendEmail({
            email: student.email,
            subject: subject || "Update from PrepUp",
            message: message,
        });

        res.json({ message: `Email successfully sent to ${student.fullName}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a global email blast to EVERY scholar
export const sendScholarBlast = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const students = await Student.find({ role: 'student' });

        if (students.length === 0) {
            return res.status(404).json({ message: "No registered students found for broadcast." });
        }

        // 🚀 Dispatching across the grid (Parallel Execution)
        const dispatchPromises = students.map(scholar => 
            sendEmail({
                email: scholar.email,
                subject: subject || "Global Announcement: PrepUp",
                message: message,
            }).catch(err => console.error(`[BLAST DELAY]: Failed for ${scholar.email}: ${err.message}`))
        );

        await Promise.all(dispatchPromises);

        res.json({ message: `Broadcast successfully sent to ${students.length} students!` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};