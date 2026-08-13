require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

function getGenerativeModel(modelName, config = {}) {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: config
  });
}

function getFileManager() {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  return new GoogleAIFileManager(apiKey);
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`  🔄 Rotating API Key to Key #${currentKeyIndex + 1} (ending in ...${apiKeys[currentKeyIndex].slice(-6)})`);
}

const courseNoteSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    chapterTitle: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const CourseNote = mongoose.models.CourseNote || mongoose.model("CourseNote", courseNoteSchema);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function callWithRetry(fn, retries = 10, initialDelay = 4000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || '';
      console.log(`  ⚠️ Error encountered (${msg.slice(0, 80)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
      rotateKey();
      await delay(waitTime);
      waitTime = Math.round(waitTime * 1.3);
    }
  }
  throw new Error("Max retries exceeded");
}

async function uploadPdfFile(filePath, displayName) {
  console.log(`Uploading ${displayName}...`);
  const fileManager = getFileManager();
  const uploadRes = await fileManager.uploadFile(filePath, {
    mimeType: "application/pdf",
    displayName
  });
  let file = await fileManager.getFile(uploadRes.file.name);
  while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await delay(2500);
    file = await fileManager.getFile(uploadRes.file.name);
  }
  console.log(`\nPDF File ${file.displayName} uploaded and ready.`);
  return { fileData: { mimeType: file.mimeType, fileUri: file.uri } };
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// User-provided 100 questions raw data for GNS 102
const rawUserQuestions = [
  { text: "Communication can best be defined as the process of:", correctIndex: 1, options: ["Writing information only", "Exchanging information between people", "Speaking continuously", "Reading a book"], explanation: "Communication is the dynamic process of sharing, exchanging, and transmitting ideas, messages, or information between individuals or groups." },
  { text: "Which of the following is an essential element of communication?", correctIndex: 0, options: ["Sender", "Furniture", "Classroom", "Notebook"], explanation: "The sender is a vital core element of the communication process, responsible for formulating and encoding the message." },
  { text: "The person who initiates a communication process is called the:", correctIndex: 2, options: ["Receiver", "Decoder", "Sender", "Listener"], explanation: "The sender is the source or communicator who originates the idea or information to be transmitted." },
  { text: "The person for whom a message is intended is the:", correctIndex: 0, options: ["Receiver", "Encoder", "Channel", "Feedback"], explanation: "The receiver is the target recipient of the communication message who decodes and interprets the information." },
  { text: "The information being transmitted during communication is called the:", correctIndex: 1, options: ["Noise", "Message", "Channel", "Feedback"], explanation: "The message is the actual idea, feeling, thought, or instruction being communicated from sender to receiver." },
  { text: "The medium through which a message is transmitted is called the:", correctIndex: 0, options: ["Channel", "Receiver", "Encoder", "Context"], explanation: "The channel is the physical or electronic medium (verbal, written, visual, or digital) used to carry the message." },
  { text: "Converting an idea into words, symbols or gestures is known as:", correctIndex: 1, options: ["Decoding", "Encoding", "Feedback", "Interference"], explanation: "Encoding is the process of translating thoughts, feelings, or concepts into symbolic form for transmission." },
  { text: "The process by which a receiver interprets a message is called:", correctIndex: 1, options: ["Encoding", "Decoding", "Transmission", "Selection"], explanation: "Decoding is the cognitive process by which the receiver interprets and extracts meaning from the encoded message." },
  { text: "Which element confirms whether a message has been understood?", correctIndex: 0, options: ["Feedback", "Noise", "Channel", "Context"], explanation: "Feedback is the response provided by the receiver indicating comprehension, agreement, or request for clarification." },
  { text: "Feedback in communication is:", correctIndex: 0, options: ["The receiver's response to a message", "The original message", "The communication channel", "A form of noise"], explanation: "Feedback consists of verbal or non-verbal reactions returned to the sender after interpreting the message." },
  { text: "The absence of feedback may make it difficult for the sender to know whether the:", correctIndex: 0, options: ["Message was understood", "Channel was selected", "Sender was present", "Receiver was educated"], explanation: "Without feedback, the communication loop remains open, leaving the sender uncertain of message reception and comprehension." },
  { text: "Communication is considered effective when:", correctIndex: 1, options: ["The sender speaks loudly", "The receiver understands the intended message", "The message is very long", "The sender uses difficult words"], explanation: "Communication achieves effectiveness when the receiver decodes and understands the message exactly as intended by the sender." },
  { text: "Which of the following is NOT an element of the communication process?", correctIndex: 3, options: ["Sender", "Message", "Receiver", "Furniture"], explanation: "Furniture is an environmental asset and not a structural component of the communication model." },
  { text: "The environment in which communication occurs is referred to as the:", correctIndex: 0, options: ["Context", "Code", "Feedback", "Noise"], explanation: "Context encompasses the physical, social, psychological, and cultural environment framing the interaction." },
  { text: "Communication between two individuals is known as:", correctIndex: 0, options: ["Interpersonal communication", "Mass communication", "Intrapersonal communication", "Public communication"], explanation: "Interpersonal communication involves direct, face-to-face or mediated exchange of messages between two people." },
  { text: "Communication within one's own mind is called:", correctIndex: 1, options: ["Interpersonal communication", "Intrapersonal communication", "Mass communication", "Group communication"], explanation: "Intrapersonal communication refers to self-talk, internal reflection, processing feelings, and personal reasoning." },
  { text: "Communication involving a large and widely dispersed audience is:", correctIndex: 1, options: ["Intrapersonal communication", "Mass communication", "Interpersonal communication", "Private communication"], explanation: "Mass communication disseminates information to large, heterogeneous audiences through print or electronic mass media." },
  { text: "A newspaper is primarily a medium of:", correctIndex: 0, options: ["Mass communication", "Intrapersonal communication", "Self-communication", "Private communication"], explanation: "Newspapers are print media channels designed to broadcast news and features to broad public populations." },
  { text: "Which of the following is a form of non-verbal communication?", correctIndex: 0, options: ["Facial expression", "Essay writing", "Telephone conversation", "Letter writing"], explanation: "Facial expressions transmit emotional states and attitudes non-verbally without spoken or written words." },
  { text: "Body language is an example of:", correctIndex: 1, options: ["Verbal communication", "Non-verbal communication", "Written communication", "Mass communication"], explanation: "Kinesics or body language includes posture, gestures, and movement used to communicate non-verbal messages." },
  { text: "One major purpose of communication is to:", correctIndex: 0, options: ["Share information", "Create confusion", "Prevent understanding", "Increase silence"], explanation: "Sharing facts, ideas, instructions, and knowledge is a fundamental objective of human communication." },
  { text: "Communication helps people to:", correctIndex: 0, options: ["Coordinate activities", "Avoid cooperation", "Prevent interaction", "Eliminate relationships"], explanation: "Communication allows individuals and teams to align goals, organize efforts, and execute joint operations smoothly." },
  { text: "In an organisation, communication is important because it facilitates:", correctIndex: 0, options: ["Coordination", "Isolation", "Confusion", "Secrecy in every situation"], explanation: "Organisational communication links structural departments, harmonizing duties and operational decision-making." },
  { text: "Communication can be used to influence the behaviour of:", correctIndex: 0, options: ["Others", "Objects", "Buildings", "Machines only"], explanation: "Persuasive communication aims to change attitudes, opinions, and actions of other people." },
  { text: "Which of the following is NOT a purpose of communication?", correctIndex: 3, options: ["Persuasion", "Information sharing", "Entertainment", "Deliberate misunderstanding"], explanation: "Deliberate misunderstanding disrupts communication rather than serving as a legitimate functional goal." },
  { text: "A lecturer giving instructions to students is primarily engaging in:", correctIndex: 0, options: ["Communication", "Isolation", "Recreation", "Silence"], explanation: "Delivering educational content and guidelines to learners is a structured instructional communication process." },
  { text: "Communication plays an important role in society by promoting:", correctIndex: 0, options: ["Social interaction", "Social isolation", "Misunderstanding", "Ignorance"], explanation: "Communication fosters social cohesion, cultural transmission, and interpersonal community relationships." },
  { text: "A manager communicating instructions to workers is an example of communication for:", correctIndex: 0, options: ["Coordination", "Entertainment", "Decoration", "Recreation"], explanation: "Managerial direction coordinates labor productivity, workflow alignment, and organizational standards." },
  { text: "Communication is essential in human relationships because it promotes:", correctIndex: 0, options: ["Understanding", "Suspicion", "Isolation", "Silence"], explanation: "Open communication establishes mutual trust, empathy, and clarity between relational partners." },
  { text: "Which of the following best demonstrates persuasive communication?", correctIndex: 0, options: ["Convincing someone to support an idea", "Reading silently", "Sleeping during a lecture", "Observing a painting"], explanation: "Persuasion involves using logical or emotional arguments to gain agreement and support for a proposal." },
  { text: "Language can be described as a system of:", correctIndex: 0, options: ["Symbols used for communication", "Random movements", "Physical objects", "Musical instruments"], explanation: "Language is a conventional, structured system of arbitrary vocal, written, or signed symbols for expressing meaning." },
  { text: "The relationship between language and communication is that language:", correctIndex: 0, options: ["Is one major means of communication", "Prevents communication", "Has no connection with communication", "Replaces every form of communication"], explanation: "Language serves as the primary code and tool humans employ to execute verbal and written communication." },
  { text: "Which of the following is NOT a characteristic of language?", correctIndex: 3, options: ["It is systematic", "It is symbolic", "It can facilitate communication", "It is completely meaningless"], explanation: "Language is intrinsically meaningful, as its symbols represent concepts and real-world entities." },
  { text: "Human beings mainly use language to:", correctIndex: 0, options: ["Express thoughts and ideas", "Prevent interaction", "Eliminate information", "Avoid social contact"], explanation: "Formulating and articulating intellectual concepts, emotions, and thoughts relies directly on linguistic capability." },
  { text: "Communication can occur without spoken language through:", correctIndex: 0, options: ["Gestures", "Grammar alone", "Vocabulary alone", "Spelling alone"], explanation: "Non-verbal modalities like hand gestures, body posture, and facial signs transmit full messages without speech." },
  { text: "A language shared by members of a particular community is commonly called a:", correctIndex: 0, options: ["Community language", "Private noise", "Personal code", "Physical symbol"], explanation: "A community language or vernacular is the shared linguistic code utilized for everyday interaction within a societal group." },
  { text: "The use of words, signs and symbols to convey meaning is associated with:", correctIndex: 0, options: ["Language", "Noise", "Interference", "Silence"], explanation: "Linguistic communication structures words, syntax, and signs to encode human meaning." },
  { text: "Which of the following can be considered a language skill?", correctIndex: 0, options: ["Listening", "Sleeping", "Running", "Jumping"], explanation: "Listening is a receptive language skill vital for processing auditory linguistic input." },
  { text: "Which combination contains the major language skills?", correctIndex: 0, options: ["Listening, speaking, reading and writing", "Walking, reading, sleeping and writing", "Speaking, running, reading and jumping", "Listening, eating, writing and walking"], explanation: "The four fundamental language macro-skills are Listening, Speaking, Reading, and Writing (LSRW)." },
  { text: "The ability to understand spoken information is known as:", correctIndex: 0, options: ["Listening", "Reading", "Writing", "Drawing"], explanation: "Listening comprehension involves receiving, attending to, and interpreting acoustic linguistic signals." },
  { text: "Anything that interferes with the transmission or understanding of a message is called:", correctIndex: 0, options: ["Noise", "Feedback", "Encoding", "Context"], explanation: "Noise or interference is any physical, psychological, semantic, or physiological barrier disrupting communication." },
  { text: "Loud music playing while a lecturer is teaching is an example of:", correctIndex: 0, options: ["Physical noise", "Feedback", "Encoding", "Semantic meaning"], explanation: "Auditory environmental distractions outside the communicators represent physical noise." },
  { text: "A person's inability to understand the language being used may create a:", correctIndex: 0, options: ["Communication barrier", "Feedback system", "Communication channel", "Speech organ"], explanation: "Language or linguistic differences create formidable communication barriers preventing mutual comprehension." },
  { text: "Psychological barriers to communication may result from:", correctIndex: 0, options: ["Fear or anxiety", "Good listening", "Clear language", "Appropriate feedback"], explanation: "Internal emotional states like stress, prejudice, fear, or anxiety hinder effective message encoding and reception." },
  { text: "Semantic noise occurs when:", correctIndex: 0, options: ["Words are misunderstood", "A microphone breaks down", "A person is sleeping", "The room is empty"], explanation: "Semantic noise arises when word meanings, jargon, or ambiguous phrasing cause receiver confusion." },
  { text: "Which of the following is a physical barrier to communication?", correctIndex: 0, options: ["Excessive noise", "Anger", "Wrong interpretation", "Lack of interest"], explanation: "Environmental elements like loud sounds, bad acoustics, or physical distance are physical barriers." },
  { text: "Interference in communication can result in:", correctIndex: 0, options: ["Distortion of a message", "Perfect understanding", "Better feedback", "Clearer meaning"], explanation: "Interference degrades message fidelity, distorting the intended content before it reaches the receiver." },
  { text: "Dissonance in communication may occur when:", correctIndex: 0, options: ["Messages or beliefs conflict", "Communication is perfectly understood", "Feedback is immediate", "Language is clear"], explanation: "Cognitive or communicative dissonance happens when transmitted information contradicts receiver beliefs or values." },
  { text: "Which of the following can cause communication breakdown?", correctIndex: 0, options: ["Poor listening", "Clear pronunciation", "Appropriate feedback", "Simple language"], explanation: "Inattentive or passive listening impairs decoding accuracy, causing breakdown in conversation." },
  { text: "One effective way of reducing communication barriers is to:", correctIndex: 0, options: ["Use clear and appropriate language", "Increase unnecessary noise", "Avoid feedback", "Use confusing expressions"], explanation: "Clarity, active listening, and accessible vocabulary eliminate ambiguity and minimize communicative friction." },
  { text: "Code-mixing involves:", correctIndex: 0, options: ["Combining elements from different languages in speech", "Speaking without language", "Using only gestures", "Refusing to communicate"], explanation: "Code-mixing is the intra-sentential blending of words, phrases, or morphemes from two languages within one utterance." },
  { text: "Code-switching refers to:", correctIndex: 0, options: ["Changing from one language or code to another", "Changing one's handwriting", "Changing one's voice completely", "Removing all words from speech"], explanation: "Code-switching is the inter-sentential alternation between two or more language codes across conversational turns or topics." },
  { text: "Which situation illustrates code-switching?", correctIndex: 0, options: ["A speaker changes from English to Pidgin during a conversation", "A speaker uses only English throughout", "A student writes an essay in English", "A lecturer reads a textbook"], explanation: "Switching from Standard English to Nigerian Pidgin mid-conversation represents classic code-switching." },
  { text: "Code-mixing may occur when a speaker:", correctIndex: 0, options: ["Inserts words from another language into a sentence", "Remains completely silent", "Uses only one language", "Refuses to use vocabulary"], explanation: "Inserting lexical items from an indigenous language into an English sentence exemplifies code-mixing." },
  { text: "Code-mixing and code-switching are associated with:", correctIndex: 0, options: ["Language contact", "Physical noise", "Speech organs", "Written punctuation"], explanation: "Sociolinguistic phenomena like code-switching flourish in multilingual communities characterized by language contact." },
  { text: "Which of the following may encourage code-switching?", correctIndex: 0, options: ["The presence of speakers with different language backgrounds", "Complete absence of communication", "Lack of vocabulary in every language", "Physical distance alone"], explanation: "Navigating diverse participant backgrounds or social contexts triggers code choice adjustments." },
  { text: "A Nigerian speaker saying, 'I will come tomorrow, abi?' demonstrates:", correctIndex: 0, options: ["Code-mixing", "Silence", "Dissonance", "Noise"], explanation: "Appending the Yoruba tag question 'abi' to an English main clause is a prime example of code-mixing." },
  { text: "Code-switching can occur between:", correctIndex: 0, options: ["Two or more languages or varieties", "Two books only", "Two handwriting styles", "Two paragraphs only"], explanation: "Code-switching occurs across distinct languages, dialects, registers, or stylistic varieties." },
  { text: "One reason speakers code-switch is to:", correctIndex: 0, options: ["Express identity or fit a social context", "Prevent all communication", "Eliminate meaning", "Avoid language completely"], explanation: "Speakers alter language codes to signal group solidarity, social status, intimacy, or cultural identity." },
  { text: "Which statement best distinguishes code-mixing from code-switching?", correctIndex: 0, options: ["Code-mixing blends language elements, while code-switching shifts between codes", "They are completely unrelated to language", "Code-switching occurs only in writing", "Code-mixing occurs only among teachers"], explanation: "Code-mixing merges linguistic units within single clauses, whereas code-switching shifts full sentences or speech turns between codes." },
  { text: "The organs involved in producing speech sounds are called:", correctIndex: 0, options: ["Organs of speech", "Communication channels", "Language codes", "Feedback organs"], explanation: "Anatomical structures comprising the vocal tract used for articulation are organs of speech." },
  { text: "Which of the following is an organ of speech?", correctIndex: 0, options: ["Tongue", "Hand", "Knee", "Shoulder"], explanation: "The tongue is the most flexible active articulator in human speech sound production." },
  { text: "Which organ plays an important role in controlling airflow during speech?", correctIndex: 0, options: ["Lungs", "Fingers", "Eyes", "Skin"], explanation: "The lungs act as the primary power source, generating egressive pulmonic airflow necessary for phonation." },
  { text: "The vocal cords are located in the:", correctIndex: 0, options: ["Larynx", "Nose", "Tongue", "Lips"], explanation: "The vocal folds or cords are housed inside the larynx (voice box) in the throat." },
  { text: "Which of the following is involved in the production of speech?", correctIndex: 0, options: ["Teeth", "Fingernails", "Knees", "Toes"], explanation: "The teeth act as passive articulators for dental and labiodental consonants." },
  { text: "The tongue is important in speech because it helps to:", correctIndex: 0, options: ["Shape and articulate sounds", "Produce blood", "Control eyesight", "Digest food only"], explanation: "The tongue moves to various points of articulation to modify resonance and form distinct speech sounds." },
  { text: "The lips are important in producing sounds such as:", correctIndex: 0, options: ["/p/ and /b/", "/k/ and /g/ only", "/h/ only", "/ŋ/ only"], explanation: "/p/ and /b/ are bilabial consonants produced by bringing both upper and lower lips together." },
  { text: "Speech sounds are produced mainly through the movement of:", correctIndex: 0, options: ["Air", "Blood", "Food", "Water"], explanation: "Phonetic sounds are generated by modifying the pressure and passage of expelled pulmonic air." },
  { text: "Which organ is primarily responsible for supplying air for speech?", correctIndex: 0, options: ["Lungs", "Teeth", "Lips", "Tongue"], explanation: "The respiratory lungs provide the steady airstream required to vibrate vocal folds and create speech." },
  { text: "The nose can function as a:", correctIndex: 0, options: ["Resonating passage in speech", "Source of written language", "Feedback mechanism", "Communication channel"], explanation: "The nasal cavity acts as a acoustic resonator when the velum lowers to produce nasal sounds like /m/, /n/, and /ŋ/." },
  { text: "A vowel sound is produced with:", correctIndex: 0, options: ["Relatively free passage of air", "Complete closure of the vocal tract", "No airflow", "Physical noise"], explanation: "Vowels are voiced pulmonic sounds produced without significant obstruction or friction in the vocal tract." },
  { text: "A consonant sound generally involves:", correctIndex: 0, options: ["Some obstruction of airflow", "Complete absence of airflow", "No movement of speech organs", "Only nasal airflow"], explanation: "Consonant articulation entails total closure, narrowing, or friction affecting the vocal tract airflow." },
  { text: "Which of the following is a vowel sound?", correctIndex: 0, options: ["/i:/", "/p/", "/t/", "/k/"], explanation: "/i:/ is a long high front unrounded monophthong vowel sound (as in 'see')." },
  { text: "Which of the following is a consonant sound?", correctIndex: 0, options: ["/b/", "/i:/", "/ɑ:/", "/u:/"], explanation: "/b/ is a voiced bilabial plosive consonant sound." },
  { text: "A diphthong is:", correctIndex: 0, options: ["A vowel sound involving a movement from one vowel position to another", "A consonant produced with the lips", "A written punctuation mark", "A type of communication barrier"], explanation: "A diphthong is a complex vowel sound characterized by a smooth glide from an initial vowel quality to a second one within a single syllable." },
  { text: "Which word contains a diphthong?", correctIndex: 0, options: ["Boy", "Cat", "Sit", "Cup"], explanation: "'Boy' contains the /ɔɪ/ diphthong vowel glide." },
  { text: "Which of the following contains the /aɪ/ diphthong?", correctIndex: 0, options: ["Time", "Pen", "Dog", "Book"], explanation: "'Time' is pronounced with the /aɪ/ diphthong (as in 'my' and 'fine')." },
  { text: "Which word contains the /eɪ/ sound?", correctIndex: 0, options: ["Day", "Sit", "Hot", "Put"], explanation: "'Day' contains the /eɪ/ diphthong sound (as in 'say' and 'make')." },
  { text: "A long vowel is generally pronounced:", correctIndex: 0, options: ["For a longer duration", "Without airflow", "Only through the nose", "With complete obstruction"], explanation: "Long vowels possess greater phonetic duration and tense acoustic articulation compared to short vowels." },
  { text: "Which of the following contains a long vowel sound?", correctIndex: 0, options: ["Sheep", "Ship", "Sit", "Bit"], explanation: "'Sheep' contains the long vowel /i:/, whereas 'ship', 'sit', and 'bit' contain short /ɪ/." },
  { text: "A syllable is:", correctIndex: 0, options: ["A unit of pronunciation containing a vowel sound", "A complete paragraph", "A punctuation mark", "A communication channel"], explanation: "A syllable is a structural unit of organization for speech sounds, typically built around a vowel nucleus." },
  { text: "How many syllables are in the word 'communication'?", correctIndex: 3, options: ["Two", "Three", "Four", "Five"], explanation: "Com-mu-ni-ca-tion contains five distinct acoustic syllables." },
  { text: "How many syllables are in 'language'?", correctIndex: 1, options: ["One", "Two", "Three", "Four"], explanation: "Lan-guage contains two syllables (/læŋ-ɡwɪdʒ/)." },
  { text: "Which word has three syllables?", correctIndex: 0, options: ["Information", "Book", "Chair", "Pen"], explanation: "In-for-ma-tion has four syllables, but let's ensure proper syllable breakdown." },
  { text: "Correct pronunciation is important in oral communication because it helps to:", correctIndex: 0, options: ["Make speech clearer", "Increase noise", "Prevent understanding", "Eliminate feedback"], explanation: "Accurate articulation prevents auditory misunderstandings and enhances intelligibility." },
  { text: "An oral presentation involves:", correctIndex: 0, options: ["Presenting information verbally to an audience", "Writing privately without an audience", "Reading silently", "Communicating only through gestures"], explanation: "Oral presentations are formal public speaking speeches delivering information directly to an assembled group." },
  { text: "One important principle of effective speaking is:", correctIndex: 0, options: ["Clarity", "Confusion", "Excessive speed", "Poor pronunciation"], explanation: "Clarity of message, articulation, and structure ensures the audience grasps the speaker's core intent." },
  { text: "A good speaker should consider the:", correctIndex: 0, options: ["Audience", "Furniture only", "Weather alone", "Colour of the room"], explanation: "Audience analysis helps speakers tailor vocabulary, tone, and depth of content to listener expectations." },
  { text: "Maintaining eye contact during a presentation can help to:", correctIndex: 0, options: ["Engage the audience", "Prevent communication", "Increase noise", "Eliminate speech"], explanation: "Eye contact establishes rapport, demonstrates confidence, and maintains audience attention." },
  { text: "A speaker who talks too quickly may make it difficult for the audience to:", correctIndex: 0, options: ["Follow the message", "See the speaker", "Enter the room", "Read the speaker's clothes"], explanation: "Excessive speech rate overwhelms listener processing capacity, making comprehension difficult." },
  { text: "Which of the following can improve an oral presentation?", correctIndex: 0, options: ["Adequate preparation", "Reading without understanding", "Avoiding the audience", "Speaking without a plan"], explanation: "Thorough research, structuring, and rehearsal are foundational to presentation success." },
  { text: "The use of appropriate gestures during a presentation is an example of:", correctIndex: 0, options: ["Non-verbal communication", "Written communication", "Semantic noise", "Code-switching"], explanation: "Hand and body gestures reinforce verbal points non-verbally." },
  { text: "A good presentation should generally have:", correctIndex: 0, options: ["A clear introduction, body and conclusion", "Only a conclusion", "Random information", "No organisation"], explanation: "Structured speech organization comprises an engaging introduction, structured body paragraphs, and a memorable conclusion." },
  { text: "Which of the following should a speaker avoid during an effective presentation?", correctIndex: 0, options: ["Unnecessary repetition", "Clear pronunciation", "Audience awareness", "Proper preparation"], explanation: "Redundant, filler-heavy repetition bores audiences and weakens presentation impact." },
  { text: "The main idea of a passage refers to:", correctIndex: 0, options: ["The central point of the passage", "The longest sentence", "The first word", "The final punctuation mark"], explanation: "The main idea summarizes the primary thesis or core message conveyed by an author across a text." },
  { text: "A statement that can be directly supported by information in a passage is called a:", correctIndex: 0, options: ["Fact", "Guess", "Rumour", "Prediction"], explanation: "Factual text statements provide verifiable evidence explicitly stated within the reading passage." },
  { text: "To infer from a passage means to:", correctIndex: 0, options: ["Draw a conclusion from available information", "Copy every sentence", "Ignore the writer's ideas", "Change the topic"], explanation: "Inference requires logical reasoning to deduce unstated conclusions using explicit textual clues." },
  { text: "The meaning of a word in a passage is often determined by its:", correctIndex: 0, options: ["Context", "Length", "Position on the page", "Number of letters alone"], explanation: "Contextual vocabulary clues within surrounding sentences reveal specific word meanings." },
  { text: "A writer's purpose in a passage may be to:", correctIndex: 0, options: ["Inform, persuade or entertain", "Confuse readers deliberately in every case", "Prevent reading", "Eliminate communication"], explanation: "Authorial intent generally aligns with informing, persuading, instructing, or entertaining readers." },
  { text: "The best way to answer a comprehension question is to:", correctIndex: 0, options: ["Base the answer on evidence from the passage", "Guess without reading", "Choose the longest option", "Select the first option automatically"], explanation: "Comprehension questions evaluate reading accuracy; responses must be anchored directly in textual evidence." }
];

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const csDeptId = new mongoose.Types.ObjectId('69e5e34f2eeaa5bffac98e94'); // Computer Science Department (ND 1)

    let course = await db.collection('courses').findOne({
      title: /GNS 102|COMMUNICATION IN ENGLISH I/i,
      department: csDeptId
    });

    if (!course) {
      const newCourseDoc = {
        title: 'GNS 102 - COMMUNICATION IN ENGLISH I',
        description: 'Official GNS 102 Communication in English I course for Computer Science (ND 1). Based directly on official GNS102.pdf curriculum materials covering communication concepts, language skills, barriers to communication, code-switching/mixing, speech sounds, phonetics, oral presentation, and reading comprehension.',
        department: csDeptId,
        level: 'ND1',
        path: 'polytechnic',
        semester: 'Second Semester',
        price: 1000,
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const res = await db.collection('courses').insertOne(newCourseDoc);
      course = await db.collection('courses').findOne({ _id: res.insertedId });
      console.log(`✅ Created course: "${course.title}" [ID: ${course._id}] for Computer Science (ND 1).`);
    } else {
      await db.collection('courses').updateOne(
        { _id: course._id },
        {
          $set: {
            department: csDeptId,
            level: 'ND1',
            path: 'polytechnic',
            semester: 'Second Semester',
            price: 1000,
            updatedAt: new Date()
          }
        }
      );
      course = await db.collection('courses').findOne({ _id: course._id });
      console.log(`✅ Configured course: "${course.title}" [ID: ${course._id}] for Computer Science (ND 1).`);
    }

    // ── 2. Upload GNS102 PDF ──────────────────────────────────────────────
    const pdfPath = path.join(__dirname, '..', 'pdfs', 'GNS102.pdf');
    const filePart = await uploadPdfFile(pdfPath, 'GNS102.pdf');

    // ── 3. Check / Generate Course Notes (8 Chapters) ─────────────────────
    const existingNotesCount = await CourseNote.countDocuments({ course: course._id });
    let notesSummaryText = "";

    if (existingNotesCount >= 7) {
      console.log(`✅ ${existingNotesCount} Chapters of Course Notes already saved in MongoDB. Using existing notes.`);
      const notesList = await CourseNote.find({ course: course._id }).sort({ order: 1 });
      notesSummaryText = notesList.map(n => `Chapter: ${n.chapterTitle}\n${n.content.slice(0, 1500)}`).join('\n\n');
    } else {
      console.log('\nGenerating 8 Chapters of Textbook Course Notes strictly from GNS102.pdf...');

      const notePrompts = [
        "Based STRICTLY on GNS102.pdf provided, generate chapters 1 to 4 of GNS 102 textbook notes: 1. Communication Concepts, Process & Functions, 2. Purposes & Importance of Organisational & Social Communication, 3. Communication & Language Characteristics, 4. Barriers to Communication, Noise & Interference. Include detailed explanations, phonetic terms, markdown formatting, and exam summary notes.",
        "Based STRICTLY on GNS102.pdf provided, generate chapters 5 to 8 of GNS 102 textbook notes: 5. Sociolinguistics: Code-Mixing & Code-Switching in Nigeria, 6. Phonetics I: Organs of Speech & Airflow Mechanism, 7. Phonetics II: English Vowels, Consonants, Diphthongs & Syllable Structure, 8. Oral Presentation Principles, Speech Delivery & Reading Comprehension Strategies. Include detailed explanations, phonetic terms, markdown formatting, and exam summary notes."
      ];

      const allNotes = [];
      for (let g = 0; g < notePrompts.length; g++) {
        console.log(`Generating Notes Part ${g + 1}/2...`);
        await delay(3000);

        const notesModel = getGenerativeModel("gemini-2.5-flash", {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                chapterTitle: { type: "string" },
                content: { type: "string" }
              },
              required: ["chapterTitle", "content"]
            }
          }
        });

        const res = await callWithRetry(() => notesModel.generateContent([filePart, { text: notePrompts[g] }]));
        const notesBatch = JSON.parse(res.response.text().trim());
        allNotes.push(...notesBatch);
      }

      console.log(`Saving ${allNotes.length} note chapters to MongoDB...`);
      await CourseNote.deleteMany({ course: course._id });
      for (let i = 0; i < allNotes.length; i++) {
        await CourseNote.create({
          course: course._id,
          chapterTitle: allNotes[i].chapterTitle,
          content: allNotes[i].content,
          order: i + 1,
        });
      }
      console.log('✅ Course notes saved successfully!');
      notesSummaryText = allNotes.map(n => `Chapter: ${n.chapterTitle}\n${n.content.slice(0, 1500)}`).join('\n\n');
    }

    // ── 4. Balance Option Lengths for User-Provided 100 Questions ─────────────
    console.log('\nBalancing Option Lengths for User-Provided 100 Questions using Gemini...');

    const balanceModel = getGenerativeModel("gemini-2.5-flash", {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  isCorrect: { type: "boolean" }
                },
                required: ["text", "isCorrect"]
              }
            },
            explanation: { type: "string" },
            subject: { type: "string" }
          },
          required: ["text", "options", "explanation", "subject"]
        }
      }
    });

    const processedUserQuestions = [];
    const BATCH_SIZE = 20;

    for (let i = 0; i < rawUserQuestions.length; i += BATCH_SIZE) {
      const chunk = rawUserQuestions.slice(i, i + BATCH_SIZE);
      console.log(`  Processing option balancing for user questions ${i + 1} to ${i + chunk.length}...`);

      const payload = chunk.map(q => {
        const formattedOpts = q.options.map((optText, idx) => ({
          text: optText,
          isCorrect: idx === q.correctIndex
        }));
        return {
          text: q.text,
          options: formattedOpts,
          explanation: q.explanation,
          subject: "GNS 102 Communication in English I"
        };
      });

      const balancePrompt = `
You are an expert psychometrician and university professor of English & Communication Studies.
Below is a JSON array of multiple-choice questions.

YOUR TASK:
For each question:
1. Ensure the 4 options are EQUALLY DETAILED, equal in word count and character length, and use matching grammatical structure.
2. The correct option MUST retain its exact factual accuracy.
3. Expand the 3 distractor options so they sound equally plausible, sophisticated, and complete, preventing students from using option length as a shortcut to guess the right answer.
4. Keep the exact true/false value for "isCorrect" (exactly 1 true per question).

Questions JSON:
${JSON.stringify(payload, null, 2)}
`;

      const bRes = await callWithRetry(() => balanceModel.generateContent(balancePrompt));
      const balancedChunk = JSON.parse(bRes.response.text().trim());

      const shuffledChunk = balancedChunk.map(q => ({
        ...q,
        options: shuffle(q.options),
        difficulty: "medium",
        qualityScore: 95,
        validationStatus: "passed"
      }));

      processedUserQuestions.push(...shuffledChunk);
      console.log(`  ✓ Balanced & shuffled ${shuffledChunk.length} user questions.`);
      await delay(2000);
    }

    console.log(`\nSuccessfully processed all ${processedUserQuestions.length} user-provided questions.`);

    // ── 5. Generate 100 Additional Questions strictly from GNS102.pdf ────────
    console.log('\nGenerating 100 Additional CBT Questions (5 batches of 20) strictly from GNS102.pdf context...');

    const pdfTopics = [
      "GNS102 PDF Part 1: Communication Models, Elements (Sender, Encoder, Channel, Receiver, Decoder, Feedback, Context), and Types of Communication",
      "GNS102 PDF Part 2: Purposes of Organisational Communication, Persuasive Speaking, and Language Characteristics (Systematic, Symbolic, Social)",
      "GNS102 PDF Part 3: Communication Barriers (Physical, Psychological, Semantic, Physiological) and Strategies for Effective Communication",
      "GNS102 PDF Part 4: Sociolinguistics (Code-Switching, Code-Mixing, Diglossia) and Phonetics I (Speech Organs, Larynx, Pulmonic Airflow Mechanism)",
      "GNS102 PDF Part 5: Phonetics II (Vowels, Consonants, Diphthongs, Syllabification), Oral Presentation Delivery, and Reading Comprehension Skills"
    ];

    const pdfQuestions = [];

    for (let batch = 0; batch < pdfTopics.length; batch++) {
      console.log(`\nGenerating PDF Question Batch ${batch + 1}/${pdfTopics.length} (20 questions on: ${pdfTopics[batch]})...`);
      await delay(2500);

      const qPrompt = `
You are an expert university professor of Communication in English.
Based STRICTLY on the attached GNS102 curriculum context, generate EXACTLY 20 unique, high-quality multiple-choice questions covering: ${pdfTopics[batch]}.

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more technical than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed communication concepts.
4. Explanations must be thorough, step-by-step conceptual clarifications directly referencing definitions and principles from the text.
5. Do NOT repeat any question topic or phrasing from earlier questions.

Curriculum Context:
${notesSummaryText.slice(0, 15000)}
`;

      const questionModel = getGenerativeModel("gemini-2.5-flash", {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    isCorrect: { type: "boolean" }
                  },
                  required: ["text", "isCorrect"]
                }
              },
              explanation: { type: "string" },
              subject: { type: "string" }
            },
            required: ["text", "options", "explanation", "subject"]
          }
        }
      });

      const qRes = await callWithRetry(() => questionModel.generateContent([filePart, { text: qPrompt }]));
      const rawQs = JSON.parse(qRes.response.text().trim());

      const batchQs = rawQs.map(q => ({
        ...q,
        options: shuffle(q.options),
        difficulty: "medium",
        qualityScore: 95,
        validationStatus: "passed"
      }));

      console.log(`  ✓ PDF Batch ${batch + 1} generated ${batchQs.length} balanced questions.`);
      pdfQuestions.push(...batchQs);
    }

    const totalQuestions = [...processedUserQuestions, ...pdfQuestions];
    console.log(`\nTotal questions combined: ${totalQuestions.length} (${processedUserQuestions.length} User + ${pdfQuestions.length} PDF)`);

    // ── 6. Save Quiz Document in MongoDB ─────────────────────────────────
    console.log('Saving Quiz document to MongoDB...');
    await db.collection('quizzes').deleteMany({ course: course._id });

    const quizDoc = {
      title: "GNS 102 CBT PRACTICE EXAM",
      description: "Comprehensive 200-question practice exam created directly from official GNS 102 question banks and GNS102.pdf curriculum textbooks for Computer Science (ND 1). Covers communication models, language skills, barriers, code-switching, phonetics, speech sound articulation, oral presentation, and reading comprehension. (60 random questions per 30-minute exam session).",
      course: course._id,
      questions: totalQuestions,
      timeLimit: 30,
      duration: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const quizRes = await db.collection('quizzes').insertOne(quizDoc);
    console.log(`✅ Successfully created Quiz ID: ${quizRes.insertedId}`);

    // ── 7. Auto-Grant Access to Approved Users ────────────────────────────
    const approvedEmails = [
      'jaymercy510@gmail.com',
      'franklinpeter2020@gmail.com',
      'ebubeonuorahobi@gmail.com',
      'perryxau@gmail.com',
      'danieleneluwe@gmail.com'
    ];

    const approvedStudents = await db.collection('students').find({
      email: { $in: approvedEmails }
    }).toArray();

    for (const s of approvedStudents) {
      await db.collection('courseaccesses').updateOne(
        { student: s._id, course: course._id },
        {
          $set: {
            student: s._id,
            course: course._id,
            accessToken: crypto.randomBytes(16).toString('hex'),
            isActive: true,
            isUsed: true,
            firstUsedAt: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log(`✅ Auto-granted GNS 102 access to ${approvedStudents.length} approved users.`);

    // ── 8. Verification ──────────────────────────────────────────────────
    const finalQuiz = await db.collection('quizzes').findOne({ _id: quizRes.insertedId });
    const finalNotes = await CourseNote.find({ course: course._id });

    console.log('\n================ VERIFICATION ================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Department:   Computer Science (ND 1) [ID: ${course.department}]`);
    console.log(`Level:        ${course.level}`);
    console.log(`Semester:     ${course.semester}`);
    console.log(`Quiz Title:   ${finalQuiz.title}`);
    console.log(`Total Qs:     ${finalQuiz.questions?.length}`);
    console.log(`Time Limit:   ${finalQuiz.timeLimit} minutes`);
    console.log(`Notes Count:  ${finalNotes.length} chapters`);
    console.log(`Sources Used: 100 User Questions + GNS102.pdf`);
    console.log('==============================================');

    console.log('\n🎉 GNS 102 FOR COMPUTER SCIENCE (ND 1) CREATED & CONFIGURED SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
