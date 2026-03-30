import AccessLink from "../models/AccessLink.js";

export const verifyAccessLink = async (req, res) => {
    try {
        const { token } = req.params;

        const accessLink = await AccessLink.findOne({ token }).populate('student');

        if (!accessLink) {
            return res.status(404).json({ message: "Invalid link" });
        }

        if (!accessLink.isActive) {
            return res.status(403).json({ message: "Link is inactive" });
        }

        if (accessLink.expiresAt && 
            new Date(accessLink.expiresAt).getTime() < Date.now()
        ) {
            return res.status(403).json({ message: "Link expired"});
        }

        if (!accessLink.student || accessLink.student.accessStatus !== "active") {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json({ 
            message: "Access granted",
            student: accessLink.student,
        });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };