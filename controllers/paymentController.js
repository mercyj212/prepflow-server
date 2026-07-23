import Transaction from "../models/Transaction.js";
import Course from "../models/Course.js";
import CourseAccess from "../models/CourseAccess.js";
import crypto from "crypto";

const getPaystackSecret = () => (process.env.PAYSTACK_SECRET_KEY || "").trim();
const getPaymentBrandName = () => process.env.PAYMENT_BRAND_NAME || "PrepUp CBT";
const getPaymentSupportEmail = () => process.env.PAYMENT_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL || "";

const getFrontendUrl = (req) => {
    const origin = req.get("origin");
    return (origin || process.env.FRONTEND_URL || "https://prepupcbt.vercel.app").replace(/\/$/, "");
};

const finalizeSuccessfulPayment = async ({ transaction, paystackData }) => {
    const paidAt = paystackData?.paid_at ? new Date(paystackData.paid_at) : new Date();
    const studentId = transaction.student;
    const courseId = transaction.course;

    await Transaction.findOneAndUpdate(
        { _id: transaction._id },
        {
            $set: {
                status: "success",
                paidAt,
                paystackResponse: paystackData,
            },
        },
        { new: true }
    );

    const accessToken = crypto.randomBytes(16).toString("hex");

    await CourseAccess.findOneAndUpdate(
        { student: studentId, course: courseId },
        {
            student: studentId,
            course: courseId,
            accessToken,
            isActive: true,
            isUsed: true,
            firstUsedAt: new Date(),
        },
        { upsert: true, new: true }
    );
};

export const initializeTransaction = async (req, res) => {
    try {
        const secret = (process.env.PAYSTACK_SECRET_KEY || "").trim();

        const { courseId } = req.body;
        const studentId = req.user._id;
        const brandName = getPaymentBrandName();
        const supportEmail = getPaymentSupportEmail();

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
                Authorization: `Bearer ${secret}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: req.user.email,
                amount: amount,
                callback_url: `${getFrontendUrl(req)}/payment/verify`,
                metadata: {
                    courseId,
                    studentId,
                    brandName,
                    supportEmail,
                    custom_fields: [
                        {
                            display_name: "Business Name",
                            variable_name: "business_name",
                            value: brandName,
                        },
                        ...(supportEmail ? [{
                            display_name: "Support Email",
                            variable_name: "support_email",
                            value: supportEmail,
                        }] : []),
                        {
                            display_name: "Course",
                            variable_name: "course",
                            value: course.title,
                        },
                    ],
                },
            }),
        });

        const data = await response.json();

        if (!data.status) {
            const message = data.message === "Invalid key"
                ? "Paystack secret key is invalid. Check PAYSTACK_SECRET_KEY in the server environment."
                : data.message;
            const statusCode = response.status === 401 ? 500 : 400;
            return res.status(statusCode).json({ message });
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
        res.status(500).json({ message: "Could not initialize payment. Please try again." });
    }
};

export const verifyTransaction = async (req, res) => {
    try {
        const { reference } = req.params;
        const secret = getPaystackSecret();

        const existingTransaction = await Transaction.findOne({
            reference,
            student: req.user._id,
        });

        if (!existingTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        const fullCourse = await Course.findById(existingTransaction.course).populate({
            path: "department",
            populate: { path: "faculty" }
        });

        const coursePayload = fullCourse ? {
            _id: fullCourse._id,
            title: fullCourse.title,
            path: fullCourse.path || fullCourse.department?.faculty?.path || "polytechnic",
            facultyId: fullCourse.department?.faculty?._id || null,
            departmentId: fullCourse.department?._id || null
        } : null;

        // If already finalized, return success immediately
        if (existingTransaction.status === "success") {
            return res.status(200).json({ 
                message: "Payment already verified", 
                courseId: existingTransaction.course,
                course: coursePayload
            });
        }

        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${secret}`,
            },
        });

        const data = await response.json();

        if (data.status && data.data.status === "success") {
            const { courseId, studentId } = data.data.metadata || {};
            const expectedAmount = Number(existingTransaction.amount) * 100;

            if (
                (studentId && studentId.toString() !== req.user._id.toString())
                || (courseId && courseId.toString() !== existingTransaction.course.toString())
                || Number(data.data.amount) !== expectedAmount
            ) {
                return res.status(403).json({ message: "Payment verification mismatch" });
            }

            await finalizeSuccessfulPayment({
                transaction: existingTransaction,
                paystackData: data.data,
            });

            return res.status(200).json({ 
                message: "Payment successful", 
                courseId: existingTransaction.course,
                course: coursePayload
            });
        }

        res.status(400).json({ message: "Payment verification failed" });
    } catch (error) {
        console.error("Verify Transaction Error:", error);
        res.status(500).json({ message: "Could not verify payment. Please try again." });
    }
};



export const handleWebhook = async (req, res) => {
    try {
        // Validate webhook signature
        const secret = getPaystackSecret();
        const rawBody = Buffer.isBuffer(req.body)
            ? req.body
            : Buffer.from(JSON.stringify(req.body));
        const hash = crypto
            .createHmac("sha512", secret)
            .update(rawBody)
            .digest("hex");

        if (hash !== req.headers["x-paystack-signature"]) {
            return res.status(401).send("Invalid signature");
        }

        const event = Buffer.isBuffer(req.body)
            ? JSON.parse(req.body.toString("utf8"))
            : req.body;

        if (event.event === "charge.success") {
            const { reference, metadata } = event.data;
            const { courseId, studentId } = metadata;
            const transaction = await Transaction.findOne({ reference });

            if (!transaction) {
                return res.sendStatus(200);
            }

            if (
                transaction.student.toString() !== studentId?.toString()
                || transaction.course.toString() !== courseId?.toString()
                || Number(event.data.amount) !== Number(transaction.amount) * 100
            ) {
                console.warn(`[PAYSTACK WEBHOOK]: Ignored mismatched transaction ${reference}`);
                return res.sendStatus(200);
            }

            await finalizeSuccessfulPayment({
                transaction,
                paystackData: event.data,
            });
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};
