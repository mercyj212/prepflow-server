import Student from "../models/Student.js";
import Quiz from "../models/Quiz.js";
import CourseAccess from "../models/CourseAccess.js";

// @desc    Get questions for PrepDrive
// @route   GET /api/game/questions
// @access  Private
export const getQuestions = async (req, res) => {
  try {
    const { courseId } = req.query;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Select a paid course to start this game."
      });
    }

    if (req.user?.role !== "admin") {
      const access = await CourseAccess.findOne({
        student: req.user._id,
        course: courseId,
        isActive: true
      });

      if (!access) {
        return res.status(403).json({
          success: false,
          message: "Pay for this course to unlock its game."
        });
      }
    }

    const quizzes = await Quiz.find({ course: courseId }).limit(5);

    let questions = [];
    
    if (quizzes.length > 0) {
      quizzes.forEach(quiz => {
        questions.push(...quiz.questions);
      });
      // Shuffle and take up to 20
      questions = questions.sort(() => 0.5 - Math.random()).slice(0, 20);
    }
    
    // Map to game format: { q: "text", a: ["opt1", "opt2", "opt3", "opt4"], c: correctIndex, expl: "explanation" }
    const formattedQuestions = questions.map(q => {
      let correctIndex = 0;
      const options = q.options.map((opt, idx) => {
        if (opt.isCorrect) correctIndex = idx;
        return opt.text;
      });
      return {
        q: q.text,
        a: options,
        c: correctIndex,
        expl: q.explanation || "Review this topic carefully."
      };
    });

    res.status(200).json({ success: true, data: formattedQuestions });
  } catch (error) {
    console.error("Error fetching game questions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch questions" });
  }
};

// @desc    Get courses that have questions
// @route   GET /api/game/courses
// @access  Private
export const getCoursesWithQuestions = async (req, res) => {
  try {
    // Find all quizzes that have questions
    const quizzes = await Quiz.find({ "questions.0": { $exists: true } }).populate({
      path: "course",
      select: "title description path level department price",
      populate: {
        path: "department",
        select: "name faculty",
        populate: { path: "faculty", select: "name path" }
      }
    });

    const accessedCourseIds = req.user?.role === "admin"
      ? []
      : (await CourseAccess.find({ student: req.user._id, isActive: true })).map(access => access.course.toString());
    
    // Extract unique courses
    const courseMap = new Map();
    quizzes.forEach(quiz => {
      if (quiz.course && !courseMap.has(quiz.course._id.toString())) {
        const course = quiz.course.toObject();
        const hasPaidAccess = accessedCourseIds.includes(course._id.toString());
        const hasAdminAccess = req.user?.role === "admin";
        course.hasGameAccess = hasAdminAccess || hasPaidAccess;
        course.gameAccessReason = hasAdminAccess ? "admin" : hasPaidAccess ? "paid" : "locked";
        course.faculty = course.department?.faculty || null;
        courseMap.set(course._id.toString(), course);
      }
    });
    
    const courses = Array.from(courseMap.values());
    
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Error fetching game courses:", error);
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
};

// @desc    Save game score
// @route   POST /api/game/score
// @access  Private
export const saveScore = async (req, res) => {
  try {
    const { score, awards } = req.body;
    const studentId = req.user._id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Update if new score is higher
    if (score > student.prepDriveScore) {
      student.prepDriveScore = score;
    }
    
    // Always add awards
    student.prepDriveAwards = (student.prepDriveAwards || 0) + awards;

    await student.save();
    
    res.status(200).json({ success: true, data: { score: student.prepDriveScore, awards: student.prepDriveAwards } });
  } catch (error) {
    console.error("Error saving game score:", error);
    res.status(500).json({ success: false, message: "Failed to save score" });
  }
};

// @desc    Get Global Leaderboard
// @route   GET /api/game/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const topDrivers = await Student.find({ prepDriveScore: { $gt: 0 } })
      .sort({ prepDriveScore: -1 })
      .limit(10)
      .select("fullName profilePicture prepDriveScore prepDriveAwards");
      
    res.status(200).json({ success: true, data: topDrivers });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
};
