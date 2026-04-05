import Student from "../models/Student.js";
import AccessLink from "../models/AccessLink.js";
import generateToken from "../utils/generateToken.js";

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

export const getAllStudentsCount = async (req, res) => {
    try {
        const count = await Student.countDocuments({ role: 'student' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};