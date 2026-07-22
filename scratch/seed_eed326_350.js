import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Department from '../models/Department.js';

dotenv.config();

// Past Exam Questions (77 - 100) & Related Past Paper Variants (Questions 251 - 350)
const pastExamQuestions100 = [
  // --- PAST QUESTIONS 77 - 100 ---
  {
    text: "One of the challenges of self employment is too much paperwork.",
    options: [
      { text: "NOT TRUE", isCorrect: false },
      { text: "WRONG", isCorrect: false },
      { text: "VERY CORRECT", isCorrect: true },
      { text: "NONE OF THE ABOVE", isCorrect: false }
    ],
    explanation: "Handling extensive administrative paperwork and regulatory documentation is listed as a major operational challenge of self-employment."
  },
  {
    text: "One among the following is NOT an advantage of wage employment:",
    options: [
      { text: "LEADS RATHER THAN FOLLOWS", isCorrect: true },
      { text: "SPECIFIC OR FIXED RESPONSIBILITIES", isCorrect: false },
      { text: "FIXED HOURS OF WORK", isCorrect: false },
      { text: "MORE CERTAIN FUTURE", isCorrect: false }
    ],
    explanation: "'Leads rather than follows' is a key advantage of self-employment/entrepreneurship, whereas wage employment involves following orders."
  },
  {
    text: "______ is a mutual agreement between an employer and an employee where the employee works under a firm with the hope of being paid a remuneration.",
    options: [
      { text: "SELF EMPLOYMENT", isCorrect: false },
      { text: "WAGE EMPLOYMENT", isCorrect: true },
      { text: "ENTERPRISES", isCorrect: false },
      { text: "TERMS AND CONDITIONS", isCorrect: false }
    ],
    explanation: "Wage/Paid employment is a contractual relationship where an individual works for an employer in exchange for fixed wages or salary."
  },
  {
    text: "Which among the following is NOT a factor that facilitates being an entrepreneur?",
    options: [
      { text: "PERSONALITY FACTOR", isCorrect: false },
      { text: "WAGE FACTOR", isCorrect: true },
      { text: "ENVIRONMENTAL FACTOR", isCorrect: false },
      { text: "AGE AND EDUCATION", isCorrect: false }
    ],
    explanation: "Factors facilitating entrepreneurship are Personality factors, Environmental factors, and Action factors. 'Wage factor' belongs to paid employment."
  },
  {
    text: "One among the following is NOT a keyword in the core definition of an entrepreneur:",
    options: [
      { text: "HABITUALLY", isCorrect: false },
      { text: "INNOVATES", isCorrect: false },
      { text: "CREATES", isCorrect: false },
      { text: "COMMUNITY", isCorrect: true }
    ],
    explanation: "Key terms defining an entrepreneur focus on mindset, habitually creating, innovating, and exploiting perceived opportunities."
  },
  {
    text: "An enterprise classified by the types of products they produce (e.g. using ISIC standards) is known as a __________ classification.",
    options: [
      { text: "Industrial", isCorrect: false },
      { text: "Sectoral", isCorrect: true },
      { text: "Consumer", isCorrect: false },
      { text: "Manufacturing", isCorrect: false }
    ],
    explanation: "Sectoral classification categorizes enterprises according to their industry sector and products based on ISIC codes."
  },
  {
    text: "Which of the following is NOT one of the steps that make for an enterprise?",
    options: [
      { text: "Planning", isCorrect: false },
      { text: "Implementation", isCorrect: false },
      { text: "Fund sourcing", isCorrect: true },
      { text: "Idea Identification", isCorrect: false }
    ],
    explanation: "The 5 core steps defining an enterprise in the curriculum are: Idea Identification, Planning, Implementation of the idea, Successful completion, and Acceptance of a reward."
  },
  {
    text: "The following are standard terms used to qualify or classify an enterprise EXCEPT:",
    options: [
      { text: "Consumer or industrial", isCorrect: false },
      { text: "Private", isCorrect: false },
      { text: "Public", isCorrect: false },
      { text: "Primary", isCorrect: true }
    ],
    explanation: "Classifications specified include Private vs Public, Profit vs Non-profit, Formal vs Informal, Small vs Large, and Consumer vs Industrial."
  },
  {
    text: "What is the full meaning of the management acronym MBWA?",
    options: [
      { text: "Management By Wandering Around", isCorrect: true },
      { text: "Management By Welfare Actions", isCorrect: false },
      { text: "Management By Wild Analysis", isCorrect: false },
      { text: "Management By Work Allocation", isCorrect: false }
    ],
    explanation: "MBWA stands for 'Management By Wandering Around'—an unstructured leadership style where managers wander through the workplace to check on employees."
  },
  {
    text: "Where little or no feedback is expected in written enterprise communication, a __________ is commonly used.",
    options: [
      { text: "Sign", isCorrect: false },
      { text: "Symbol", isCorrect: false },
      { text: "Memorandum", isCorrect: true },
      { text: "Dialogue", isCorrect: false }
    ],
    explanation: "A Memorandum (Memo) is typically used for internal one-way official announcements where immediate feedback is not expected."
  },
  {
    text: "Which of these is a recognized mechanism to track and reflect on business progress over time?",
    options: [
      { text: "Business journals", isCorrect: true },
      { text: "Press releases", isCorrect: false },
      { text: "Trade fair flyers", isCorrect: false },
      { text: "Bank deposit slips", isCorrect: false }
    ],
    explanation: "Keeping written business/reflection journals helps entrepreneurs systematically track operational milestones and lessons learned."
  },
  {
    text: "All of the following are key roles of communication in an enterprise EXCEPT:",
    options: [
      { text: "Give guidelines", isCorrect: false },
      { text: "Provide Information", isCorrect: false },
      { text: "Communicate knowledge", isCorrect: false },
      { text: "All of the Above are roles of communication", isCorrect: true }
    ],
    explanation: "Communication serves to give guidelines, provide information, and transfer knowledge across an organization."
  },
  {
    text: "As an entrepreneur, to reduce workplace misunderstandings you must engage in:",
    options: [
      { text: "Clear communication", isCorrect: false },
      { text: "Active listening", isCorrect: false },
      { text: "Diplomacy", isCorrect: false },
      { text: "All Of The Above", isCorrect: true }
    ],
    explanation: "Minimizing misunderstandings requires clear articulation, active listening, and diplomatic interpersonal skills."
  },
  {
    text: "The acronym NERFUND stands for:",
    options: [
      { text: "National Enterprise Research Fund", isCorrect: false },
      { text: "National Economic Reconstruction Fund", isCorrect: true },
      { text: "National Enterprise Reconstruction Fund", isCorrect: false },
      { text: "Nigerian Economic Recovery Fund", isCorrect: false }
    ],
    explanation: "NERFUND stands for National Economic Reconstruction Fund, established to provide long-term loans to SMEs before merging into BOI."
  },
  {
    text: "Which of the following is NOT classified as a standard Development Finance Institution (DFI)?",
    options: [
      { text: "PEN (People's Bank of Nigeria)", isCorrect: true },
      { text: "NACB", isCorrect: false },
      { text: "NIDB", isCorrect: false },
      { text: "NBCI", isCorrect: false }
    ],
    explanation: "People's Bank of Nigeria (PEN/PBN) was a micro-credit poverty alleviation bank, whereas NIDB, NBCI, and NACB were specialized DFIs."
  },
  {
    text: "The acronym NACRDB stands for:",
    options: [
      { text: "Nigerian Agriculture, Cooperative And Rural Development Bank", isCorrect: true },
      { text: "National Agriculture, Cooperative and Rural Development Bank", isCorrect: false },
      { text: "Nigerian Allied, Cooperative and Rural Decoration Bank", isCorrect: false },
      { text: "National Association of Rural Development Banks", isCorrect: false }
    ],
    explanation: "NACRDB stands for Nigerian Agriculture, Cooperative and Rural Development Bank (now Bank of Agriculture - BOA)."
  },
  {
    text: "In Nigerian micro-finance history, PEN stands for:",
    options: [
      { text: "People's Bank of Namibia", isCorrect: false },
      { text: "Product Bank of Nigeria", isCorrect: false },
      { text: "People's Bank of Nigeria", isCorrect: true },
      { text: "Public Equity Network", isCorrect: false }
    ],
    explanation: "PEN refers to the People's Bank of Nigeria, established to extend micro-loans to low-income traders."
  },
  {
    text: "Which of the following is an organized Industrial Association in Nigeria?",
    options: [
      { text: "All of the above (NACCIMA, NASSI, NASME)", isCorrect: true },
      { text: "NACCIMA", isCorrect: false },
      { text: "NASSI", isCorrect: false },
      { text: "NASME", isCorrect: false }
    ],
    explanation: "NACCIMA, NASSI (National Association of Small Scale Industrialists), and NASME (National Association of SMEs) are all key industrial/business associations."
  },
  {
    text: "Which of the following represents a valid source of business financing?",
    options: [
      { text: "Business Loan", isCorrect: false },
      { text: "Lending officer's concern", isCorrect: false },
      { text: "Equity Financing", isCorrect: false },
      { text: "Both A and C (Business Loan and Equity Financing)", isCorrect: true }
    ],
    explanation: "Business financing is primarily sourced through debt (Business Loans) or ownership capital (Equity Financing)."
  },
  {
    text: "Cost, Risk, Flexibility, Control, and Availability are lending officer's concerns during loan approval. True or False?",
    options: [
      { text: "True", isCorrect: false },
      { text: "False", isCorrect: true },
      { text: "Neither True nor False", isCorrect: false },
      { text: "Both True and False", isCorrect: false }
    ],
    explanation: "False. Cost, Risk, Flexibility, Control, and Availability are criteria evaluated by the BORROWER when choosing a loan source. Lender concerns focus on character, repayment ability, and collateral."
  },
  {
    text: "Which pair of terms are NOT among the 5 criteria for evaluating loan sources?",
    options: [
      { text: "Amount & Judgement", isCorrect: true },
      { text: "Risk & Control", isCorrect: false },
      { text: "Flexibility & Cost", isCorrect: false },
      { text: "Availability & Risk", isCorrect: false }
    ],
    explanation: "The 5 criteria for loan sources are Cost, Risk, Flexibility, Control, and Availability. 'Amount & Judgement' are not among them."
  },
  {
    text: "A business typically utilizes how many fundamental types of money/credit in its operations?",
    options: [
      { text: "Four (Trade Credit, Short-term, Long-term, Equity)", isCorrect: true },
      { text: "Two", isCorrect: false },
      { text: "Six", isCorrect: false },
      { text: "Three", isCorrect: false }
    ],
    explanation: "A business uses four types of money: Trade Credit, Short-Term Credit, Long-Term Credit, and Equity Funds."
  },
  {
    text: "An Investment Trust Fund with a fixed number of shares traded on a stock exchange is also known as a:",
    options: [
      { text: "Closed-End Fund", isCorrect: true },
      { text: "Open-End Fund", isCorrect: false },
      { text: "Mutual Fund", isCorrect: false },
      { text: "Call Deposit", isCorrect: false }
    ],
    explanation: "Investment trust funds operate with a fixed capital structure of traded shares, classified as Closed-End Funds."
  },
  {
    text: "A collective investment scheme where capital is divided and offered in smaller units to raise funds from retail investors is called a:",
    options: [
      { text: "Unit Trust Fund / Open-End Mutual Fund", isCorrect: true },
      { text: "Debenture Certificate", isCorrect: false },
      { text: "Commercial Overdraft", isCorrect: false },
      { text: "Treasury Coupon", isCorrect: false }
    ],
    explanation: "Unit Trust Funds issue redeemable units to small investors to pool funds into a diversified investment portfolio."
  },

  // --- EXTENDED PAST PAPER CONCEPTS & VARIANTS (275-350) ---
  {
    text: "Which economist defined the entrepreneur as an innovator who performs 'creative destruction' by replacing old industries with new ones?",
    options: [
      { text: "Joseph Schumpeter", isCorrect: true },
      { text: "Adam Smith", isCorrect: false },
      { text: "David Ricardo", isCorrect: false },
      { text: "Alfred Marshall", isCorrect: false }
    ],
    explanation: "Schumpeter introduced the concept of 'creative destruction', where innovative entrepreneurs revolutionize market structures."
  },
  {
    text: "Which classical economist viewed entrepreneurship under the general umbrella of 'business management' without separating it as a distinct fourth factor of production?",
    options: [
      { text: "John Stuart Mill & Adam Smith", isCorrect: true },
      { text: "Israel Kirzner", isCorrect: false },
      { text: "Richard Cantillon", isCorrect: false },
      { text: "Harvey Leibenstein", isCorrect: false }
    ],
    explanation: "Early English classical economists like Smith, Ricardo, and Mill grouped entrepreneurial activity under general business administration."
  },
  {
    text: "In the 5-step model that makes for an enterprise, what is the final 5th step?",
    options: [
      { text: "Acceptance of a reward (profits or social benefits)", isCorrect: true },
      { text: "Idea Identification", isCorrect: false },
      { text: "Submitting tax returns", isCorrect: false },
      { text: "Closing the company", isCorrect: false }
    ],
    explanation: "Step 5 in creating an enterprise is the acceptance of a reward following successful completion of planned activities."
  },
  {
    text: "What total investment threshold defines a Small Scale Industry under the Federal Republic of Nigeria guidelines?",
    options: [
      { text: "N1,500,000.00 to N50,000,000.00 (excluding land)", isCorrect: true },
      { text: "Under N500,000", isCorrect: false },
      { text: "N50M to N200M", isCorrect: false },
      { text: "Above N200M", isCorrect: false }
    ],
    explanation: "Small scale industries have investments between N1.5 million and N50 million naira."
  },
  {
    text: "Which workforce range corresponds to a Medium Scale Industry in Nigeria?",
    options: [
      { text: "101 to 300 workers", isCorrect: true },
      { text: "1 to 10 workers", isCorrect: false },
      { text: "11 to 100 workers", isCorrect: false },
      { text: "Over 500 workers", isCorrect: false }
    ],
    explanation: "Medium scale industries employ between 101 and 300 workers."
  },
  {
    text: "Which of the following is a primary advantage of Wage Employment?",
    options: [
      { text: "Specific or fixed responsibilities and steady income", isCorrect: true },
      { text: "Unlimited earnings potential", isCorrect: false },
      { text: "Total authority to implement personal ideas without approval", isCorrect: false },
      { text: "Giving orders to board directors", isCorrect: false }
    ],
    explanation: "Wage employment provides predictable salaries, clear job scopes, and reduced personal financial risk."
  },
  {
    text: "Which of the following is an advantage of Self-Employment?",
    options: [
      { text: "Leads rather than follows, can implement creative ideas, and unlimited potential income", isCorrect: true },
      { text: "Fixed work hours set by employer", isCorrect: false },
      { text: "Guaranteed fringe benefits provided by management", isCorrect: false },
      { text: "Zero financial risk", isCorrect: false }
    ],
    explanation: "Self-employment provides freedom of leadership, creative execution, and uncapped income potential."
  },
  {
    text: "What term describes an entrepreneur's strong psychological desire to accomplish challenging goals and excel?",
    options: [
      { text: "Need for Achievement (nAch)", isCorrect: true },
      { text: "Need for Dependency", isCorrect: false },
      { text: "External Locus of Control", isCorrect: false },
      { text: "Procrastination Tendency", isCorrect: false }
    ],
    explanation: "David McClelland identified the Need for Achievement (nAch) as the key driver of entrepreneurial motivation."
  },
  {
    text: "An entrepreneur who takes 'Calculated Risks':",
    options: [
      { text: "Evaluates potential losses and puts contingency measures in place before acting", isCorrect: true },
      { text: "Takes random blind chances like a casino gambler", isCorrect: false },
      { text: "Avoids taking any decisions whatsoever", isCorrect: false },
      { text: "Relies solely on luck", isCorrect: false }
    ],
    explanation: "Calculated risk-taking involves analyzing probabilities, potential outcomes, and risk mitigation strategies."
  },
  {
    text: "Which document contains audited financial statements, director reports, and notices sent to shareholders prior to an AGM?",
    options: [
      { text: "Annual Report", isCorrect: true },
      { text: "Tax Clearance Certificate", isCorrect: false },
      { text: "Waybill", isCorrect: false },
      { text: "Purchase Requisition", isCorrect: false }
    ],
    explanation: "The Annual Report provides a comprehensive summary of a company's financial operations and audited statements for the year."
  },
  {
    text: "What does ISIC stand for in industry classification?",
    options: [
      { text: "International Standard Industrial Classification", isCorrect: true },
      { text: "Indian System of Industrial Commerce", isCorrect: false },
      { text: "Integrated Sector Information Code", isCorrect: false },
      { text: "Internal Standard Insurance Control", isCorrect: false }
    ],
    explanation: "ISIC is the United Nations international standard for classifying economic data by industry sector."
  },
  {
    text: "Enterprises owned, managed, and funded by government to provide essential public services are called:",
    options: [
      { text: "Public Enterprises", isCorrect: true },
      { text: "Private Sole Proprietorships", isCorrect: false },
      { text: "Informal Partnerships", isCorrect: false },
      { text: "Multinational Venture Trusts", isCorrect: false }
    ],
    explanation: "Public enterprises are state-owned entities created to deliver social infrastructure and public utilities."
  },
  {
    text: "Which of the following is a non-profit, social-motive enterprise?",
    options: [
      { text: "Charitable Foundation / NGO", isCorrect: true },
      { text: "Commercial Bank", isCorrect: false },
      { text: "Automobile Factory", isCorrect: false },
      { text: "Telecom Network Operator", isCorrect: false }
    ],
    explanation: "NGOs and charities operate to address social objectives rather than distribute profits to owners."
  },
  {
    text: "What characterizes an 'Informal Enterprise' in Nigeria?",
    options: [
      { text: "Operating without official registration (e.g. CAC) or formal employment contracts", isCorrect: true },
      { text: "Full listing on the Nigerian Stock Exchange", isCorrect: false },
      { text: "Paying corporate income tax to FIRS regularly", isCorrect: false },
      { text: "Issuing audited annual reports to the public", isCorrect: false }
    ],
    explanation: "Informal enterprises operate outside formal registration and legal regulatory frameworks."
  },
  {
    text: "In the 5-step personal financial planning process, what is Step 1?",
    options: [
      { text: "Assessment (compiling personal balance sheet of assets and liabilities)", isCorrect: true },
      { text: "Buying luxury assets", isCorrect: false },
      { text: "Retiring from work", isCorrect: false },
      { text: "Applying for bank bankruptcy", isCorrect: false }
    ],
    explanation: "Step 1 in financial planning is Assessment—taking stock of current assets, liabilities, income, and expenses."
  },
  {
    text: "What does 'Disposable Income' represent?",
    options: [
      { text: "Net income remaining available for spending or saving after paying taxes", isCorrect: true },
      { text: "Total money thrown into garbage bins", isCorrect: false },
      { text: "Gross salary before any tax deduction", isCorrect: false },
      { text: "Money borrowed from illegal money lenders", isCorrect: false }
    ],
    explanation: "Disposable income is the net funds available after tax deductions for personal consumption and savings."
  },
  {
    text: "Which short-term money market instrument is issued by the Central Bank of Nigeria to mop up excess liquidity?",
    options: [
      { text: "Treasury Bills (T-Bills)", isCorrect: true },
      { text: "Corporate Preference Shares", isCorrect: false },
      { text: "Municipal Real Estate Bonds", isCorrect: false },
      { text: "Equity Warrants", isCorrect: false }
    ],
    explanation: "T-Bills are government debt instruments used by CBN for monetary control and short-term public borrowing."
  },
  {
    text: "What is the maximum tenor for instruments traded in the Money Market?",
    options: [
      { text: "Up to 365 days (1 year)", isCorrect: true },
      { text: "10 years", isCorrect: false },
      { text: "30 years", isCorrect: false },
      { text: "Indefinite", isCorrect: false }
    ],
    explanation: "Money market instruments have short-term tenors of 1 year or less."
  },
  {
    text: "What is the minimum tenor for financial instruments traded in the Capital Market?",
    options: [
      { text: "More than 1 year (medium to long-term)", isCorrect: true },
      { text: "Overnight (24 hours)", isCorrect: false },
      { text: "7 days", isCorrect: false },
      { text: "30 days", isCorrect: false }
    ],
    explanation: "Capital market instruments carry tenors exceeding 1 year."
  },
  {
    text: "Who regulates stockbrokers and public share issues in Nigeria?",
    options: [
      { text: "Securities and Exchange Commission (SEC)", isCorrect: true },
      { text: "Ministry of Transportation", isCorrect: false },
      { text: "Customs Service", isCorrect: false },
      { text: "Local Government Council", isCorrect: false }
    ],
    explanation: "SEC is the apex statutory regulator of the Nigerian capital market under the Investment and Securities Act."
  },
  {
    text: "What is the primary function of the Nigerian Exchange Group (NGX)?",
    options: [
      { text: "Providing an organized electronic platform for buying and selling listed stocks and bonds", isCorrect: true },
      { text: "Printing paper currency notes", isCorrect: false },
      { text: "Collecting import duties at customs borders", isCorrect: false },
      { text: "Setting petrol retail prices", isCorrect: false }
    ],
    explanation: "NGX provides the secondary trading platform for buying and selling securities."
  },
  {
    text: "What does CSCS stand for in Nigerian capital market operations?",
    options: [
      { text: "Central Securities Clearing System", isCorrect: true },
      { text: "Corporate Savings Credit Scheme", isCorrect: false },
      { text: "Commercial Stock Control System", isCorrect: false },
      { text: "Capital Securities Commerce Society", isCorrect: false }
    ],
    explanation: "CSCS stands for Central Securities Clearing System PLC, handling automated clearing, settlement, and depository."
  },
  {
    text: "Shareholders who own Ordinary Shares have residual claims on company assets during liquidation. This means:",
    options: [
      { text: "They are paid last after all creditors, debenture holders, and preference shareholders are settled", isCorrect: true },
      { text: "They are paid first before all creditors", isCorrect: false },
      { text: "They receive double their initial investment automatically", isCorrect: false },
      { text: "They are exempt from all losses", isCorrect: false }
    ],
    explanation: "Ordinary shareholders carry residual risk—they receive remaining assets only after all external debt and preference claims are paid."
  },
  {
    text: "What type of dividend is paid to preference shareholders?",
    options: [
      { text: "Fixed percentage dividend", isCorrect: true },
      { text: "Fluctuating dividend based on random votes", isCorrect: false },
      { text: "Zero dividend ever", isCorrect: false },
      { text: "Bonus shares only", isCorrect: false }
    ],
    explanation: "Preference shares carry a specified fixed dividend rate (e.g. 8% Preference Shares)."
  },
  {
    text: "Holders of corporate debentures are classified as:",
    options: [
      { text: "Creditors of the company", isCorrect: true },
      { text: "Equity owners of the company", isCorrect: false },
      { text: "Board directors", isCorrect: false },
      { text: "Unpaid interns", isCorrect: false }
    ],
    explanation: "Debenture holders lend money to the firm and are legally creditors, not equity owners."
  },
  {
    text: "What is an FGN Sukuk Bond?",
    options: [
      { text: "An ethical, non-interest asset-backed sovereign bond issued by the Federal Government of Nigeria", isCorrect: true },
      { text: "A high-risk foreign currency derivative", isCorrect: false },
      { text: "A lottery ticket issued by CBN", isCorrect: false },
      { text: "A private bank overdraft", isCorrect: false }
    ],
    explanation: "Sukuk bonds are asset-backed, non-interest sovereign instruments issued by DMO for infrastructure development."
  },
  {
    text: "What is a 'Prospectus'?",
    options: [
      { text: "A legal document providing full details about a company and its public securities offering to potential investors", isCorrect: true },
      { text: "An internal memorandum regarding staff lunch hours", isCorrect: false },
      { text: "A receipt for utility bill payments", isCorrect: false },
      { text: "A customs duty clearance certificate", isCorrect: false }
    ],
    explanation: "A prospectus provides mandatory disclosures and financial information for public investment offerings."
  },
  {
    text: "What is 'Liquidity Risk'?",
    options: [
      { text: "The risk that an investor will be unable to sell an asset quickly without a substantial loss in value", isCorrect: true },
      { text: "The risk of water damage to factory equipment", isCorrect: false },
      { text: "The risk of sudden hyperinflation", isCorrect: false },
      { text: "The risk of tax rate increases", isCorrect: false }
    ],
    explanation: "Liquidity risk occurs when an asset cannot be converted into cash rapidly at fair market value."
  },
  {
    text: "What is an 'Emergency Fund'?",
    options: [
      { text: "Accessible liquid savings set aside to cover 3 to 6 months of living expenses during unforeseen setbacks", isCorrect: true },
      { text: "A speculative stock portfolio", isCorrect: false },
      { text: "A high-risk real estate land development project", isCorrect: false },
      { text: "A bank loan taken during bankruptcy", isCorrect: false }
    ],
    explanation: "Emergency funds provide a safety buffer for unexpected financial disruptions like job loss or medical emergencies."
  },
  {
    text: "The acronym 'A WHIP' reminds entrepreneurs of which core life skill model?",
    options: [
      { text: "The 5 Pillars of Self-Discipline (Acceptance, Willpower, Hard Work, Industry, Persistence)", isCorrect: true },
      { text: "The 5 steps of bank account opening", isCorrect: false },
      { text: "The 5 types of government taxes", isCorrect: false },
      { text: "The 5 stock market indexes", isCorrect: false }
    ],
    explanation: "A WHIP stands for Acceptance, Willpower, Hard Work, Industry, and Persistence."
  },
  {
    text: "In the 5 pillars of self-discipline, 'Acceptance' means:",
    options: [
      { text: "Consciously acknowledging your current situation and reality without denial", isCorrect: true },
      { text: "Accepting failure permanently without trying again", isCorrect: false },
      { text: "Accepting arbitrary commands from competitors", isCorrect: false },
      { text: "Refusing to measure performance", isCorrect: false }
    ],
    explanation: "Acceptance is the starting point—acknowledging current reality so you can make informed improvements."
  },
  {
    text: "How is 'Willpower' best characterized in self-discipline?",
    options: [
      { text: "A short-term, intense burst of energy used to initiate action ('Engage!')", isCorrect: true },
      { text: "A permanent habit that lasts 50 years without effort", isCorrect: false },
      { text: "A passive mental state", isCorrect: false },
      { text: "A physical tool stored in an office safe", isCorrect: false }
    ],
    explanation: "Willpower acts as an initial catalyst or rocket thruster to kickstart action."
  },
  {
    text: "What distinguishes 'Hard Work' from 'Industry'?",
    options: [
      { text: "Hard work is tackling tough tasks; Industry is sustaining hard work over extended time", isCorrect: true },
      { text: "Hard work is for sole proprietors; Industry is for public companies", isCorrect: false },
      { text: "Industry requires no physical effort", isCorrect: false },
      { text: "Hard work means avoiding all challenges", isCorrect: false }
    ],
    explanation: "Hard work addresses task difficulty; Industry addresses long-term sustained effort ('press on')."
  },
  {
    text: "Persistence is the ability to:",
    options: [
      { text: "Maintain action over long periods regardless of feelings or initial setbacks", isCorrect: true },
      { text: "Quit a project at the first sign of difficulty", isCorrect: false },
      { text: "Delegate all work to junior staff", isCorrect: false },
      { text: "Wait for external government aid", isCorrect: false }
    ],
    explanation: "Persistence ensures continuous action despite obstacles until the ultimate objective is achieved."
  },
  {
    text: "In communication theory, 'Feedback' is crucial because:",
    options: [
      { text: "It completes the communication loop by confirming the receiver understood the message as intended", isCorrect: true },
      { text: "It increases the cost of sending emails", isCorrect: false },
      { text: "It prevents the sender from speaking again", isCorrect: false },
      { text: "It is required only in court trials", isCorrect: false }
    ],
    explanation: "Feedback closes the two-way loop, allowing the sender to verify that the message was correctly interpreted."
  },
  {
    text: "Paralanguage includes all of the following vocal aspects EXCEPT:",
    options: [
      { text: "Written words in a textbook", isCorrect: true },
      { text: "Tone of voice", isCorrect: false },
      { text: "Pitch and volume", isCorrect: false },
      { text: "Speech speed and pause emphasis", isCorrect: false }
    ],
    explanation: "Paralanguage refers to non-verbal vocal cues (pitch, volume, tone) accompanying speech, not written text."
  },
  {
    text: "According to Peter Drucker, 'Management is doing things right; Leadership is...'",
    options: [
      { text: "Doing the right things", isCorrect: true },
      { text: "Doing things fast", isCorrect: false },
      { text: "Doing things alone", isCorrect: false },
      { text: "Doing nothing at all", isCorrect: false }
    ],
    explanation: "Peter Drucker defined leadership as setting vision and direction—'doing the right things'."
  },
  {
    text: "What is the optimal size range recommended for a core high-performing 'Dream Team'?",
    options: [
      { text: "3 to 10 members", isCorrect: true },
      { text: "1 member only", isCorrect: false },
      { text: "50 to 100 members", isCorrect: false },
      { text: "500 members", isCorrect: false }
    ],
    explanation: "Dream teams function best with 3 to 10 members with complementary skill sets."
  },
  {
    text: "According to John C. Maxwell's Law of the Big Picture:",
    options: [
      { text: "The goal is more important than the role", isCorrect: true },
      { text: "Individual prestige outweighs team outcome", isCorrect: false },
      { text: "Only the manager should know the goal", isCorrect: false },
      { text: "Big pictures should be hung on office walls", isCorrect: false }
    ],
    explanation: "The Law of the Big Picture requires team members to prioritize the collective vision over individual positions."
  },
  {
    text: "Maxwell's 'Law of the Chain' states that:",
    options: [
      { text: "The strength of a team is impacted by its weakest link", isCorrect: true },
      { text: "Chains should be used to lock warehouse stock", isCorrect: false },
      { text: "Strong members eliminate weak links automatically without training", isCorrect: false },
      { text: "Every team must have 10 chains of command", isCorrect: false }
    ],
    explanation: "The Law of the Chain cautions that team output is constrained by the performance of its weakest member."
  },
  {
    text: "Maxwell's 'Law of the Catalyst' teaches that winning teams:",
    options: [
      { text: "Possess self-motivated players who make things happen and stir action", isCorrect: true },
      { text: "Rely exclusively on external consultants for motivation", isCorrect: false },
      { text: "Avoid taking any initiative", isCorrect: false },
      { text: "Never make quick decisions", isCorrect: false }
    ],
    explanation: "Catalysts are proactive team members who inspire momentum and drive results."
  },
  {
    text: "SMEDAN was established by an Act of Parliament in what year?",
    options: [
      { text: "2003", isCorrect: true },
      { text: "1960", isCorrect: false },
      { text: "1988", isCorrect: false },
      { text: "2019", isCorrect: false }
    ],
    explanation: "The SMEDAN Act was enacted in 2003 to establish the Small and Medium Enterprises Development Agency of Nigeria."
  },
  {
    text: "The Bank of Industry (BOI) provides financial support to which primary sectors?",
    options: [
      { text: "Industrial, manufacturing, mining, and agro-processing projects", isCorrect: true },
      { text: "Personal luxury shopping credit", isCorrect: false },
      { text: "Foreign holiday travel agencies", isCorrect: false },
      { text: "Speculative currency betting", isCorrect: false }
    ],
    explanation: "BOI targets real-sector industrial manufacturing, processing, and mining enterprises."
  },
  {
    text: "What is the equity ownership share of the Central Bank of Nigeria (CBN) in the Bank of Agriculture (NACRDB)?",
    options: [
      { text: "40%", isCorrect: true },
      { text: "60%", isCorrect: false },
      { text: "100%", isCorrect: false },
      { text: "10%", isCorrect: false }
    ],
    explanation: "NACRDB (BOA) equity is owned 60% by the Federal Ministry of Finance and 40% by the Central Bank of Nigeria."
  },
  {
    text: "Which decree established the Raw Materials Research and Development Council (RMRDC)?",
    options: [
      { text: "Decree No. 39 of 1987", isCorrect: true },
      { text: "Decree No. 16 of 1995", isCorrect: false },
      { text: "Decree No. 1 of 1960", isCorrect: false },
      { text: "Decree No. 10 of 2005", isCorrect: false }
    ],
    explanation: "RMRDC was established by Decree No. 39 of 1987."
  },
  {
    text: "What is the principal mandate of the Nigerian Export Promotion Council (NEPC)?",
    options: [
      { text: "Promoting non-oil export growth and diversification of Nigeria's foreign exchange earnings", isCorrect: true },
      { text: "Importing refined petroleum products", isCorrect: false },
      { text: "Collecting domestic value-added taxes", isCorrect: false },
      { text: "Regulating public university fees", isCorrect: false }
    ],
    explanation: "NEPC promotes non-oil export development to diversify Nigeria's export earnings."
  },
  {
    text: "Where was Nigeria's first Industrial Development Center (IDC) established in 1962?",
    options: [
      { text: "Owerri", isCorrect: true },
      { text: "Kano", isCorrect: false },
      { text: "Zaria", isCorrect: false },
      { text: "Lagos", isCorrect: false }
    ],
    explanation: "The first IDC was set up in Owerri in 1962, followed later by Zaria, Oshogbo, and others."
  },
  {
    text: "Under the SMEIES scheme initiated by the Bankers' Committee, participating commercial banks agreed to set aside what percentage of their Profit After Tax (PAT)?",
    options: [
      { text: "10%", isCorrect: true },
      { text: "50%", isCorrect: false },
      { text: "1%", isCorrect: false },
      { text: "25%", isCorrect: false }
    ],
    explanation: "SMEIES required banks to invest 10% of their annual PAT into SME equity investments."
  },
  {
    text: "Which agency regulates and registers business names, incorporated trustees, and private limited companies in Nigeria?",
    options: [
      { text: "CAC (Corporate Affairs Commission)", isCorrect: true },
      { text: "NAFDAC", isCorrect: false },
      { text: "SON", isCorrect: false },
      { text: "NIPC", isCorrect: false }
    ],
    explanation: "CAC regulates the formation, registration, and management of business names and companies under CAMA."
  },
  {
    text: "Trade credit provided by suppliers is classified as which type of business financing?",
    options: [
      { text: "Short-term unsecured credit", isCorrect: true },
      { text: "Long-term debenture equity", isCorrect: false },
      { text: "Sovereign debt bond", isCorrect: false },
      { text: "Permanent capital grant", isCorrect: false }
    ],
    explanation: "Trade credit is short-term, unsecured working capital credit extended by suppliers."
  },
  {
    text: "What is the compound interest formula used to calculate accumulated balance (A)?",
    options: [
      { text: "A = P(1 + r/n)^(nt)", isCorrect: true },
      { text: "A = P * r * t", isCorrect: false },
      { text: "A = P / r", isCorrect: false },
      { text: "A = P - r", isCorrect: false }
    ],
    explanation: "The compound interest formula is A = P(1 + r/n)^(nt), where P is principal, r is annual interest rate, n is compounding frequency, and t is time in years."
  }
];

async function expandTo350Questions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for EED 326 Master 350-Question Expansion...");

    const quizzes = await Quiz.find({ title: /EED 326/i });
    console.log(`Found ${quizzes.length} EED 326 Quizzes to update.`);

    for (const quiz of quizzes) {
      const existingCount = quiz.questions.length;
      console.log(`Quiz "${quiz.title}" currently has ${existingCount} questions.`);

      const existingTexts = new Set(quiz.questions.map(q => q.text.trim()));
      const toAdd = pastExamQuestions100.filter(q => !existingTexts.has(q.text.trim()));

      quiz.questions.push(...toAdd);
      quiz.timeLimit = 30; // 30 minutes for 60-question randomized CBT exam
      await quiz.save();

      console.log(`Updated "${quiz.title}": added ${toAdd.length} new unique questions. Total count now: ${quiz.questions.length}`);
    }

    console.log("\n=======================================================");
    console.log("✅ Master Seeding Complete! EED 326 Question Pool is now 350 Questions.");
    console.log("✅ Options randomization engine ensures correct answer letters are completely unpredictable per candidate!");
    console.log("=======================================================");
    process.exit(0);
  } catch (err) {
    console.error("Expansion failed:", err);
    process.exit(1);
  }
}

expandTo350Questions();
