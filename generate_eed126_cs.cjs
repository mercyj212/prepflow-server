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

async function callWithRetry(fn, retries = 10, initialDelay = 5000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || '';
      console.log(`  ⚠️ Error encountered (${msg.slice(0, 80)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
      rotateKey();
      await delay(waitTime);
      waitTime = Math.round(waitTime * 1.4);
    }
  }
  throw new Error("Max retries exceeded");
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const rawUserQuestions = [
  { text: "Who is an entrepreneur?", correctIndex: 1, options: ["A person who only works for government", "A person who identifies opportunities and takes risks to establish a business", "A person who avoids all forms of risk", "A person who only buys goods for personal use"], explanation: "An entrepreneur is an individual who identifies business opportunities, gathers resources, and assumes calculated risks to establish and manage a business enterprise." },
  { text: "Entrepreneurship can best be described as the process of:", correctIndex: 1, options: ["Avoiding business activities", "Identifying opportunities and creating value through business activities", "Working only in government establishments", "Saving money in a bank"], explanation: "Entrepreneurship is the process of discovering opportunities, organizing resources, innovating, and creating economic value through commercial activities." },
  { text: "An enterprise refers to:", correctIndex: 0, options: ["A business undertaking", "A government ministry", "A family gathering", "A social club"], explanation: "An enterprise is an organization or business venture established for commercial, industrial, or professional activities." },
  { text: "Which of the following is a major characteristic of an entrepreneur?", correctIndex: 1, options: ["Laziness", "Risk-taking", "Dependence", "Indecision"], explanation: "Risk-taking is a fundamental entrepreneurial trait, representing the willingness to invest time, effort, and capital under conditions of uncertainty." },
  { text: "An entrepreneur who introduces a completely new product or method is known as a/an:", correctIndex: 0, options: ["Innovative entrepreneur", "Drone entrepreneur", "Imitative entrepreneur", "Speculative entrepreneur"], explanation: "Innovative entrepreneurs introduce novel products, pioneering technologies, or original business methods into the market." },
  { text: "An entrepreneur who copies or adapts an existing business idea is called:", correctIndex: 1, options: ["Innovative entrepreneur", "Imitative entrepreneur", "Drone entrepreneur", "Public entrepreneur"], explanation: "Imitative entrepreneurs adopt and adapt successful business concepts and technology proven by innovators." },
  { text: "A drone entrepreneur is one who:", correctIndex: 1, options: ["Easily accepts changes", "Refuses to change traditional methods", "Always introduces innovations", "Works only in government"], explanation: "Drone entrepreneurs resist technological advancements or modern operational changes, clinging to traditional practices even at a loss." },
  { text: "Which of the following is NOT a characteristic of entrepreneurship?", correctIndex: 3, options: ["Creativity", "Risk-taking", "Initiative", "Fear of every opportunity"], explanation: "Fear of opportunities contradicts entrepreneurial initiative, as entrepreneurs actively seek and capitalize on business possibilities." },
  { text: "Entrepreneurs are generally regarded as people who:", correctIndex: 0, options: ["Create employment opportunities", "Eliminate all businesses", "Depend entirely on government", "Avoid innovation"], explanation: "Entrepreneurs create employment by founding business ventures that hire workforce members across various skill levels." },
  { text: "One important role of entrepreneurship in an economy is:", correctIndex: 1, options: ["Increasing unemployment", "Creating employment", "Reducing production", "Discouraging innovation"], explanation: "Entrepreneurship expands job opportunities, boosts GDP, fosters innovation, and drives national economic expansion." },
  { text: "Self-employment means:", correctIndex: 1, options: ["Working for another person", "Working for oneself", "Working without receiving income", "Working only for government"], explanation: "Self-employment involves operating one's own business or practice rather than working for an employer." },
  { text: "Wage employment involves:", correctIndex: 1, options: ["Working for oneself without income", "Working for an employer in return for wages or salary", "Owning several businesses", "Investing in shares only"], explanation: "Wage employment is a contractual relationship where an individual works for an organization in exchange for agreed wages or salary." },
  { text: "Which of the following is an advantage of self-employment?", correctIndex: 0, options: ["Greater independence", "Guaranteed salary", "No responsibility", "Fixed working hours in every case"], explanation: "Self-employment provides freedom of decision-making, autonomy, and direct control over business strategic directions." },
  { text: "Which of the following is an advantage of wage employment?", correctIndex: 1, options: ["Guaranteed ownership of the company", "Regular salary", "Complete control of the business", "Unlimited profit"], explanation: "Wage employment provides predictable, steady income through scheduled salary disbursements regardless of market fluctuations." },
  { text: "A major disadvantage of self-employment is:", correctIndex: 1, options: ["Independence", "Risk of business failure", "Opportunity for profit", "Personal control"], explanation: "Self-employed business owners bear full financial risk, including potential business insolvency and income instability." },
  { text: "A person who works for an organization and receives a regular salary is in:", correctIndex: 1, options: ["Self-employment", "Wage employment", "Entrepreneurship only", "Informal employment only"], explanation: "Working for an established firm for periodic compensation defines wage employment." },
  { text: "One major difference between self-employment and wage employment is that:", correctIndex: 0, options: ["Self-employed persons generally own/control their work", "Wage earners own every company they work for", "Self-employed persons cannot make profits", "Wage employment involves no work"], explanation: "Self-employed individuals retain ownership and operational authority over their business, whereas wage employees work under organizational direction." },
  { text: "Which of the following can motivate a person to become an entrepreneur?", correctIndex: 0, options: ["Desire for independence", "Fear of success", "Hatred for innovation", "Desire to avoid opportunities"], explanation: "The pursuit of personal independence, financial freedom, and self-actualization motivates entrepreneurial careers." },
  { text: "Entrepreneurship contributes to economic development through:", correctIndex: 0, options: ["Wealth creation", "Increased dependency", "Reduced production", "Business closure"], explanation: "Entrepreneurship generates national wealth by combining resources to produce goods, services, and capital accumulation." },
  { text: "An entrepreneur's ability to accept calculated uncertainty is known as:", correctIndex: 0, options: ["Risk-taking", "Laziness", "Dependency", "Withdrawal"], explanation: "Calculated risk-taking involves evaluating potential losses and benefits before committing capital to commercial endeavors." },
  { text: "Which of the following is an entrepreneurial skill?", correctIndex: 0, options: ["Communication", "Sleeping", "Avoidance", "Procrastination"], explanation: "Effective interpersonal and professional communication is essential for negotiation, marketing, leadership, and investor relations." },
  { text: "Creativity in entrepreneurship involves:", correctIndex: 0, options: ["Producing new ideas", "Rejecting every idea", "Avoiding problems", "Copying everything without modification"], explanation: "Creativity is the intellectual capacity to formulate original ideas, novel concepts, and innovative solutions to market problems." },
  { text: "Innovation refers to:", correctIndex: 0, options: ["Introducing new or improved ideas, products or processes", "Refusing to change", "Closing an existing business", "Avoiding technology"], explanation: "Innovation is the commercial implementation of creative concepts, resulting in new or enhanced products, services, or procedures." },
  { text: "An entrepreneur must have the ability to make decisions because:", correctIndex: 0, options: ["Business activities require choices", "Government makes every business decision", "Customers make all decisions", "Employees own every business"], explanation: "Decisiveness enables entrepreneurs to navigate operational challenges, resource allocation, and strategic direction efficiently." },
  { text: "Which quality enables an entrepreneur to continue despite difficulties?", correctIndex: 0, options: ["Persistence", "Fear", "Indifference", "Confusion"], explanation: "Persistence or perseverance sustains entrepreneurial effort through setbacks, market shifts, and initial financial hurdles." },
  { text: "Foresight and vision are important entrepreneurial:", correctIndex: 0, options: ["Characteristics", "Expenses", "Liabilities", "Taxes"], explanation: "Foresight and vision allow entrepreneurs to anticipate market trends, identify future needs, and formulate long-term strategy." },
  { text: "Self-confidence enables an entrepreneur to:", correctIndex: 0, options: ["Believe in his or her abilities", "Avoid every opportunity", "Depend completely on others", "Refuse to make decisions"], explanation: "Self-confidence instills trust in one's skills, judgement, and capacity to overcome business obstacles." },
  { text: "Which of the following is NOT an entrepreneurial competency?", correctIndex: 3, options: ["Goal setting", "Information seeking", "Persistence", "Deliberate failure"], explanation: "Deliberate failure is detrimental to business sustainability and is incompatible with entrepreneurial achievement competencies." },
  { text: "Opportunity recognition means the ability to:", correctIndex: 0, options: ["Identify potentially profitable business possibilities", "Avoid customers", "Close businesses", "Increase expenses unnecessarily"], explanation: "Opportunity recognition is the core skill of detecting unmet consumer needs and transforming them into commercial ventures." },
  { text: "An entrepreneur should conduct market research mainly to:", correctIndex: 0, options: ["Understand customers and market conditions", "Avoid customers", "Eliminate competition", "Increase taxes"], explanation: "Market research provides essential intelligence regarding target audience preferences, industry trends, and competitor dynamics." },
  { text: "A business opportunity exists when:", correctIndex: 0, options: ["A need can potentially be satisfied profitably", "There are no customers", "There is no demand", "Production is impossible"], explanation: "A genuine business opportunity arises when a market demand or problem can be addressed through a profitable solution." },
  { text: "Which of the following is a source of business ideas?", correctIndex: 0, options: ["Customer complaints", "Ignoring market problems", "Avoiding technology", "Refusing to observe society"], explanation: "Customer complaints highlight unfulfilled expectations and product flaws, serving as valuable catalysts for new business ideas." },
  { text: "A feasibility study is carried out to determine whether:", correctIndex: 0, options: ["A proposed business is viable", "Employees should be dismissed", "Customers should be avoided", "Government should close a business"], explanation: "A feasibility study assesses technical, financial, market, and operational viability before investing capital in a venture." },
  { text: "A feasibility report provides information about the:", correctIndex: 0, options: ["Viability of a proposed business", "Entrepreneur's family history only", "Weather condition only", "Political party of the entrepreneur"], explanation: "The feasibility report summarizes analytical data regarding market demand, financial projections, operational requirements, and ROI." },
  { text: "Which of the following should be considered when assessing a business opportunity?", correctIndex: 0, options: ["Market demand", "The entrepreneur's favourite colour", "Personal entertainment", "Family celebrations"], explanation: "Market demand determines whether sufficient purchasing customers exist to support commercial operations." },
  { text: "A business plan is:", correctIndex: 0, options: ["A written document describing a proposed business and how it will operate", "A personal diary", "A government constitution", "A school timetable"], explanation: "A business plan is a formal document detailing business goals, strategies, target markets, operational structures, and financial forecasts." },
  { text: "One important purpose of a business plan is to:", correctIndex: 0, options: ["Guide business operations", "Prevent planning", "Eliminate customers", "Increase uncertainty"], explanation: "A business plan acts as a strategic roadmap for internal management and a pitch document for external investors and banks." },
  { text: "Which of the following is commonly included in a business plan?", correctIndex: 0, options: ["Marketing strategy", "Birthday records", "Family photographs", "Personal entertainment schedule"], explanation: "A marketing strategy defines branding, pricing, distribution channels, and promotional activities necessary to generate sales." },
  { text: "SWOT analysis stands for:", correctIndex: 0, options: ["Strengths, Weaknesses, Opportunities and Threats", "Skills, Work, Operations and Technology", "Sales, Wealth, Output and Trade", "Strength, Work, Organisation and Training"], explanation: "SWOT stands for Strengths, Weaknesses, Opportunities, and Threats, evaluating internal capacities and external market conditions." },
  { text: "In SWOT analysis, 'S' represents:", correctIndex: 1, options: ["Sales", "Strengths", "Strategy", "Skills"], explanation: "In SWOT analysis, S represents Strengths—internal capabilities and competitive advantages of the organization." },
  { text: "In SWOT analysis, 'W' represents:", correctIndex: 1, options: ["Wealth", "Weaknesses", "Work", "Wages"], explanation: "In SWOT analysis, W represents Weaknesses—internal limitations or resource deficiencies that hinder organizational performance." },
  { text: "In SWOT analysis, 'O' represents:", correctIndex: 1, options: ["Operations", "Opportunities", "Organisation", "Output"], explanation: "In SWOT analysis, O represents Opportunities—favorable external market conditions that the business can exploit." },
  { text: "In SWOT analysis, 'T' represents:", correctIndex: 1, options: ["Trade", "Threats", "Technology", "Training"], explanation: "In SWOT analysis, T represents Threats—external risks or adverse market shifts that could harm business performance." },
  { text: "Which of the following is an internal factor in SWOT analysis?", correctIndex: 0, options: ["Strength", "Threat", "Opportunity", "Government policy"], explanation: "Strengths and Weaknesses are internal factors controllable by the enterprise." },
  { text: "Which of the following is an external factor in SWOT analysis?", correctIndex: 2, options: ["Strength", "Weakness", "Opportunity", "Internal skill"], explanation: "Opportunities and Threats originate from the external macro and micro environments outside direct organizational control." },
  { text: "A competitor entering the market can be classified under SWOT as a:", correctIndex: 3, options: ["Strength", "Weakness", "Opportunity", "Threat"], explanation: "New market entrants pose external competitive threats that can erode market share and revenue." },
  { text: "Having highly skilled employees can be considered a business:", correctIndex: 0, options: ["Strength", "Threat", "Weakness", "Liability"], explanation: "A competent, well-trained workforce is an internal strength enhancing operational quality and innovation." },
  { text: "Lack of adequate capital may be considered a:", correctIndex: 1, options: ["Strength", "Weakness", "Opportunity", "Threat"], explanation: "Insufficient capital is an internal organizational weakness restricting expansion, inventory acquisition, and marketing." },
  { text: "An increase in demand for a product may represent a/an:", correctIndex: 0, options: ["Opportunity", "Weakness", "Threat", "Liability"], explanation: "Rising market demand is an external opportunity to scale production, increase prices, and boost profitability." },
  { text: "Which of the following is an example of a threat to a business?", correctIndex: 1, options: ["Strong customer demand", "New government regulation that increases operating costs", "Skilled workers", "Good reputation"], explanation: "Stringent regulations increasing compliance costs represent external threats to enterprise profit margins." },
  { text: "Sole proprietorship is a business owned by:", correctIndex: 0, options: ["One person", "Two governments", "Shareholders only", "A cooperative society"], explanation: "A sole proprietorship is owned, managed, and controlled by a single individual." },
  { text: "One major advantage of sole proprietorship is:", correctIndex: 0, options: ["Quick decision-making", "Unlimited shareholders", "Government ownership", "Compulsory partnership"], explanation: "Sole proprietors exercise full managerial control, enabling rapid decision-making without consulting partners or boards." },
  { text: "A major disadvantage of sole proprietorship is:", correctIndex: 0, options: ["Unlimited liability", "Easy decision-making", "Personal control", "Business privacy"], explanation: "Unlimited liability exposes the owner's personal assets to seizure if the business defaults on debt obligations." },
  { text: "In sole proprietorship, profits generally belong to:", correctIndex: 0, options: ["The sole owner", "The government", "All customers", "Competitors"], explanation: "The sole owner assumes all financial risk and is entitled to 100% of generated net profits." },
  { text: "A partnership is a business owned by:", correctIndex: 0, options: ["Two or more persons", "Only the government", "One person exclusively", "Customers"], explanation: "A partnership is a business structure formed by two or more individuals combining capital and expertise under a partnership deed." },
  { text: "A company whose ownership is divided into shares is known as a:", correctIndex: 0, options: ["Joint-stock company", "Sole proprietorship", "Family meeting", "Wage employment"], explanation: "A joint-stock company raises capital by issuing equity shares representing proportional ownership units to investors." },
  { text: "Which form of business organisation generally has separate legal personality?", correctIndex: 0, options: ["Incorporated company", "Sole trader", "Informal street trading", "Individual employee"], explanation: "Incorporated limited liability companies are legal entities distinct from their shareholders, capable of owning property and suing/being sued." },
  { text: "An entrepreneur who buys and sells goods mainly to make profit can be described as a:", correctIndex: 0, options: ["Buy-and-sell entrepreneur", "Drone entrepreneur", "Wage earner", "Government employee"], explanation: "Trading or commercial entrepreneurs engage in buying finished goods and reselling them at a markup." },
  { text: "Speculation in entrepreneurship generally involves:", correctIndex: 0, options: ["Taking calculated risks based on expected future outcomes", "Avoiding all investments", "Working only for salary", "Refusing to make decisions"], explanation: "Speculative entrepreneurship involves purchasing assets or launching ventures based on anticipated price changes and market trends." },
  { text: "A franchise allows an individual to:", correctIndex: 0, options: ["Operate using an established business model/brand under agreed conditions", "Own every company in the country", "Avoid all business regulations", "Operate without any agreement"], explanation: "Franchising authorizes a franchisee to commercialize established trademarked products and business systems provided by a franchisor." },
  { text: "One reason governments encourage entrepreneurship is to:", correctIndex: 0, options: ["Reduce unemployment", "Increase unemployment", "Discourage production", "Eliminate small businesses"], explanation: "Promoting entrepreneurship stimulates job creation, reducing youth unemployment and social dependency." },
  { text: "Entrepreneurship can help reduce poverty by:", correctIndex: 0, options: ["Creating income-generating opportunities", "Increasing dependency", "Preventing employment", "Reducing productivity"], explanation: "Ventures generate self-employment and sustainable household income streams, elevating standard of living." },
  { text: "Which of the following is a possible source of entrepreneurial finance?", correctIndex: 0, options: ["Personal savings", "Customer complaints", "Market competition", "Business location"], explanation: "Equity capital for early-stage startup funding is predominantly sourced from personal savings and bootstrap reserves." },
  { text: "Capital refers to:", correctIndex: 0, options: ["Resources used to establish and operate a business", "Customers only", "Government workers", "Business competitors"], explanation: "Capital includes financial assets, machinery, buildings, and tools deployed in production and commercial operations." },
  { text: "Which of the following is NOT a factor of production?", correctIndex: 3, options: ["Land", "Labour", "Capital", "Entertainment"], explanation: "The classical factors of production are Land, Labour, Capital, and Entrepreneurship/Organization." },
  { text: "Labour refers to:", correctIndex: 0, options: ["Human effort used in production", "Machines only", "Money only", "Raw materials only"], explanation: "Labour comprises the physical, intellectual, and technical human work expended in generating products and services." },
  { text: "An entrepreneur needs knowledge because it helps him or her to:", correctIndex: 0, options: ["Make informed decisions", "Avoid learning", "Ignore customers", "Eliminate competition"], explanation: "Market and technical knowledge reduces uncertainty, facilitating sound operational and strategic decision-making." },
  { text: "Time is important to an entrepreneur because:", correctIndex: 0, options: ["Effective time management improves productivity", "Time has no value", "Businesses do not require deadlines", "Customers never have schedules"], explanation: "Time is a finite resource; effective scheduling optimizes operational productivity, product delivery, and customer satisfaction." },
  { text: "Effective time management involves:", correctIndex: 0, options: ["Prioritising important activities", "Postponing every task", "Ignoring deadlines", "Avoiding planning"], explanation: "Time management relies on prioritizing tasks based on urgency and strategic importance to optimize workflow." },
  { text: "Which of the following is a good time-management practice?", correctIndex: 0, options: ["Preparing a daily task schedule", "Procrastinating", "Doing everything randomly", "Ignoring deadlines"], explanation: "Creating daily schedules and to-do lists organizes priorities and minimizes time wasted on non-essential tasks." },
  { text: "One major challenge facing entrepreneurs in Nigeria is:", correctIndex: 0, options: ["Inadequate access to finance", "Too many customers", "Unlimited capital", "Absence of competition"], explanation: "High interest rates, stringent collateral requirements, and credit scarcity impede capital access for Nigerian entrepreneurs." },
  { text: "Poor infrastructure can affect entrepreneurship by:", correctIndex: 0, options: ["Increasing the cost of doing business", "Eliminating expenses", "Increasing free resources", "Making production costless"], explanation: "Unreliable electricity, inadequate transport networks, and weak ICT facilities inflate operational overhead and production costs." },
  { text: "Government policies can affect businesses through:", correctIndex: 0, options: ["Taxes and regulations", "Weather alone", "Family relationships", "Personal hobbies"], explanation: "Fiscal policies, corporate taxation, import duties, and statutory compliance mandates directly influence business profitability." },
  { text: "Fiscal incentives are measures used by government to:", correctIndex: 0, options: ["Encourage economic or business activities", "Stop every business", "Eliminate entrepreneurs", "Prevent investment"], explanation: "Tax holidays, tariff concessions, and pioneer status incentives are fiscal instruments designed to stimulate investment." },
  { text: "Which of the following can encourage entrepreneurship?", correctIndex: 0, options: ["Access to affordable finance", "Excessive bureaucracy", "Poor infrastructure", "Lack of market information"], explanation: "Low-interest loans and accessible microcredit facilities empower entrepreneurs to start and scale commercial ventures." },
  { text: "Import substitution is a strategy aimed at:", correctIndex: 0, options: ["Encouraging local production of goods previously imported", "Increasing dependence on imports", "Closing all local industries", "Stopping domestic production"], explanation: "Import substitution industrialization promotes domestic manufacturing to replace foreign imported goods, conserving foreign exchange." },
  { text: "One argument in favour of import substitution is that it can:", correctIndex: 0, options: ["Encourage domestic industries", "Eliminate local production", "Increase dependence on foreign goods", "Reduce employment opportunities"], explanation: "Import substitution protects infant domestic industries, fosters technological learning, and generates local industrial employment." },
  { text: "One possible disadvantage of import substitution is:", correctIndex: 0, options: ["Reduced competition may affect efficiency", "Increased local production", "Creation of industries", "Development of local skills"], explanation: "Protectionist trade barriers shielding local firms from international rivalry can foster inefficiency and lower product quality." },
  { text: "Entrepreneurs contribute to national development by:", correctIndex: 0, options: ["Creating wealth and employment", "Increasing unemployment", "Discouraging innovation", "Reducing production"], explanation: "Enterprise creation stimulates local economic activity, tax revenues, infrastructure development, and employment." },
  { text: "Entrepreneurship encourages economic development mainly through:", correctIndex: 0, options: ["Innovation and enterprise creation", "Dependency", "Business closure", "Reduced productivity"], explanation: "Commercializing novel technologies and establishing competitive firms drive economic diversification and productivity growth." },
  { text: "The Kakinada experiment is associated with:", correctIndex: 0, options: ["Achievement motivation", "Computer programming", "Agricultural production", "Banking regulation"], explanation: "The Kakinada Experiment conducted in India by David McClelland demonstrated that achievement motivation can be taught to entrepreneurs." },
  { text: "Achievement motivation refers to the desire to:", correctIndex: 0, options: ["Accomplish challenging goals", "Avoid success", "Avoid responsibility", "Depend entirely on others"], explanation: "Achievement motivation (n-Ach) is the psychological drive to excel, overcome obstacles, and attain high standards of performance." },
  { text: "David McClelland is associated with the study of:", correctIndex: 0, options: ["Achievement motivation", "Computer science", "Accounting standards", "Marketing law"], explanation: "Psychologist David McClelland formulated the Acquired-Needs Theory, emphasizing Need for Achievement in entrepreneurial success." },
  { text: "An entrepreneur with a strong need for achievement is likely to:", correctIndex: 0, options: ["Set challenging but realistic goals", "Avoid responsibility", "Reject every opportunity", "Avoid decision-making"], explanation: "High achievers set calculated, challenging yet achievable targets and take personal accountability for outcome performance." },
  { text: "Which of the following is an entrepreneurial motivation?", correctIndex: 0, options: ["Desire for independence", "Fear of responsibility", "Hatred of achievement", "Avoidance of opportunities"], explanation: "Autonomy and the desire to control one's professional career serve as powerful catalysts for business creation." },
  { text: "An entrepreneur's ability to identify a problem and create a solution demonstrates:", correctIndex: 0, options: ["Creativity", "Laziness", "Dependence", "Rigidity"], explanation: "Creativity manifests when entrepreneurs analyze real-world challenges and design novel, functional product or service solutions." },
  { text: "The process of transforming an idea into a useful product or service is associated with:", correctIndex: 0, options: ["Innovation", "Unemployment", "Wage employment", "Procrastination"], explanation: "Innovation bridges invention and commercialization, refining ideas into marketable solutions." },
  { text: "Which of the following is most important when selecting a business idea?", correctIndex: 0, options: ["Availability of market demand", "The entrepreneur's favourite celebrity", "Personal entertainment", "Random selection"], explanation: "A business idea must address verified market demand; without willing buyers, commercial viability is unattainable." },
  { text: "Customer needs are important to entrepreneurs because they:", correctIndex: 0, options: ["Can provide opportunities for business creation", "Prevent innovation", "Eliminate markets", "Make businesses unnecessary"], explanation: "Unsatisfied customer pain points highlight lucrative opportunities to design responsive commercial offerings." },
  { text: "Market research helps an entrepreneur determine:", correctIndex: 0, options: ["Customer needs and market conditions", "The colour of government buildings", "Employees' birthdays", "Personal hobbies"], explanation: "Market research gathers empirical data on customer demographics, willingness to pay, competitor strategies, and market size." },
  { text: "A business environment consists of:", correctIndex: 0, options: ["Factors that affect business operations", "Only business owners", "Only employees", "Only customers"], explanation: "The business environment includes all internal forces and external socio-economic, political, legal, and technological factors impacting a firm." },
  { text: "Which of the following is part of the external business environment?", correctIndex: 0, options: ["Government regulations", "Owner's personal skills", "Internal staff competence", "Business culture"], explanation: "Government regulations are macro-environmental factors imposed externally on all operating enterprises." },
  { text: "Competition can encourage entrepreneurs to:", correctIndex: 0, options: ["Improve their products and services", "Stop innovating", "Ignore customers", "Reduce quality deliberately"], explanation: "Market competition forces firms to enhance quality, optimize pricing, and continuously innovate to retain market share." },
  { text: "One way an entrepreneur can survive a changing business environment is to:", correctIndex: 0, options: ["Adapt and innovate", "Refuse all changes", "Ignore customers", "Avoid technology"], explanation: "Flexibility, strategic adaptation, and continuous innovation enable businesses to withstand environmental shifts." },
  { text: "Networking is useful to entrepreneurs because it can help them:", correctIndex: 0, options: ["Build useful business relationships", "Avoid customers", "Eliminate opportunities", "Stop communication"], explanation: "Professional networking cultivates strategic partnerships, investor contacts, mentorship, and customer referrals." },
  { text: "Which of the following is an important communication skill for entrepreneurs?", correctIndex: 0, options: ["Ability to express ideas clearly", "Refusal to listen", "Avoiding customers", "Ignoring feedback"], explanation: "Clear communication ensures effective pitch presentations, negotiation, team leadership, and marketing clarity." },
  { text: "A successful entrepreneur should be willing to learn from:", correctIndex: 0, options: ["Both successes and failures", "Failures only", "Customers only", "Nobody"], explanation: "Continuous learning and analytical reflection on both achievements and mistakes drive long-term business resilience." },
  { text: "Risk in entrepreneurship should ideally be:", correctIndex: 0, options: ["Calculated and managed", "Completely ignored", "Taken blindly", "Avoided at all costs"], explanation: "Successful entrepreneurs minimize exposure by analyzing risk-reward ratios and implementing contingency management strategies." },
  { text: "The ultimate aim of many profit-oriented business enterprises is to:", correctIndex: 0, options: ["Generate profit and achieve growth", "Avoid customers", "Increase losses", "Stop production"], explanation: "Profit generation ensures commercial sustainability, providing funds for reinvestment, owner equity returns, and market expansion." },
  { text: "Which of the following best describes the overall purpose of entrepreneurship education?", correctIndex: 0, options: ["To develop entrepreneurial knowledge, skills and mindset", "To discourage self-employment", "To prepare students only for government jobs", "To eliminate business activities"], explanation: "Entrepreneurship education equips students with practical business skills, risk-management capabilities, and an innovative mindset for enterprise creation." }
];

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const csDeptId = new mongoose.Types.ObjectId('69e5e34f2eeaa5bffac98e94'); // Computer Science Department (ND 1)

    let course = await db.collection('courses').findOne({
      title: /EED 126|ENTREPRENEURSHIP EDUCATION I/i,
      department: csDeptId
    });

    if (!course) {
      const newCourseDoc = {
        title: 'EED 126 - ENTREPRENEURSHIP EDUCATION I',
        description: 'Official EED 126 Entrepreneurship Education course for Computer Science (ND 1). Based directly on official EED126 curriculum materials covering entrepreneurship principles, business opportunity identification, innovation, business planning, marketing, operations, financial planning, and enterprise management.',
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

    // ── 2. Load 8 Course Notes from MongoDB ──────────────────────────────
    const existingNotes = await CourseNote.find({ course: course._id }).sort({ order: 1 });
    console.log(`✅ ${existingNotes.length} Chapters of Course Notes retrieved from MongoDB.`);

    const notesSummaryText = existingNotes.map(n => `Chapter: ${n.chapterTitle}\n${n.content.slice(0, 1500)}`).join('\n\n');

    // ── 3. Balance Option Lengths for User-Provided 100 Questions ─────────
    console.log('\nProcessing option balancing for User-Provided 100 Questions using Gemini...');

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
          subject: "EED 126 Entrepreneurship Education"
        };
      });

      const balancePrompt = `
You are an expert psychometrician and university professor of Entrepreneurship Studies.
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
        options: shuffle(q.options)
      }));

      processedUserQuestions.push(...shuffledChunk);
      console.log(`  ✓ Balanced & shuffled ${shuffledChunk.length} user questions.`);
      await delay(2000);
    }

    console.log(`\nSuccessfully processed all ${processedUserQuestions.length} user-provided questions.`);

    // ── 4. Generate 100 Additional Questions using Textbook Context ─────────
    console.log('\nGenerating 100 Additional CBT Questions (5 batches of 20) strictly from EED 126 textbook notes...');

    const topics = [
      "Concepts of Entrepreneurship, Self-Employment vs Wage Employment, Entrepreneurial Traits, and Economic Development Impact",
      "Creativity Techniques, Innovation Methods, Business Idea Screening, and Market Demand Evaluation",
      "Business Feasibility Studies, Risk Assessment, Forms of Business Ownership (Sole Proprietorship, Partnership, Corporation), and Legal Compliance",
      "Marketing Mix (4 Ps), Market Segmentation, Pricing Strategies, Customer Management, and Promotional Planning",
      "Financial Planning, Record Keeping, Cash Flow Management, Break-Even Analysis, and Enterprise Growth Strategies"
    ];

    const pdfQuestions = [];

    for (let batch = 0; batch < topics.length; batch++) {
      console.log(`\nGenerating PDF Question Batch ${batch + 1}/${topics.length} (20 questions on: ${topics[batch]})...`);
      await delay(2500);

      const qPrompt = `
You are an expert university professor of Entrepreneurship Studies.
Based STRICTLY on the attached EED 126 curriculum context below, generate EXACTLY 20 unique, high-quality multiple-choice questions covering: ${topics[batch]}.

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more technical than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed business statements.
4. Explanations must be thorough, step-by-step conceptual clarifications.
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
            required: ["text", "options", "explanation"]
          }
        }
      });

      const qRes = await callWithRetry(() => questionModel.generateContent([{ text: qPrompt }]));
      const rawQs = JSON.parse(qRes.response.text().trim());

      const batchQs = rawQs.map(q => ({
        ...q,
        options: shuffle(q.options)
      }));

      console.log(`  ✓ PDF Batch ${batch + 1} generated ${batchQs.length} balanced questions.`);
      pdfQuestions.push(...batchQs);
    }

    const totalQuestions = [...processedUserQuestions, ...pdfQuestions];
    console.log(`\nTotal questions combined: ${totalQuestions.length} (${processedUserQuestions.length} User + ${pdfQuestions.length} PDF Curriculum)`);

    // ── 5. Save Quiz Document in MongoDB ─────────────────────────────────
    console.log('Saving Quiz document to MongoDB...');
    await db.collection('quizzes').deleteMany({ course: course._id });

    const quizDoc = {
      title: "EED 126 CBT PRACTICE EXAM",
      description: "Comprehensive 200-question practice exam created directly from official EED 126 question banks and EED126 curriculum textbooks for Computer Science (ND 1). Covers entrepreneurship principles, innovation, business planning, legal structures, marketing, financial management, and enterprise growth. (60 random questions per 30-minute exam session).",
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

    // ── 6. Auto-Grant Access to Approved Users ────────────────────────────
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
    console.log(`✅ Auto-granted EED 126 access to ${approvedStudents.length} approved users.`);

    // ── 7. Verification ──────────────────────────────────────────────────
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
    console.log(`Sources Used: 100 User Questions + EED126 Curriculum Textbooks`);
    console.log('==============================================');

    console.log('\n🎉 EED 126 FOR COMPUTER SCIENCE (ND 1) CREATED & CONFIGURED SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
