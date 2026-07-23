import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Quiz from '../models/Quiz.js';
import Student from '../models/Student.js';
import CourseAccess from '../models/CourseAccess.js';
import Transaction from '../models/Transaction.js';

const questions = [
  // ── SECTION 1: CONCEPT & DEFINITION OF AI (Q1 - Q15) ──────────────────
  {
    questionText: "What is Artificial Intelligence (AI) as defined in computer science?",
    options: [
      { optionText: "The ability of machines to perform tasks that usually require human intelligence", isCorrect: true },
      { optionText: "The automated repair of hardware components without software intervention", isCorrect: false },
      { optionText: "A database system strictly used for storing high-volume unstructured logs", isCorrect: false },
      { optionText: "The mechanical assembly of computer parts in manufacturing plants", isCorrect: false }
    ],
    explanation: "Artificial Intelligence refers to the ability of machines to perform tasks that usually require human intelligence."
  },
  {
    questionText: "Which academic discipline studies how to develop software that enables machines to perceive their environment and take action?",
    options: [
      { optionText: "Computer Science", isCorrect: true },
      { optionText: "Civil Engineering", isCorrect: false },
      { optionText: "Mechanical Drafting", isCorrect: false },
      { optionText: "Accounting & Auditing", isCorrect: false }
    ],
    explanation: "AI is a field of research in computer science that studies software methods to perceive environments and take action."
  },
  {
    questionText: "In simple terms, Artificial Intelligence is best described as:",
    options: [
      { optionText: "Intelligence exhibited by machines, particularly computer systems", isCorrect: true },
      { optionText: "A physical robot designed for heavy industrial welding", isCorrect: false },
      { optionText: "An operating system used exclusively on supercomputers", isCorrect: false },
      { optionText: "A manual data entry procedure performed by human clerks", isCorrect: false }
    ],
    explanation: "In simple terms, Artificial Intelligence is intelligence exhibited by machines, particularly computer systems."
  },
  {
    questionText: "What is the primary objective of software methods used in Artificial Intelligence?",
    options: [
      { optionText: "To take actions that maximize their chances of achieving defined goals", isCorrect: true },
      { optionText: "To decrease the clock speed of central processing units", isCorrect: false },
      { optionText: "To convert digital audio signals into analog radio frequencies", isCorrect: false },
      { optionText: "To restrict computers from processing non-textual data", isCorrect: false }
    ],
    explanation: "AI software enables machines to perceive their environment and take actions that maximize their chances of achieving defined goals."
  },
  {
    questionText: "Which of the following capabilities is NOT typically associated with Artificial Intelligence?",
    options: [
      { optionText: "Manual hardware soldering without electrical power", isCorrect: true },
      { optionText: "Perceiving the surrounding environment", isCorrect: false },
      { optionText: "Learning from historical data and experience", isCorrect: false },
      { optionText: "Problem solving and logical decision making", isCorrect: false }
    ],
    explanation: "AI focuses on perceiving, learning, and decision-making, not manual hardware assembly."
  },
  {
    questionText: "Which core process allows an AI machine to improve its performance over time?",
    options: [
      { optionText: "Use of learning and intelligence to adapt from feedback", isCorrect: true },
      { optionText: "Reformatting the hard drive every 24 hours", isCorrect: false },
      { optionText: "Increasing the physical voltage of the power supply", isCorrect: false },
      { optionText: "Shutting down the system when data is received", isCorrect: false }
    ],
    explanation: "AI software enables machines to perceive environments and use learning and intelligence to maximize goal achievement."
  },
  {
    questionText: "Which of the following is a primary subfield of Artificial Intelligence covered in AIT 313?",
    options: [
      { optionText: "Machine Learning (ML)", isCorrect: true },
      { optionText: "Fluid Dynamics", isCorrect: false },
      { optionText: "Organic Chemistry", isCorrect: false },
      { optionText: "Structural Geology", isCorrect: false }
    ],
    explanation: "Machine Learning (ML) is a core subfield of Artificial Intelligence studied in AIT 313."
  },
  {
    questionText: "What enables an AI system to make decisions when faced with dynamic environment changes?",
    options: [
      { optionText: "Perception of environment coupled with reasoning algorithms", isCorrect: true },
      { optionText: "Hardcoded static print statements", isCorrect: false },
      { optionText: "Manual human keypresses for every individual decision", isCorrect: false },
      { optionText: "Disabling network connectivity", isCorrect: false }
    ],
    explanation: "AI combines environmental perception with reasoning and learning to make autonomous decisions."
  },
  {
    questionText: "Artificial Intelligence combines concepts from computer science with:",
    options: [
      { optionText: "Mathematics, logic, and data analysis", isCorrect: true },
      { optionText: "Petroleum refining and pipeline design", isCorrect: false },
      { optionText: "Textile manufacturing and weaving", isCorrect: false },
      { optionText: "Marine navigation charting", isCorrect: false }
    ],
    explanation: "AI integrates mathematics, logic, computation theory, and data analysis."
  },
  {
    questionText: "What distinguishes an intelligent machine from a basic calculator?",
    options: [
      { optionText: "The ability to learn, adapt, and perceive complex environments", isCorrect: true },
      { optionText: "The ability to perform basic addition", isCorrect: false },
      { optionText: "Having a liquid crystal display (LCD) screen", isCorrect: false },
      { optionText: "Operating on battery power", isCorrect: false }
    ],
    explanation: "Basic calculators execute static arithmetic, whereas AI machines perceive environments, learn, and adapt."
  },
  {
    questionText: "Which requirement is necessary for an AI model to achieve accurate real-world problem solving?",
    options: [
      { optionText: "Quality data, robust learning methods, and appropriate algorithms", isCorrect: true },
      { optionText: "Unlimited physical RAM without any software instructions", isCorrect: false },
      { optionText: "Storing data exclusively on optical CDs", isCorrect: false },
      { optionText: "Using only single-core processors built before 1990", isCorrect: false }
    ],
    explanation: "Effective AI requires quality data, learning methods, and suitable algorithms."
  },
  {
    questionText: "AI systems attempt to mimic which of the following human attributes?",
    options: [
      { optionText: "Cognitive functions such as reasoning, learning, and perception", isCorrect: true },
      { optionText: "Biological respiration and circulation", isCorrect: false },
      { optionText: "Physical muscle contraction", isCorrect: false },
      { optionText: "Cellular mitosis", isCorrect: false }
    ],
    explanation: "AI targets human cognitive functions like learning, reasoning, perception, and problem solving."
  },
  {
    questionText: "In AIT 313, what is the ultimate aim of building AI software?",
    options: [
      { optionText: "To create intelligent systems capable of autonomous problem solving", isCorrect: true },
      { optionText: "To replace all physical keyboards with punch cards", isCorrect: false },
      { optionText: "To eliminate the use of internet protocol addressing", isCorrect: false },
      { optionText: "To increase electricity consumption of data centers unnecessarily", isCorrect: false }
    ],
    explanation: "The goal of AI development is creating intelligent systems that solve problems autonomously."
  },
  {
    questionText: "Which statement accurately describes an AI agent?",
    options: [
      { optionText: "An entity that perceives its environment and acts upon it to achieve goals", isCorrect: true },
      { optionText: "A passive text file containing database records", isCorrect: false },
      { optionText: "A physical cable connecting routers to switches", isCorrect: false },
      { optionText: "A static graphics card driver", isCorrect: false }
    ],
    explanation: "An AI agent is an entity that senses/perceives its environment and acts upon it toward a goal."
  },
  {
    questionText: "How does software enable machines to display intelligence according to course notes?",
    options: [
      { optionText: "By studying methods that allow machines to perceive, learn, and act", isCorrect: true },
      { optionText: "By increasing CPU fan rotation speed", isCorrect: false },
      { optionText: "By formatting hard disks into FAT32 file systems", isCorrect: false },
      { optionText: "By executing infinite empty loops", isCorrect: false }
    ],
    explanation: "Software enables AI by utilizing methods that perceive environments and apply learning to take goal-driven actions."
  },

  // ── SECTION 2: HISTORY OF ARTIFICIAL INTELLIGENCE (Q16 - Q35) ──────────────
  {
    questionText: "The historical roots of mechanical reasoning began directly with which theoretical domain?",
    options: [
      { optionText: "Theory of computation", isCorrect: true },
      { optionText: "Quantum electrodynamics", isCorrect: false },
      { optionText: "Cellular biology", isCorrect: false },
      { optionText: "Macroeconomics", isCorrect: false }
    ],
    explanation: "The study of mechanical reasoning began with the theory of computation."
  },
  {
    questionText: "In 1943, who developed the initial design for artificial neurons?",
    options: [
      { optionText: "McCulloch and Pitts", isCorrect: true },
      { optionText: "Alan Turing and John von Neumann", isCorrect: false },
      { optionText: "Marvin Minsky and Herbert Simon", isCorrect: false },
      { optionText: "Claude Shannon and Arthur Samuel", isCorrect: false }
    ],
    explanation: "In 1943, Warren McCulloch and Walter Pitts designed the first mathematical model of artificial neurons."
  },
  {
    questionText: "In 1950, Alan Turing published a landmark research paper titled:",
    options: [
      { optionText: "Computing Machinery and Intelligence", isCorrect: true },
      { optionText: "Principles of Data Communication", isCorrect: false },
      { optionText: "The Wealth of Nations", isCorrect: false },
      { optionText: "Relational Database Systems", isCorrect: false }
    ],
    explanation: "In 1950, Alan Turing published 'Computing Machinery and Intelligence', introducing the concept of machine intelligence."
  },
  {
    questionText: "In what year and location was Artificial Intelligence officially founded as an academic field?",
    options: [
      { optionText: "1956 at Dartmouth College", isCorrect: true },
      { optionText: "1945 at Harvard University", isCorrect: false },
      { optionText: "1967 at Oxford University", isCorrect: false },
      { optionText: "1974 at Stanford University", isCorrect: false }
    ],
    explanation: "Artificial Intelligence was founded at a workshop at Dartmouth College in 1956."
  },
  {
    questionText: "Who were among the key attendees and founding leaders of the 1956 Dartmouth AI conference?",
    options: [
      { optionText: "John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon", isCorrect: true },
      { optionText: "Bill Gates, Steve Jobs, and Paul Allen", isCorrect: false },
      { optionText: "Tim Berners-Lee and Vint Cerf", isCorrect: false },
      { optionText: "Ada Lovelace and Charles Babbage", isCorrect: false }
    ],
    explanation: "The 1956 Dartmouth workshop attendees (McCarthy, Minsky, Rochester, Shannon) became leaders of AI research."
  },
  {
    questionText: "Which AI accomplishment occurred during the 1960s research boom?",
    options: [
      { optionText: "Programs that learned checkers strategies, solved word problems in algebra, and proved logic theorems", isCorrect: true },
      { optionText: "Creation of modern smartphone assistants like Siri and Google Assistant", isCorrect: false },
      { optionText: "Autonomous commercial passenger flights across continents", isCorrect: false },
      { optionText: "Full human-level Artificial General Intelligence", isCorrect: false }
    ],
    explanation: "1960s programs solved algebra word problems, proved logical theorems, and learned checkers strategies."
  },
  {
    questionText: "In 1965, which major natural language achievement was recorded in AI research?",
    options: [
      { optionText: "Programs capable of speaking/understanding English sentences", isCorrect: true },
      { optionText: "Translation of ancient Egyptian hieroglyphics automatically", isCorrect: false },
      { optionText: "Real-time speech synthesis in 100 global languages", isCorrect: false },
      { optionText: "Creation of the Python programming language", isCorrect: false }
    ],
    explanation: "In 1965, AI programs demonstrated the ability to process and speak English."
  },
  {
    questionText: "In 1967, Herbert Simon predicted that machines would be capable of doing any work a man can do within:",
    options: [
      { optionText: "20 years", isCorrect: true },
      { optionText: "50 years", isCorrect: false },
      { optionText: "5 years", isCorrect: false },
      { optionText: "100 years", isCorrect: false }
    ],
    explanation: "In 1967, Herbert Simon predicted that 'machines will be capable, within twenty years, of doing any work a man can do.'"
  },
  {
    questionText: "Which prominent American computer scientist agreed with Herbert Simon's 1967 prediction about machine capability?",
    options: [
      { optionText: "Marvin Minsky", isCorrect: true },
      { optionText: "Linus Torvalds", isCorrect: false },
      { optionText: "Dennis Ritchie", isCorrect: false },
      { optionText: "Ken Thompson", isCorrect: false }
    ],
    explanation: "Marvin Minsky agreed with Herbert Simon's optimistic prediction regarding machine intelligence timing."
  },
  {
    questionText: "What major event occurred in 1974 that severely impacted AI funding?",
    options: [
      { optionText: "The US and British governments cut off exploratory AI research funding (First AI Winter)", isCorrect: true },
      { optionText: "The invention of the World Wide Web", isCorrect: false },
      { optionText: "The complete ban of all computer manufacturing worldwide", isCorrect: false },
      { optionText: "The collapse of the internet backbone", isCorrect: false }
    ],
    explanation: "In 1974, in response to criticism (such as Sir James Lighthill's report) and US Congress pressure, AI funding was cut, starting the First AI Winter."
  },
  {
    questionText: "Whose critical report contributed to the British government cutting AI research funding in 1973/1974?",
    options: [
      { optionText: "Sir James Lighthill", isCorrect: true },
      { optionText: "Sir Isaac Newton", isCorrect: false },
      { optionText: "Alan Turing", isCorrect: false },
      { optionText: "John von Neumann", isCorrect: false }
    ],
    explanation: "Sir James Lighthill published a report in 1973 criticizing the lack of achievements in AI compared to its promises."
  },
  {
    questionText: "What technology sparked the commercial revival of AI in the early 1980s?",
    options: [
      { optionText: "Expert Systems", isCorrect: true },
      { optionText: "Quantum Computing", isCorrect: false },
      { optionText: "Fiber Optic Cables", isCorrect: false },
      { optionText: "Relational SQL Databases", isCorrect: false }
    ],
    explanation: "In the early 1980s, AI research was revived by the commercial success of Expert Systems."
  },
  {
    questionText: "What was the primary function of an Expert System in the early 1980s?",
    options: [
      { optionText: "Simulating the knowledge and analytical skills of human experts", isCorrect: true },
      { optionText: "Streaming high-definition video over dial-up modems", isCorrect: false },
      { optionText: "Rendering 3D video game graphics", isCorrect: false },
      { optionText: "Compiling C++ code automatically without syntax errors", isCorrect: false }
    ],
    explanation: "Expert systems simulated the knowledge and decision-making skills of human domain experts."
  },
  {
    questionText: "In 1985, which international initiative inspired the US and British governments to restore AI funding?",
    options: [
      { optionText: "Japan's 5th Generation Computer Project", isCorrect: true },
      { optionText: "The European Union Space Exploration Initiative", isCorrect: false },
      { optionText: "The Soviet Union Satellite Network", isCorrect: false },
      { optionText: "The United Nations Global Internet Project", isCorrect: false }
    ],
    explanation: "In 1985, Japan's 5th Generation Computer project prompted Western governments to restore AI funding."
  },
  {
    questionText: "What event in 1987 triggered the Second AI Winter?",
    options: [
      { optionText: "The collapse of the Lisp Machine market", isCorrect: true },
      { optionText: "The shutdown of the ARPANET network", isCorrect: false },
      { optionText: "The discovery of computer viruses", isCorrect: false },
      { optionText: "The ban on microprocessors", isCorrect: false }
    ],
    explanation: "In 1987, the collapse of the specialized Lisp machine market led to a second major decline in AI funding (Second AI Winter)."
  },
  {
    questionText: "How did AI research restore its reputation in the late 1990s?",
    options: [
      { optionText: "By adopting formal mathematical methods and delivering specific solutions to specific problems", isCorrect: true },
      { optionText: "By abandoning all mathematical formulas completely", isCorrect: false },
      { optionText: "By focusing exclusively on sci-fi robot movies", isCorrect: false },
      { optionText: "By relying on unverified predictions and media hypes", isCorrect: false }
    ],
    explanation: "In the late 1990s, AI regained credibility by applying rigorous mathematical methods and solving targeted real-world problems."
  },
  {
    questionText: "By the year 2000, AI solutions had achieved which status in technology?",
    options: [
      { optionText: "They became widely used in commercial and technical applications", isCorrect: true },
      { optionText: "They were completely banned by international law", isCorrect: false },
      { optionText: "They were restricted to university laboratories only", isCorrect: false },
      { optionText: "They were replaced entirely by vacuum tubes", isCorrect: false }
    ],
    explanation: "By 2000, AI technologies were widely used behind the scenes in many systems."
  },
  {
    questionText: "What does the abbreviation AGI stand for in modern AI research?",
    options: [
      { optionText: "Artificial General Intelligence", isCorrect: true },
      { optionText: "Automated Graphical Interface", isCorrect: false },
      { optionText: "Algorithm Generation Integration", isCorrect: false },
      { optionText: "Analytical Grid Infrastructure", isCorrect: false }
    ],
    explanation: "AGI stands for Artificial General Intelligence."
  },
  {
    questionText: "The term 'AI Winter' refers to:",
    options: [
      { optionText: "Periods of reduced funding and interest in AI research due to unmet expectations", isCorrect: true },
      { optionText: "Running supercomputers in cold sub-zero weather conditions", isCorrect: false },
      { optionText: "The seasonal decrease of computer sales during December", isCorrect: false },
      { optionText: "Hardware overheating bugs caused by low temperatures", isCorrect: false }
    ],
    explanation: "An AI Winter is a period of reduced funding, public interest, and research activity in AI."
  },
  {
    questionText: "Which statement best summarizes the evolution of AI from 1950 to the 2000s?",
    options: [
      { optionText: "It cycled through optimistic booms, funding collapses (winters), expert system revivals, and mathematical maturity", isCorrect: true },
      { optionText: "It remained completely unchanged with zero funding variation", isCorrect: false },
      { optionText: "It developed smoothly without any setbacks or funding cuts", isCorrect: false },
      { optionText: "It started as a commercial product before any theoretical concepts existed", isCorrect: false }
    ],
    explanation: "AI history experienced boom cycles, expectations, AI winters, expert system booms, and eventual mathematical rigor."
  },

  // ── SECTION 3: MACHINE LEARNING FOUNDATIONS & TYPES (Q36 - Q55) ─────────────
  {
    questionText: "What is Machine Learning (ML)?",
    options: [
      { optionText: "A subfield of AI that allows systems to learn and improve from experience without being explicitly programmed", isCorrect: true },
      { optionText: "A physical factory machine that cleans electronic circuit boards", isCorrect: false },
      { optionText: "A manual coding practice where developers write nested IF statements for every condition", isCorrect: false },
      { optionText: "A hardware architecture used to store solid-state drive firmware", isCorrect: false }
    ],
    explanation: "Machine Learning is a subfield of AI that enables systems to learn and improve from experience without explicit programming."
  },
  {
    questionText: "In Machine Learning, how does a system optimize its solutions?",
    options: [
      { optionText: "By learning through data, statistics, and trial & error", isCorrect: true },
      { optionText: "By manually editing its source code files on disk", isCorrect: false },
      { optionText: "By increasing CPU clock multiplier settings", isCorrect: false },
      { optionText: "By deleting log files when memory is low", isCorrect: false }
    ],
    explanation: "ML systems learn through data, statistical analysis, and trial-and-error to optimize their task solutions."
  },
  {
    questionText: "What are the three main types of Machine Learning identified in the lecture notes?",
    options: [
      { optionText: "Supervised Learning, Unsupervised Learning, and Reinforcement Learning", isCorrect: true },
      { optionText: "Linear Learning, Non-Linear Learning, and Circular Learning", isCorrect: false },
      { optionText: "Primary Learning, Secondary Learning, and Tertiary Learning", isCorrect: false },
      { optionText: "Static Learning, Dynamic Learning, and Random Learning", isCorrect: false }
    ],
    explanation: "The three main types of ML are Supervised Learning, Unsupervised Learning, and Reinforcement Learning."
  },
  {
    questionText: "In Supervised Learning, what characterizes the input data used for training?",
    options: [
      { optionText: "Each input data set is associated with a known, labeled output", isCorrect: true },
      { optionText: "The input data is completely unlabeled with no guidance", isCorrect: false },
      { optionText: "The data contains only random binary zeroes", isCorrect: false },
      { optionText: "The input data consists exclusively of audio files", isCorrect: false }
    ],
    explanation: "Supervised Learning uses labeled data where each input is paired with a known target output."
  },
  {
    questionText: "How does a Supervised Learning algorithm learn to make predictions?",
    options: [
      { optionText: "It learns the mapping rules between labeled inputs and desired outputs", isCorrect: true },
      { optionText: "It randomly guesses outcomes without analyzing inputs", isCorrect: false },
      { optionText: "It requests human intervention for every individual input at runtime", isCorrect: false },
      { optionText: "It ignores the training dataset and reads CPU instruction registers", isCorrect: false }
    ],
    explanation: "Supervised Learning algorithms find mathematical rules/functions mapping labeled input data to the known output."
  },
  {
    questionText: "What defines Unsupervised Learning?",
    options: [
      { optionText: "The algorithm learns patterns and structures from unlabeled data without output guidance", isCorrect: true },
      { optionText: "A human supervisor monitors every execution step", isCorrect: false },
      { optionText: "The system receives explicit target labels for all records", isCorrect: false },
      { optionText: "It operates without needing any memory or CPU", isCorrect: false }
    ],
    explanation: "In Unsupervised Learning, algorithms find inherent structures/patterns in unlabeled data without desired output labels."
  },
  {
    questionText: "In Unsupervised Learning, the training dataset consists of:",
    options: [
      { optionText: "Unlabeled data", isCorrect: true },
      { optionText: "Strictly labeled input-output pairs", isCorrect: false },
      { optionText: "Environment rewards and penalties", isCorrect: false },
      { optionText: "SQL database table schema definitions", isCorrect: false }
    ],
    explanation: "Unsupervised learning processes unlabeled data to identify hidden clusters or associations."
  },
  {
    questionText: "What is Reinforcement Learning?",
    options: [
      { optionText: "A learning approach where an agent learns to make decisions by interacting with an environment and receiving rewards or penalties", isCorrect: true },
      { optionText: "Feeding pre-labeled CSV files into a linear model", isCorrect: false },
      { optionText: "Manually re-soldering microchips on a motherboard", isCorrect: false },
      { optionText: "Compiling Java code into bytecode", isCorrect: false }
    ],
    explanation: "Reinforcement Learning involves an autonomous agent learning optimal actions via environmental feedback (rewards/penalties)."
  },
  {
    questionText: "In Reinforcement Learning, what feedback does the machine receive for a CORRECT action?",
    options: [
      { optionText: "A reward point", isCorrect: true },
      { optionText: "A penalty point", isCorrect: false },
      { optionText: "A system shutdown command", isCorrect: false },
      { optionText: "A syntax error notification", isCorrect: false }
    ],
    explanation: "In Reinforcement Learning, the machine receives a reward point for a correct action."
  },
  {
    questionText: "In Reinforcement Learning, what feedback does the machine receive for a WRONG action?",
    options: [
      { optionText: "A penalty point", isCorrect: true },
      { optionText: "A reward point", isCorrect: false },
      { optionText: "An automatic grade elevation", isCorrect: false },
      { optionText: "No feedback whatsoever", isCorrect: false }
    ],
    explanation: "In Reinforcement Learning, the machine receives a penalty point in the case of a wrong response."
  },
  {
    questionText: "Which component acts upon the environment in a Reinforcement Learning framework?",
    options: [
      { optionText: "An agent", isCorrect: true },
      { optionText: "A compiler", isCorrect: false },
      { optionText: "A relational table", isCorrect: false },
      { optionText: "A print spooler", isCorrect: false }
    ],
    explanation: "In Reinforcement Learning, the learning entity is referred to as an 'agent' interacting with its environment."
  },
  {
    questionText: "What is the key difference between Supervised and Unsupervised Learning?",
    options: [
      { optionText: "Supervised uses labeled data; Unsupervised uses unlabeled data", isCorrect: true },
      { optionText: "Supervised requires GPUs; Unsupervised requires CPUs only", isCorrect: false },
      { optionText: "Supervised works on text; Unsupervised works on numbers", isCorrect: false },
      { optionText: "Supervised is for hardware; Unsupervised is for software", isCorrect: false }
    ],
    explanation: "Supervised learning relies on labeled training pairs, whereas unsupervised learning works on unlabeled data."
  },
  {
    questionText: "Reinforcement learning is distinct from Supervised learning because:",
    options: [
      { optionText: "It learns through trial-and-error interactions with environment rewards rather than explicit labeled pairs", isCorrect: true },
      { optionText: "It does not require any mathematical computations", isCorrect: false },
      { optionText: "It can only be written in Python", isCorrect: false },
      { optionText: "It requires human supervision for every decision", isCorrect: false }
    ],
    explanation: "Reinforcement learning explores action spaces to maximize rewards rather than being given correct target labels."
  },
  {
    questionText: "In ML, what is 'input data fed into the machine during the learning phase along with the output' called?",
    options: [
      { optionText: "Labeled Training Data", isCorrect: true },
      { optionText: "Unstructured Raw Garbage", isCorrect: false },
      { optionText: "Compiled Binary Executable", isCorrect: false },
      { optionText: "System Configuration Log", isCorrect: false }
    ],
    explanation: "In supervised machine learning, input data paired with known outputs is called labeled training data."
  },
  {
    questionText: "What allows a Machine Learning model to generalize well to unseen real-world situations?",
    options: [
      { optionText: "Learning underlying patterns from quality data without overfitting", isCorrect: true },
      { optionText: "Memorizing training data records word for word", isCorrect: false },
      { optionText: "Increasing the file size of the database", isCorrect: false },
      { optionText: "Disabling error checking routines", isCorrect: false }
    ],
    explanation: "Generalization is achieved when a model learns general patterns from training data rather than memorizing noise."
  },
  {
    questionText: "Machine Learning is best described as a field focused on making machines:",
    options: [
      { optionText: "More human-like in their learning and behavior through data", isCorrect: true },
      { optionText: "Faster at printing paper documents", isCorrect: false },
      { optionText: "Immune to physical electrical surges", isCorrect: false },
      { optionText: "Capable of replacing physical power supplies", isCorrect: false }
    ],
    explanation: "ML focuses on making machines more human-like in their learning behaviors by providing them data."
  },
  {
    questionText: "Which statement about labeled vs unlabeled data is CORRECT?",
    options: [
      { optionText: "Labeled data includes target answers; unlabeled data contains only feature inputs", isCorrect: true },
      { optionText: "Labeled data contains only images; unlabeled data contains only numbers", isCorrect: false },
      { optionText: "Unlabeled data is easier to evaluate than labeled data", isCorrect: false },
      { optionText: "Labeled data cannot be used in computer science", isCorrect: false }
    ],
    explanation: "Labeled data includes expected target answers/labels alongside input features."
  },
  {
    questionText: "Which learning type balances exploring different options vs exploiting known high-reward strategies?",
    options: [
      { optionText: "Reinforcement Learning", isCorrect: true },
      { optionText: "Supervised Learning", isCorrect: false },
      { optionText: "Static Data Entry", isCorrect: false },
      { optionText: "Unsupervised Clustering", isCorrect: false }
    ],
    explanation: "Reinforcement learning balances exploring new options vs exploiting known reward-yielding strategies."
  },
  {
    questionText: "In Machine Learning, what is the 'target' in a supervised dataset?",
    options: [
      { optionText: "The desired output variable that the algorithm aims to predict", isCorrect: true },
      { optionText: "The physical IP address of the machine", isCorrect: false },
      { optionText: "The directory location of the script", isCorrect: false },
      { optionText: "The speed of the network interface card", isCorrect: false }
    ],
    explanation: "The target is the ground-truth outcome label that a supervised model is trained to predict."
  },
  {
    questionText: "Why is Machine Learning considered a 'soft' field of Artificial Intelligence?",
    options: [
      { optionText: "Because it relies on probabilistic, data-driven learning rather than rigid hardcoded logic rules", isCorrect: true },
      { optionText: "Because it only runs on flexible laptop screens", isCorrect: false },
      { optionText: "Because it requires soft physical materials to manufacture", isCorrect: false },
      { optionText: "Because it operates without digital electricity", isCorrect: false }
    ],
    explanation: "ML is probabilistic and statistical, adapting to data rather than relying strictly on brittle hardcoded rules."
  },

  // ── SECTION 4: APPLICATIONS OF MACHINE LEARNING (Q56 - Q70) ───────────────
  {
    questionText: "How do Social Media platforms utilize Machine Learning according to the course notes?",
    options: [
      { optionText: "To create a sense of community and remove malicious people & information", isCorrect: true },
      { optionText: "To physically block cell phone tower radio waves", isCorrect: false },
      { optionText: "To format user SIM cards automatically", isCorrect: false },
      { optionText: "To increase SMS text messaging charges", isCorrect: false }
    ],
    explanation: "Social media platforms use ML to foster community safety and filter out malicious users/content."
  },
  {
    questionText: "In Healthcare, Machine Learning is applied to:",
    options: [
      { optionText: "Manage medical information, discover new treatments, detect and predict diseases", isCorrect: true },
      { optionText: "Replace doctors in physical surgical cutting tasks without instruments", isCorrect: false },
      { optionText: "Clean hospital floor surfaces automatically", isCorrect: false },
      { optionText: "Increase hospital electricity bills", isCorrect: false }
    ],
    explanation: "Healthcare ML applications include managing patient info, discovering treatments, and disease diagnosis."
  },
  {
    questionText: "How do Retail & Commerce industries benefit from Machine Learning?",
    options: [
      { optionText: "By optimizing sales, gathering shopping preferences, and making purchase recommendations", isCorrect: true },
      { optionText: "By shutting down physical store buildings permanently", isCorrect: false },
      { optionText: "By charging customers random prices at checkout", isCorrect: false },
      { optionText: "By erasing transaction history logs", isCorrect: false }
    ],
    explanation: "Retailers use ML to optimize sales, analyze shopping behavior, and recommend relevant products."
  },
  {
    questionText: "Which of the following is a classic example of a Supervised Learning application?",
    options: [
      { optionText: "Spam email filtering (classifying emails as spam or not spam)", isCorrect: true },
      { optionText: "Clustering unorganized documents without labels", isCorrect: false },
      { optionText: "Self-driving car road navigation via rewards", isCorrect: false },
      { optionText: "Dimensionality reduction on unlabeled images", isCorrect: false }
    ],
    explanation: "Spam email filtering uses labeled examples (spam vs non-spam) and is a classic supervised learning application."
  },
  {
    questionText: "Identifying whether a picture contains a cat or a dog is an example of:",
    options: [
      { optionText: "Supervised Learning Image Classification", isCorrect: true },
      { optionText: "Reinforcement Learning Game Playing", isCorrect: false },
      { optionText: "Unsupervised Clustering", isCorrect: false },
      { optionText: "Manual Data Entry", isCorrect: false }
    ],
    explanation: "Recognizing specific objects (like a cat) in images based on trained labeled photos is supervised image classification."
  },
  {
    questionText: "Predicting loan eligibility based on a applicant's financial data is an application of:",
    options: [
      { optionText: "Supervised Learning", isCorrect: true },
      { optionText: "Unsupervised Learning", isCorrect: false },
      { optionText: "Reinforcement Learning", isCorrect: false },
      { optionText: "Random Sampling", isCorrect: false }
    ],
    explanation: "Determining whether a person is likely to be approved for a loan based on historical labeled data is supervised learning."
  },
  {
    questionText: "Predicting future prices of stocks or retail products based on historical trends uses:",
    options: [
      { optionText: "Supervised Learning (Price Prediction)", isCorrect: true },
      { optionText: "Unsupervised Customer Segmentation", isCorrect: false },
      { optionText: "Reinforcement Robotics", isCorrect: false },
      { optionText: "Manual Guessing", isCorrect: false }
    ],
    explanation: "Price prediction uses supervised regression models trained on historical price data."
  },
  {
    questionText: "Grouping customers into different segments based on their buying behaviors without prior labels is:",
    options: [
      { optionText: "Unsupervised Learning (Customer Segmentation)", isCorrect: true },
      { optionText: "Supervised Spam Filtering", isCorrect: false },
      { optionText: "Reinforcement Self-Driving", isCorrect: false },
      { optionText: "Linear Regression", isCorrect: false }
    ],
    explanation: "Grouping customers into segments using unlabeled purchase data is an unsupervised learning task."
  },
  {
    questionText: "Detecting unusual data points that deviate from the norm (e.g. fraudulent credit card transactions) is:",
    options: [
      { optionText: "Unsupervised Learning (Anomaly Detection)", isCorrect: true },
      { optionText: "Supervised Image Classification", isCorrect: false },
      { optionText: "Reinforcement Game Playing", isCorrect: false },
      { optionText: "Manual File Copying", isCorrect: false }
    ],
    explanation: "Anomaly detection identifies unusual data points deviating from normal patterns without pre-labeled categories."
  },
  {
    questionText: "Simplifying a complex dataset by reducing its total number of features while retaining key information is:",
    options: [
      { optionText: "Unsupervised Learning (Dimensionality Reduction)", isCorrect: true },
      { optionText: "Supervised Price Prediction", isCorrect: false },
      { optionText: "Reinforcement Reward Scoring", isCorrect: false },
      { optionText: "Database Defragmentation", isCorrect: false }
    ],
    explanation: "Dimensionality reduction simplifies complex datasets by reducing feature count using unsupervised techniques."
  },
  {
    questionText: "Suggesting products or content to users based on their past interactions and similar user profiles is known as a:",
    options: [
      { optionText: "Recommendation System", isCorrect: true },
      { optionText: "Spam Filter", isCorrect: false },
      { optionText: "Compiler Optimizer", isCorrect: false },
      { optionText: "Device Driver", isCorrect: false }
    ],
    explanation: "Recommendation systems evaluate past user interactions to suggest relevant products or content."
  },
  {
    questionText: "Training a self-driving car agent to navigate roads by interacting with an environment is an application of:",
    options: [
      { optionText: "Reinforcement Learning", isCorrect: true },
      { optionText: "Supervised Image Tagging", isCorrect: false },
      { optionText: "Unsupervised Clustering", isCorrect: false },
      { optionText: "Static Scripting", isCorrect: false }
    ],
    explanation: "Self-driving car navigation relies on reinforcement learning where agents learn from environmental interactions."
  },
  {
    questionText: "Training robots to perform complex tasks by rewarding desired behaviors is an example of:",
    options: [
      { optionText: "Reinforcement Learning in Robotics", isCorrect: true },
      { optionText: "Supervised Spam Detection", isCorrect: false },
      { optionText: "Unsupervised Anomaly Detection", isCorrect: false },
      { optionText: "Linear Regression", isCorrect: false }
    ],
    explanation: "Robotics utilizes reinforcement learning to train complex physical behaviors via reward feedback."
  },
  {
    questionText: "Developing AI agents that play games like Chess or Go by attempting to maximize total match points uses:",
    options: [
      { optionText: "Reinforcement Learning (Game Playing)", isCorrect: true },
      { optionText: "Supervised Loan Prediction", isCorrect: false },
      { optionText: "Unsupervised Customer Segmentation", isCorrect: false },
      { optionText: "Manual Table Lookup", isCorrect: false }
    ],
    explanation: "Game playing AI uses reinforcement learning to learn winning strategies over time."
  },
  {
    questionText: "Which ML application area directly focuses on medical diagnosis and treatment discovery?",
    options: [
      { optionText: "Healthcare AI", isCorrect: true },
      { optionText: "Social Media Community Filtering", isCorrect: false },
      { optionText: "Retail E-Commerce Recommendations", isCorrect: false },
      { optionText: "Game Playing Systems", isCorrect: false }
    ],
    explanation: "Healthcare AI manages medical data, predicts diseases, and assists in discovering new treatments."
  },

  // ── SECTION 5: ADVANTAGES, DISADVANTAGES & ML PROCESSES (Q71 - Q85) ─────────
  {
    questionText: "Which of the following is listed as a major ADVANTAGE of Machine Learning?",
    options: [
      { optionText: "It can be used for pattern detection and automatic feature generation", isCorrect: true },
      { optionText: "It requires zero computer hardware to run", isCorrect: false },
      { optionText: "It guarantees 100% perfection without any errors ever", isCorrect: false },
      { optionText: "It eliminates the need for any digital data", isCorrect: false }
    ],
    explanation: "Advantages of ML include pattern detection, future predictions, and automatic feature generation."
  },
  {
    questionText: "Which of the following is listed as a DISADVANTAGE of Machine Learning?",
    options: [
      { optionText: "Potential for data bias, overfitting, and lack of explanation ability", isCorrect: true },
      { optionText: "Inability to process numbers", isCorrect: false },
      { optionText: "Excessive physical weight of software files", isCorrect: false },
      { optionText: "Incompatibility with internet networks", isCorrect: false }
    ],
    explanation: "Disadvantages of ML include data bias, susceptibility to overfitting, and black-box explanation limits."
  },
  {
    questionText: "What is the FIRST step in the Machine Learning Process?",
    options: [
      { optionText: "Data Collection", isCorrect: true },
      { optionText: "Hyperparameter Tuning", isCorrect: false },
      { optionText: "Model Deployment", isCorrect: false },
      { optionText: "Evaluating the Model", isCorrect: false }
    ],
    explanation: "Step 1 in the ML process is Data Collection (gathering raw data from various sources)."
  },
  {
    questionText: "What occurs during the Data Pre-processing step of Machine Learning?",
    options: [
      { optionText: "Cleaning data, handling missing data, and normalizing data", isCorrect: true },
      { optionText: "Buying new server hardware from manufacturers", isCorrect: false },
      { optionText: "Writing user interface CSS styles", isCorrect: false },
      { optionText: "Deleting all database records permanently", isCorrect: false }
    ],
    explanation: "Data pre-processing cleans raw data, addresses missing values, and normalizes feature values."
  },
  {
    questionText: "Why is Data Pre-processing crucial in Machine Learning?",
    options: [
      { optionText: "It improves data quality and directly enhances model accuracy", isCorrect: true },
      { optionText: "It reduces the monitor screen brightness", isCorrect: false },
      { optionText: "It converts text files into physical paper prints", isCorrect: false },
      { optionText: "It encrypts hard drives against physical theft", isCorrect: false }
    ],
    explanation: "Data pre-processing ensures clean, normalized inputs which significantly improve model prediction accuracy."
  },
  {
    questionText: "What takes place during the 'Training the Model' step?",
    options: [
      { optionText: "Feeding prepared data into the model and allowing it to adjust internal parameters", isCorrect: true },
      { optionText: "Creating powerpoint presentations for company managers", isCorrect: false },
      { optionText: "Installing anti-virus software on workstations", isCorrect: false },
      { optionText: "Executing manual database backups", isCorrect: false }
    ],
    explanation: "Training involves feeding data into the model so it can adjust its internal parameters/weights."
  },
  {
    questionText: "What is 'Overfitting' in Machine Learning?",
    options: [
      { optionText: "A case where the model performs well on training data but poorly on new unseen data", isCorrect: true },
      { optionText: "A case where the model performs poorly on both training and test data", isCorrect: false },
      { optionText: "When the computer runs out of physical disk space", isCorrect: false },
      { optionText: "When the model trains too quickly in under 1 second", isCorrect: false }
    ],
    explanation: "Overfitting occurs when a model learns noise in training data, performing well on training data but poorly on unseen data."
  },
  {
    questionText: "What is 'Underfitting' in Machine Learning?",
    options: [
      { optionText: "A case where the model performs poorly on BOTH training data and new data", isCorrect: true },
      { optionText: "When the model achieves 100% accuracy on test data", isCorrect: false },
      { optionText: "When the dataset contains too many clean records", isCorrect: false },
      { optionText: "When the computer RAM size is too small", isCorrect: false }
    ],
    explanation: "Underfitting occurs when a model is too simple to capture underlying patterns, performing poorly on both training and test data."
  },
  {
    questionText: "Why is Evaluating the Model essential before deployment?",
    options: [
      { optionText: "To assess model performance on unseen data before production release", isCorrect: true },
      { optionText: "To check the physical temperature of the computer fan", isCorrect: false },
      { optionText: "To format the operating system partition", isCorrect: false },
      { optionText: "To verify the billing address of the cloud provider", isCorrect: false }
    ],
    explanation: "Model evaluation tests how accurately the trained model performs on unseen test data prior to deployment."
  },
  {
    questionText: "What is 'Model Drift' in Machine Learning systems?",
    options: [
      { optionText: "The decline in model performance over time due to changes in real-world data patterns", isCorrect: true },
      { optionText: "A physical movement of server racks in a data center", isCorrect: false },
      { optionText: "The loss of Wi-Fi network connection during training", isCorrect: false },
      { optionText: "A syntax error caused by missing semicolons", isCorrect: false }
    ],
    explanation: "Model drift is the gradual decline in prediction accuracy when real-world data distribution shifts over time."
  },
  {
    questionText: "What is a 'Hyperparameter' in Machine Learning?",
    options: [
      { optionText: "A configuration variable external to the model whose value cannot be estimated directly from data", isCorrect: true },
      { optionText: "An internal parameter updated automatically during gradient descent", isCorrect: false },
      { optionText: "A physical switch on the computer motherboard", isCorrect: false },
      { optionText: "The username used to log into the database", isCorrect: false }
    ],
    explanation: "Hyperparameters are external setup settings (like learning rate or tree depth) set prior to model training."
  },
  {
    questionText: "What is the goal of Hyperparameter Tuning & Optimization?",
    options: [
      { optionText: "To find the best configuration settings that ensure maximum model efficiency and accuracy", isCorrect: true },
      { optionText: "To compress PNG images into ZIP archives", isCorrect: false },
      { optionText: "To uninstall outdated operating system updates", isCorrect: false },
      { optionText: "To speed up internet download rates", isCorrect: false }
    ],
    explanation: "Hyperparameter tuning searches for optimal external settings that maximize model performance."
  },
  {
    questionText: "What happens during the 'Predictions & Deployment' phase of ML?",
    options: [
      { optionText: "Deploying the trained model into production to deliver real-time predictions & insights", isCorrect: true },
      { optionText: "Deleting all trained weights and starting data collection over", isCorrect: false },
      { optionText: "Writing lecture notes on physical paper", isCorrect: false },
      { optionText: "Disconnecting the server from the electrical grid", isCorrect: false }
    ],
    explanation: "Deployment integrates the validated model into a production environment for real-world predictions."
  },
  {
    questionText: "Which ML process step comes immediately AFTER Data Pre-processing?",
    options: [
      { optionText: "Choosing the Right Model", isCorrect: true },
      { optionText: "Data Collection", isCorrect: false },
      { optionText: "Model Drift Monitoring", isCorrect: false },
      { optionText: "Hyperparameter Tuning", isCorrect: false }
    ],
    explanation: "Once data is collected and pre-processed, the next step is Choosing the Right Model."
  },
  {
    questionText: "Why is 'lack of explanation ability' (black box nature) considered a disadvantage of complex ML models?",
    options: [
      { optionText: "Because it is difficult to understand how or why the model arrived at a specific decision", isCorrect: true },
      { optionText: "Because the computer screen turns completely black when running", isCorrect: false },
      { optionText: "Because complex models cannot process numbers", isCorrect: false },
      { optionText: "Because complex models consume no memory", isCorrect: false }
    ],
    explanation: "Complex models (like deep neural networks) can act as black boxes where internal decision pathways are difficult to interpret."
  },

  // ── SECTION 6: ML ALGORITHMS & CLASSIFICATION (Q86 - Q100) ─────────────────
  {
    questionText: "What are the two main types of supervised prediction problems in Machine Learning?",
    options: [
      { optionText: "Classification and Regression", isCorrect: true },
      { optionText: "Compilation and Execution", isCorrect: false },
      { optionText: "Encryption and Decryption", isCorrect: false },
      { optionText: "Serializing and Deserializing", isCorrect: false }
    ],
    explanation: "Supervised machine learning algorithms generally solve either Classification or Regression problems."
  },
  {
    questionText: "Linear Regression is a supervised learning algorithm designed to predict:",
    options: [
      { optionText: "Continuous numerical values that fluctuate over time (e.g. age, sales revenue)", isCorrect: true },
      { optionText: "Categorical labels like 'spam' or 'not spam'", isCorrect: false },
      { optionText: "Unlabeled clusters of customer records", isCorrect: false },
      { optionText: "Game reward points", isCorrect: false }
    ],
    explanation: "Linear Regression predicts continuous numerical outcomes that vary over time."
  },
  {
    questionText: "Logistic Regression is part of predictive modeling used to predict:",
    options: [
      { optionText: "The probability of discrete outcomes (binary classification like yes/no)", isCorrect: true },
      { optionText: "Continuous floating-point temperatures over 10 years", isCorrect: false },
      { optionText: "Unlabeled cluster centers", isCorrect: false },
      { optionText: "Physical hardware clock speeds", isCorrect: false }
    ],
    explanation: "Logistic Regression is used for classification problems, estimating the probability of binary outcomes."
  },
  {
    questionText: "Which Supervised Learning algorithm divides a dataset into different subsets using a series of questions or conditions?",
    options: [
      { optionText: "Decision Tree", isCorrect: true },
      { optionText: "K-Means Clustering", isCorrect: false },
      { optionText: "Linear Regression", isCorrect: false },
      { optionText: "K-Nearest Neighbors", isCorrect: false }
    ],
    explanation: "Decision Trees split datasets into subsets based on sequential condition rules/questions."
  },
  {
    questionText: "Decision Tree algorithms can be used for:",
    options: [
      { optionText: "Both Classification and Regression problems", isCorrect: true },
      { optionText: "Unsupervised Clustering only", isCorrect: false },
      { optionText: "Hardware memory management only", isCorrect: false },
      { optionText: "Data collection only", isCorrect: false }
    ],
    explanation: "Decision Trees are versatile supervised models suitable for both classification and regression."
  },
  {
    questionText: "The Naive Bayes Algorithm performs classification based on which mathematical probability theorem?",
    options: [
      { optionText: "Bayes' Theorem", isCorrect: true },
      { optionText: "Pythagorean Theorem", isCorrect: false },
      { optionText: "Fermat's Last Theorem", isCorrect: false },
      { optionText: "Central Limit Theorem", isCorrect: false }
    ],
    explanation: "Naive Bayes classification relies directly on Bayes' Theorem of conditional probability."
  },
  {
    questionText: "Why is the Naive Bayes algorithm called 'Naive'?",
    options: [
      { optionText: "Because it assumes all features in the input data are independent of one another", isCorrect: true },
      { optionText: "Because it cannot process large datasets", isCorrect: false },
      { optionText: "Because it was created by an inexperienced developer", isCorrect: false },
      { optionText: "Because it generates incorrect predictions 90% of the time", isCorrect: false }
    ],
    explanation: "It is called 'naive' because it simplifies calculations by assuming input features are strictly independent."
  },
  {
    questionText: "K-Means Clustering is an Unsupervised Learning algorithm that:",
    options: [
      { optionText: "Groups an unlabeled dataset into K different clusters based on similarities", isCorrect: true },
      { optionText: "Predicts continuous financial stock prices", isCorrect: false },
      { optionText: "Classifies emails into pre-defined labeled folders", isCorrect: false },
      { optionText: "Calculates exact linear slope equations", isCorrect: false }
    ],
    explanation: "K-Means Clustering partitions unlabeled datasets into K distinct clusters according to feature similarities."
  },
  {
    questionText: "How does the K-Nearest Neighbors (KNN) algorithm classify a new data element?",
    options: [
      { optionText: "Based on proximity or similarity to existing neighboring data groups", isCorrect: true },
      { optionText: "By building a decision tree with IF-THEN rules", isCorrect: false },
      { optionText: "By training an artificial neural network with backpropagation", isCorrect: false },
      { optionText: "By calculating Bayes conditional probabilities", isCorrect: false }
    ],
    explanation: "KNN classifies a new sample based on the majority category among its nearest distance neighbors."
  },
  {
    questionText: "Which algorithm is classified as an UNSUPERVISED learning method in the notes?",
    options: [
      { optionText: "K-Means Clustering", isCorrect: true },
      { optionText: "Linear Regression", isCorrect: false },
      { optionText: "Logistic Regression", isCorrect: false },
      { optionText: "Naive Bayes Algorithm", isCorrect: false }
    ],
    explanation: "K-Means Clustering is an unsupervised algorithm used for clustering unlabeled data."
  },
  {
    questionText: "Which algorithm is classified as a SUPERVISED learning method used for predicting continuous numerical variables?",
    options: [
      { optionText: "Linear Regression", isCorrect: true },
      { optionText: "K-Means Clustering", isCorrect: false },
      { optionText: "Dimensionality Reduction", isCorrect: false },
      { optionText: "Customer Segmentation", isCorrect: false }
    ],
    explanation: "Linear Regression is a supervised model predicting continuous numeric outcomes."
  },
  {
    questionText: "Which AI technique enables computers to process and understand human language text?",
    options: [
      { optionText: "Natural Language Processing (NLP)", isCorrect: true },
      { optionText: "Computer Vision", isCorrect: false },
      { optionText: "Robotics Kinematics", isCorrect: false },
      { optionText: "High Performance Graphics Rendering", isCorrect: false }
    ],
    explanation: "Natural Language Processing (NLP) is the AI domain enabling machines to read, process, and understand human language."
  },
  {
    questionText: "Which AI technique allows machines to analyze, interpret, and extract insights from visual images and videos?",
    options: [
      { optionText: "Computer Vision", isCorrect: true },
      { optionText: "Natural Language Processing", isCorrect: false },
      { optionText: "Audio Equalization", isCorrect: false },
      { optionText: "Text Processing", isCorrect: false }
    ],
    explanation: "Computer Vision allows computers to interpret and understand visual inputs (images/videos)."
  },
  {
    questionText: "What distinguishes Supervised Learning algorithms from Unsupervised Learning algorithms?",
    options: [
      { optionText: "Supervised algorithms learn from labeled data; Unsupervised algorithms discover patterns in unlabeled data", isCorrect: true },
      { optionText: "Supervised algorithms do not use mathematical calculations", isCorrect: false },
      { optionText: "Unsupervised algorithms cannot be run on modern computers", isCorrect: false },
      { optionText: "Supervised algorithms are used exclusively for robotics", isCorrect: false }
    ],
    explanation: "Supervised models require labeled target outputs, whereas unsupervised models discover structures in unlabeled data."
  },
  {
    questionText: "In AIT 313, what is the ultimate key takeaway regarding Artificial Intelligence and Machine Learning?",
    options: [
      { optionText: "AI and ML combine algorithms, data, and computation to solve complex human-level tasks autonomously", isCorrect: true },
      { optionText: "AI is completely limited to simple arithmetic calculators", isCorrect: false },
      { optionText: "Machine Learning eliminates the need for computer software", isCorrect: false },
      { optionText: "AI history has no connection to modern computer science", isCorrect: false }
    ],
    explanation: "AIT 313 demonstrates how AI and ML leverage data, algorithms, and computing power to solve complex real-world tasks autonomously."
  }
];

