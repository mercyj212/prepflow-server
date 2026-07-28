require('dotenv').config();
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const courseNoteSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    chapterTitle: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);
const CourseNote = mongoose.model("CourseNote", courseNoteSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const course = await db.collection('courses').findOne({ title: 'AIT 313 - ARTIFICIAL INTELLIGENCE' });
  if (!course) {
    console.log('Course not found');
    process.exit(1);
  }

  // Delete all existing notes for this course
  await CourseNote.deleteMany({ course: course._id });

  const chapters = [
    {
      chapterTitle: "Course Information",
      order: 1,
      content: `## 1. Course Information

*   **Course Title:** Artificial Intelligence
*   **Course Code:** AIT 313
*   **Lecture Days:** Monday, 9:00 AM, Auditorium
*   **Lecturer:** Mrs. Linda`
    },
    {
      chapterTitle: "Introduction to Artificial Intelligence",
      order: 2,
      content: `## 2. Introduction to Artificial Intelligence

### 2.1. The Concept of Artificial Intelligence (AI)

Artificial Intelligence refers to the ability of machines to perform tasks that typically require human intelligence.
*   It is a field of computer science dedicated to creating machines capable of performing human-like tasks.
*   AI research involves developing methods and software that enable machines to perceive their environment, learn, and apply intelligence to take actions that maximize their chances of achieving defined goals.
*   In simple terms, AI is intelligence exhibited by machines, particularly computer systems.

### 2.2. History of Artificial Intelligence

*   **Foundational Ideas:** The study of mechanical reasoning led to the theory of computation, which deals with problems solvable by algorithms, their efficiency, and solvability.
*   **Early Developments (1940s-1950s):**
    *   **1943:** McCulloch-Pitts designed artificial neurons, a key development in AI.
    *   **1950:** Alan Turing's research paper "Computing Machinery and Intelligence" demonstrated the possibility of machine intelligence.
*   **The Golden Years (1956-1960s):**
    *   **1956:** The "Artificial Intelligence" field was founded at Dartmouth College, with attendees becoming leaders in AI research in the 1960s.
    *   Early AI programs produced astonishing results, including:
        *   Learning checkers strategies.
        *   Solving world problems in algebra.
        *   Proving logical theories.
        *   Speaking English (in 1965).
    *   **Optimistic Predictions:**
        *   **1965 (Herbert Simon):** Predicted machines would perform any work a man can do within 20 years.
        *   **1967 (Marvin Minsky):** Agreed with Simon, believing the problem of creating AI would be solved within a generation (though this underestimated the difficulty).
*   **The First AI Winter (1974-Early 1980s):**
    *   **1974:** US and British governments cut off research funding due to criticism (e.g., Sir James Lighthill's report) about the lack of major impact from AI discoveries and pressure for more productive projects.
    *   This period saw difficulty in obtaining funding for AI projects.
*   **Revival and Second AI Winter (1980s-1990s):**
    *   AI research experienced a revival driven by commercial expert systems, which simulated analytical skills.
    *   The market for AI increased drastically in the 1980s.
    *   Japan's 5th generation computer project inspired the US and British governments to restore funding for academic AI research.
    *   **1987:** The Lisp machine market collapsed, leading to a second AI winter.
*   **Modern AI Resurgence (Late 1990s-Present):**
    *   AI gradually restored its reputation in the late 1990s by exploiting formal mathematical methods and finding specific solutions to problems.
    *   **2000s:** Solutions developed by AI researchers became widely used.
    *   **2002:** The subfield of Artificial General Intelligence (AGI) emerged.`
    },
    {
      chapterTitle: "Machine Learning (ML)",
      order: 3,
      content: `## 3. Machine Learning (ML)

### 3.1. Definition and How it Works

*   Machine Learning is a subfield of Artificial Intelligence.
*   It allows systems to learn and improve from experience without being explicitly programmed.
*   ML systems gain the ability to learn through data, statistics, and trial and error to optimize their solutions.
*   It studies how to make machines more human-like in their behaviors by giving them the ability to learn and develop their own programs.
*   In ML, input data along with the desired output is fed to the machine during the learning phase, and the machine works out a program for itself.

### 3.2. Types of Machine Learning

There are three main types of Machine Learning:

#### 3.2.1. Supervised Learning

*   **Concept:** The algorithm is trained using **labeled data**, where each input data set is associated with a known, correct output. It follows a set of rules for problem-solving operations.
*   **Purpose:** Classification or Regression.
    *   **Classification:** Assigns data into specific categories.
    *   **Regression:** Predicts the probability of an event taking place based on prior insights and training data.
*   **Real-world Use Cases/Application Forms:**
    *   **Image Classification:** Identifying objects in an image (e.g., recognizing a cat).
    *   **Spam Filtering:** Classifying emails as spam or not spam.
    *   **Loan Eligibility Prediction:** Determining if a person is likely to be approved based on their financial data.
    *   **Price Prediction:** Training systems to forecast future prices of stocks or products.
    *   **Medical Diagnosis:** (Example for classification)
    *   **Forecasting:** (Example for regression)

#### 3.2.2. Unsupervised Learning

*   **Concept:** The algorithm learns patterns and structures from **unlabeled data** without any guidance on the desired output. It groups unsorted data according to similarities and differences due to the lack of labels.
*   **Purpose:** To identify associations, connections, and relationships among elements in a dataset.
*   **Real-world Use Cases/Application Forms:**
    *   **Customer Segmentation:** Grouping customers into different segments based on their buying behaviors.
    *   **Anomaly Detection:** Identifying unusual data points that deviate from the norm (e.g., detecting fraudulent transactions).
    *   **Dimensionality Reduction:** Simplifying complex datasets by reducing the number of features.
    *   **Recommendation Systems:** Training systems to suggest products or content to users based on their past interactions.

#### 3.2.3. Reinforcement Learning

*   **Concept:** A learning approach where an agent learns to make decisions by interacting with an environment. It receives feedback in the form of rewards or penalties for actions performed. A reward point for a correct option, a penalty point for a wrong response.
*   **Real-world Use Cases/Application Forms:**
    *   **Self-Driving Cars:** Training an agent to navigate roads by interacting with the environment and receiving rewards for successful navigation.
    *   **Robotics:** Training robots to perform complex tasks by rewarding desired behaviors.
    *   **Game Playing:** Developing AI agents that can play games like chess or other online games.

#### 3.2.4. Semi-Supervised Learning

*   **Concept:** Deals with both labeled and unlabeled data.

### 3.3. Advantages and Disadvantages of Machine Learning

#### 3.3.1. Advantages:
*   Can be used for pattern dictation.
*   Can be used to make predictions about future data.
*   Can generate new features from data automatically.

#### 3.3.2. Disadvantages:
*   Has a potential for bias in data.
*   Can lead to overfitting of data.
*   Lacks explainability.

### 3.4. Machine Learning Processes

Understanding how machine learning works involves a step-by-step process that transforms raw data into valuable insights. The following steps are involved:

1.  **Data Collection:**
    *   **First step:** Data is crucial as its quality and quantity directly impact model performance.
    *   Data can be collected from various sources (databases, text files, images, audio files).
    *   Collected data must be prepared and relevant to the problem to be solved.
2.  **Data Pre-processing:**
    *   **Crucial step:** Involves cleaning, handling missing data, and normalizing the data.
    *   Improves data quality, ensures the ML model can interpret data correctly, and significantly improves model accuracy.
3.  **Choosing the Right Model:**
    *   After data preparation, the next step is to select the appropriate ML model.
    *   Many types of ML models exist (e.g., linear regression, decision trees, neural networks).
    *   The choice depends on the nature of the data and the problem being solved.
4.  **Training the Model:**
    *   Feeding the prepared data into the model, allowing it to adjust its internal parameters to better predict the output.
    *   **Avoid Overfitting:** A case where the model performs well on the training data but poorly on new data.
    *   **Avoid Underfitting:** A case where the model performs poorly on both the training data and new data.
5.  **Evaluating the Model:**
    *   Essential to evaluate the model's performance on unseen data before deployment.
    *   Monitoring continues after deployment to detect "model drift," which occurs when performance declines due to changes in data patterns.
6.  **Hyperparameter Tuning and Optimization:**
    *   **Model Parameters:** Configuration variables internal to the model, whose values are estimated from the given data and are required for making predictions.
    *   **Hyperparameters:** Configuration variables external to the model, whose values are not estimated from the data but are used in processes to estimate model parameters.
    *   Tuning and optimization techniques ensure the efficiency and accuracy of the ML model.
7.  **Predictions and Deployment:**
    *   Deploying the trained machine learning model into a production environment.
    *   Enables the model to deliver real-time predictions and insights.

### 3.5. Specific Types of ML Algorithms

Machine learning algorithms are methods by which AI systems predict output values from input data, typically involving classification or regression.

1.  **Linear Regression:**
    *   A supervised algorithm used to predict continuous numerical values that fluctuate or change over time.
    *   Can accurately predict variables like age or sales numbers over a period.
2.  **Logistic Regression:**
    *   A type of ML algorithm used in predictive modeling.
    *   Uses previous insights and observations to predict the probability of future events.
    *   A form of advanced analytics utilizing current data and historical data to forecast future activity. It focuses on binary classification.
3.  **Decision Tree:**
    *   A supervised learning algorithm used for both classification and regression problems.
    *   Decision trees divide datasets into different subsets by using a series of questions or conditions to determine which subset each data element belongs to.
4.  **Naive-Bayes Algorithm:**
    *   Performs classification.
    *   One of the simplest algorithms, it assumes that all features in the input data are independent of one another (one set of data will not affect the other when making predictions).
5.  **K-Means Algorithm:**
    *   An unsupervised learning algorithm.
    *   Identifies groups of unlabeled data and clusters them into different groups. It is one of the most popular clustering algorithms.
6.  **K-Nearest Neighbor (KNN) Algorithm:**
    *   An unsupervised learning algorithm (as described in the notes, though often used for supervised classification).
    *   Classifies data elements through proximity or similarity. A new element is grouped with the existing group it most closely resembles.`
    },
    {
      chapterTitle: "Major Artificial Intelligence Techniques",
      order: 4,
      content: `## 4. Major Artificial Intelligence Techniques

AI algorithms and techniques are computational methods that enable machines to perform human-intelligence tasks like learning, problem-solving, pattern recognition, and decision-making. These can be achieved using approaches such as Machine Learning, Natural Language Processing (NLP), Computer Vision, and Deep Learning. An AI algorithm is a set of rules or instructions designed to make data-based decisions and solve problems based on predefined data.

### 4.1. Machine Learning (ML)

(Already detailed above, but summarized here as a major technique)
*   Allows machines to learn and improve from experience.
    *   **Supervised Learning:** Learning from labeled data to predict correct output (e.g., linear regression, decision trees).
    *   **Unsupervised Learning:** Learning patterns from unlabeled data (e.g., clustering algorithms).
    *   **Reinforcement Learning:** Learning through trials and error by receiving rewards or penalties for actions.

### 4.2. Natural Language Processing (NLP)

*   A major artificial intelligence technique that allows computers and people to interact.
*   It is made up of a set of techniques that allow computers and humans to communicate.
*   Includes:
    *   Test analysis
    *   Machine translation
    *   Dialog/conversation systems`
    }
  ];

  for (const chapter of chapters) {
    await CourseNote.create({
      course: course._id,
      chapterTitle: chapter.chapterTitle,
      content: chapter.content,
      order: chapter.order
    });
  }

  console.log('Successfully created separate chapters for AIT 313');
  process.exit(0);
}

main().catch(console.error);
