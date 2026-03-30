import Student from "../models/Students.js";
import Course from "../models/Course.js";
import CourseAccess from "../models/CourseAccess.js";
import generateToken from "../utils/generateToken.js";

export const createCourseAccess = async (req, res) => {
    try {
        const { fullName, email, phone, courseTitle, courseCode, description } = req.body;

        if (!fullName || !phone || !courseTitle || !courseCode) {
            return res.status(400).json({
                message: "fullName, phone, courseTitle, and courseCode are required",
            });
        }

        let student = await Student.findOne({ phone });

        if (!student) {
            student = await Student.create({
                fullName,
                email: email || "",
                phone,
                accessStatus: "active",
            });
        }

        let course = await Student.findOne({ phone });

        if (!student) {
            student = await Student.create({
                fullName,
                email: email || "",
                phone,
                accessStatus: "active",
            });
        }

        let course = await Course.findOne({ code: courseCode.toUpperCase() });
    }
}