const seedAIT313 = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI is missing from process.env');
      process.exit(1);
    }

    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected.`);

    // 1. Locate NCC Department
    const nccDepartment = await Department.findOne({ name: /NETWORKING AND CLOUD COMPUTING/i });
    if (!nccDepartment) {
      console.error('❌ NCC Department (Networking and Cloud Computing) not found in DB!');
      process.exit(1);
    }
    console.log(`✅ Found NCC Department (ID: ${nccDepartment._id})`);

    // 2. Create or Update Course AIT 313
    const courseTitle = 'AIT 313 - ARTIFICIAL INTELLIGENCE';
    let course = await Course.findOne({ 
      $or: [
        { title: courseTitle },
        { title: /AIT 313/i }
      ]
    });

    if (!course) {
      console.log(`Course AIT 313 not found. Creating course...`);
      course = await Course.create({
        title: courseTitle,
        description: 'Comprehensive study of Artificial Intelligence, Machine Learning types, history, algorithms, and real-world application areas.',
        department: nccDepartment._id,
        level: 'HND1',
        path: 'polytechnic',
        semester: 'Second Semester',
        price: 1000
      });
      console.log(`✅ Created Course: ${course.title} (ID: ${course._id})`);
    } else {
      course.title = courseTitle;
      course.department = nccDepartment._id;
      course.level = 'HND1';
      course.path = 'polytechnic';
      course.semester = 'Second Semester';
      course.price = 1000;
      await course.save();
      console.log(`✅ Updated existing Course: ${course.title} (ID: ${course._id})`);
    }

    // Format questions array to match Quiz schema (text field for question & options)
    const formattedQuestions = questions.map(q => ({
      text: q.questionText || q.text,
      options: (q.options || []).map(opt => ({
        text: opt.optionText || opt.text,
        isCorrect: opt.isCorrect
      })),
      explanation: q.explanation || "",
      subject: "Artificial Intelligence"
    }));

    // 3. Create or Update Quiz for AIT 313
    const quizTitle = 'AIT 313 - Artificial Intelligence Comprehensive Exam';
    let quiz = await Quiz.findOne({ course: course._id });

    if (!quiz) {
      console.log(`Creating Quiz for AIT 313 with 100 questions...`);
      quiz = await Quiz.create({
        title: quizTitle,
        description: 'Official 100-Question Comprehensive Practice Exam for AIT 313 (Artificial Intelligence) - Mrs. Linda.',
        course: course._id,
        duration: 60,
        questions: formattedQuestions,
        isActive: true
      });
      console.log(`✅ Created Quiz (ID: ${quiz._id}) with ${quiz.questions.length} questions!`);
    } else {
      quiz.title = quizTitle;
      quiz.description = 'Official 100-Question Comprehensive Practice Exam for AIT 313 (Artificial Intelligence) - Mrs. Linda.';
      quiz.duration = 60;
      quiz.questions = formattedQuestions;
      quiz.isActive = true;
      await quiz.save();
      console.log(`✅ Updated Quiz (ID: ${quiz._id}) with ${quiz.questions.length} questions!`);
    }

    // 4. Grant access to student Ebubeonuorahobi@gmail.com
    const studentEmail = 'ebubeonuorahobi@gmail.com';
    let student = await Student.findOne({ email: studentEmail });
    if (student) {
      const accessToken = `ADM-GRANT-${crypto.randomBytes(8).toString('hex')}`;
      await CourseAccess.findOneAndUpdate(
        { student: student._id, course: course._id },
        {
          student: student._id,
          course: course._id,
          accessToken,
          isActive: true,
          isUsed: true,
          firstUsedAt: new Date()
        },
        { upsert: true, new: true }
      );

      await Transaction.findOneAndUpdate(
        { student: student._id, course: course._id, status: 'success' },
        {
          student: student._id,
          course: course._id,
          reference: `FREE-AIT313-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
          amount: 0,
          status: 'success',
          paidAt: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Granted full unlocked access for ${studentEmail} to ${courseTitle}!`);
    }

    console.log(`\n🎉 SEED COMPLETE! AIT 313 with 100 authentic questions is live under NCC Department (HND1, Second Semester).`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding AIT 313:', error);
    process.exit(1);
  }
};

seedAIT313();
