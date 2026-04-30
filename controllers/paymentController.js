import Transaction from "../models/Transaction.js";
import Course from "../models/Course.js";
import CourseAccess from "../models/CourseAccess.js";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const initializeTransaction = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Paystack amount is in kobo (multiply by 100)
        const amount = (course.price || 0) * 100;
        
        // If course is free, we might handle it differently, but for now let's assume it has a price
        if (amount <= 0) {
            return res.status(400).json({ message: "This course is free or price not set" });
        }

        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: req.user.email,
                amount: amount,
                callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
                metadata: {
                    courseId,
                    studentId,
                },
            }),
        });

        const data = await response.json();

        if (!data.status) {
            return res.status(400).json({ message: data.message });
        }

        // Create a pending transaction
        await Transaction.create({
            student: studentId,
            course: courseId,
            amount: course.price,
            reference: data.data.reference,
            status: "pending",
        });

        res.status(200).json(data.data);
    } catch (error) {
        console.error("Initialize Transaction Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const verifyTransaction = async (req, res) => {
    try {
        const { reference } = req.params;

        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
        });

        const data = await response.json();

        if (data.status && data.data.status === "success") {
            const { courseId, studentId } = data.data.metadata;

            // Update transaction status
            const transaction = await Transaction.findOneAndUpdate(
                { reference },
                { status: "success", paystackResponse: data.data },
                { new: true }
            );

            if (transaction) {
                // Grant access to the course
                // Generate a random access token for the CourseAccess model
                const accessToken = crypto.randomBytes(16).toString("hex");

                await CourseAccess.findOneAndUpdate(
                    { student: studentId, course: courseId },
                    { 
                        student: studentId, 
                        course: courseId, 
                        accessToken, 
                        isActive: true,
                        isUsed: true,
                        firstUsedAt: new Date()
                    },
                    { upsert: true, new: true }
                );
            }

            return res.status(200).json({ 
                message: "Payment successful", 
                courseId 
            });
        }

        res.status(400).json({ message: "Payment verification failed" });
    } catch (error) {
        console.error("Verify Transaction Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        // Validate webhook signature
        const hash = crypto
            .createHmac("sha512", PAYSTACK_SECRET)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (hash !== req.headers["x-paystack-signature"]) {
            return res.status(401).send("Invalid signature");
        }

        const event = req.body;
        if (event.event === "charge.success") {
            const { reference, metadata } = event.data;
            const { courseId, studentId } = metadata;

            // Update transaction
            await Transaction.findOneAndUpdate(
                { reference },
                { status: "success", paystackResponse: event.data }
            );

            // Grant access
            const accessToken = crypto.randomBytes(16).toString("hex");
            await CourseAccess.findOneAndUpdate(
                { student: studentId, course: courseId },
                { 
                    student: studentId, 
                    course: courseId, 
                    accessToken, 
                    isActive: true,
                    isUsed: true,
                    firstUsedAt: new Date()
                },
                { upsert: true }
            );
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: error.message });
    }
};
