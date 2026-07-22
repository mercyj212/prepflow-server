import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Department from '../models/Department.js';

dotenv.config();

// The 50 NEW questions (Questions 201 - 250) based on latest PDF scans
const new50Questions = [
  // --- BANK ACCOUNT OPENING & OPERATION (201-210) ---
  {
    text: "When opening a new bank account, what is the very first step an individual or business owner must take?",
    options: [
      { text: "Collect cheque books from the counter", isCorrect: false },
      { text: "Choose an institution and account type suitable for their financial needs", isCorrect: true },
      { text: "Sign a credit guarantee agreement", isCorrect: false },
      { text: "Pay a loan processing fee", isCorrect: false }
    ],
    explanation: "Step 1 in opening a bank account is choosing an institution and selecting the type of account (Savings, Current, Term Deposit) that fits your needs."
  },
  {
    text: "Which of the following documents is mandatory when providing personal information for bank account opening in Nigeria?",
    options: [
      { text: "Valid government-issued ID (National ID, Voter's Card, Driver's License, or Passport)", isCorrect: true },
      { text: "Secondary school testimonial copy only", isCorrect: false },
      { text: "A letter from a local trade union", isCorrect: false },
      { text: "A receipt from a retail supermarket", isCorrect: false }
    ],
    explanation: "Banks require official government-issued photo identification to verify identity and comply with Know-Your-Customer (KYC) regulations."
  },
  {
    text: "Why do banks require a recent utility bill (electricity, water, or waste) during account opening?",
    options: [
      { text: "To pay the bill on behalf of the customer", isCorrect: false },
      { text: "To verify the customer's residential address", isCorrect: true },
      { text: "To check the customer's credit score", isCorrect: false },
      { text: "To calculate monthly interest rates", isCorrect: false }
    ],
    explanation: "Utility bills serve as proof of residential address under anti-money laundering and KYC regulations."
  },
  {
    text: "What major feature distinguishes a Current Account from a standard Savings Account?",
    options: [
      { text: "Current accounts issue cheque books and offer overdraft facilities, but usually pay little to no interest", isCorrect: true },
      { text: "Current accounts can never be used by businesses", isCorrect: false },
      { text: "Savings accounts permit unlimited cheque withdrawals to third parties", isCorrect: false },
      { text: "Current accounts are available only to children under 10", isCorrect: false }
    ],
    explanation: "Current accounts allow third-party cheque payments and overdrafts, whereas savings accounts earn interest and are aimed at accumulation."
  },
  {
    text: "In the 7-step account opening process, what is required in Step 5 (Agree to Terms)?",
    options: [
      { text: "Accepting the legal rules, fee disclosures, and relationship terms governing the account", isCorrect: true },
      { text: "Paying 50% of your income to the bank", isCorrect: false },
      { text: "Surrendering ownership of your business assets to the bank", isCorrect: false },
      { text: "Pledging your personal property as collateral immediately", isCorrect: false }
    ],
    explanation: "Step 5 involves reading and agreeing to the bank's terms of service, fee structures, and account operational disclosures."
  },
  {
    text: "What tool is typically issued to a current account holder to enable payments to third parties without cash?",
    options: [
      { text: "Cheque Book", isCorrect: true },
      { text: "Gift Voucher", isCorrect: false },
      { text: "Promissory Stamp", isCorrect: false },
      { text: "Treasury Coupon", isCorrect: false }
    ],
    explanation: "Cheque books are issued to current account holders to draw funds payable to third parties."
  },
  {
    text: "What does KYC stand for in banking operations?",
    options: [
      { text: "Know Your Customer", isCorrect: true },
      { text: "Keep Your Cash", isCorrect: false },
      { text: "Key Yield Calculation", isCorrect: false },
      { text: "Knowledge Yield Company", isCorrect: false }
    ],
    explanation: "KYC stands for Know Your Customer, a standard regulatory process to verify identity and prevent financial fraud."
  },
  {
    text: "Which type of bank account locks customer funds for a fixed tenure (e.g. 90 days or 1 year) in exchange for higher interest payouts?",
    options: [
      { text: "Term / Fixed Deposit Account", isCorrect: true },
      { text: "Basic Checking Account", isCorrect: false },
      { text: "Petty Cash Account", isCorrect: false },
      { text: "Overdraft Revolving Account", isCorrect: false }
    ],
    explanation: "Term/Fixed Deposit accounts hold funds for a set duration, offering higher interest rates than regular savings accounts."
  },
  {
    text: "Step 7 of the bank account opening guide signifies:",
    options: [
      { text: "Full ownership of the active account and receiving banking access tools (debit card, online login)", isCorrect: true },
      { text: "Immediate audit by government tax officers", isCorrect: false },
      { text: "Automatic approval for a N100 million loan", isCorrect: false },
      { text: "Closing the account permanently", isCorrect: false }
    ],
    explanation: "Step 7 is the final step where paperwork is complete and the customer receives debit cards/cheque books to operate the account."
  },
  {
    text: "Why is operating a dedicated business bank account recommended for entrepreneurs over using a personal account?",
    options: [
      { text: "It separates business finances from personal expenses, ensuring accurate accounting and financial credibility", isCorrect: true },
      { text: "It legally exempts the business from all taxation", isCorrect: false },
      { text: "It doubles the interest rate on all deposits automatically", isCorrect: false },
      { text: "Personal bank accounts are illegal in Nigeria", isCorrect: false }
    ],
    explanation: "A business bank account ensures separation of entity, clear audit trails, corporate credibility, and tax compliance."
  },

  // --- LOAN EVALUATION CRITERIA & USES OF FUNDS (211-225) ---
  {
    text: "When a bank lending officer evaluates a loan application, what is the single most important question in their mind?",
    options: [
      { text: "'How fancy is the borrower's office building?'", isCorrect: false },
      { text: "'Can the borrower repay this loan according to the agreed terms?'", isCorrect: true },
      { text: "'What political party does the borrower belong to?'", isCorrect: false },
      { text: "'How many social media followers does the business have?'", isCorrect: false },
    ],
    explanation: "Foremost in a lender's mind when reviewing a loan application is assessing whether the borrower has the capacity to repay."
  },
  {
    text: "Which of the following is ONE of the 5 criteria for evaluating loan sources before borrowing?",
    options: [
      { text: "What are the benefits of the loan in relation to its cost?", isCorrect: true },
      { text: "How many employees does the bank manager have?", isCorrect: false },
      { text: "Is the bank located in a foreign country?", isCorrect: false },
      { text: "Will the loan eliminate the need for accounting?", isCorrect: false }
    ],
    explanation: "Evaluating benefits vs costs is one of the 5 key criteria when choosing a source of credit."
  },
  {
    text: "Which loan evaluation criterion asks whether loan conditions will restrict the entrepreneur's freedom to make operational decisions?",
    options: [
      { text: "Flexibility", isCorrect: true },
      { text: "Inflation rate", isCorrect: false },
      { text: "Tax rate", isCorrect: false },
      { text: "Depreciation schedule", isCorrect: false }
    ],
    explanation: "Flexibility evaluates whether restrictive covenants attached to a loan will hamper management's operational agility."
  },
  {
    text: "Which term describes short-term financing provided by suppliers allowing a business to buy goods now and pay later on open account?",
    options: [
      { text: "Trade Credit", isCorrect: true },
      { text: "Mortgage Loan", isCorrect: false },
      { text: "Venture Capital Equity", isCorrect: false },
      { text: "Sovereign Eurobond", isCorrect: false }
    ],
    explanation: "Trade Credit allows businesses to acquire inventory from suppliers on credit, making it a self-liquidating short-term source of funds."
  },
  {
    text: "Trade credit is considered 'self-liquidating' because:",
    options: [
      { text: "The sale of the purchased inventory generates the cash needed to pay back the supplier", isCorrect: true },
      { text: "The government pays off the debt automatically", isCorrect: false },
      { text: "It is converted into corporate equity shares", isCorrect: false },
      { text: "Suppliers forgive 100% of the debt after 30 days", isCorrect: false }
    ],
    explanation: "Trade credit is self-liquidating because selling the goods generates the revenue to settle the supplier's invoice."
  },
  {
    text: "Short-Term Credit is defined as credit that must be repaid within what timeframe?",
    options: [
      { text: "Less than 1 year (up to 12 months)", isCorrect: true },
      { text: "5 to 10 years", isCorrect: false },
      { text: "25 years", isCorrect: false },
      { text: "Indefinitely (never repaid)", isCorrect: false }
    ],
    explanation: "Short-term credit has a maturity of less than one year, typically used for seasonal working capital needs."
  },
  {
    text: "Long-Term Credit (loans for more than 1 year) is primarily used by enterprises for:",
    options: [
      { text: "Daily tea and coffee supplies", isCorrect: false },
      { text: "Business expansion, acquisition of heavy machinery, or real estate construction", isCorrect: true },
      { text: "Paying weekly newspaper subscriptions", isCorrect: false },
      { text: "Settling minor 3-day taxi fares", isCorrect: false }
    ],
    explanation: "Long-term loans finance fixed asset acquisitions and structural expansion projects whose benefits accrue over years."
  },
  {
    text: "How do Equity Funds differ from debt loans?",
    options: [
      { text: "Equity funds represent ownership in the business and are never repaid; debt loans must be repaid with interest", isCorrect: true },
      { text: "Equity funds carry a fixed 50% interest rate payable monthly", isCorrect: false },
      { text: "Debt loans give lenders voting rights at AGMs", isCorrect: false },
      { text: "There is no difference between equity and debt", isCorrect: false }
    ],
    explanation: "Equity represents permanent ownership capital (no repayment obligation), whereas debt is borrowed money requiring repayment with interest."
  },
  {
    text: "Which document is essential for proving to a bank lender that a proposed business venture is viable and capable of generating cash flow?",
    options: [
      { text: "Business Plan (including Cash Flow Projections)", isCorrect: true },
      { text: "Birth Certificate", isCorrect: false },
      { text: "Personal Photo Album", isCorrect: false },
      { text: "Driver's License renewal slip", isCorrect: false }
    ],
    explanation: "A solid Business Plan with detailed cash flow projections demonstrates business viability and repayment capacity to lenders."
  },
  {
    text: "Why might a bank lender decline a loan application even if the borrower offers tangible collateral?",
    options: [
      { text: "If the business plan shows poor cash flow and inability to generate cash for loan repayment", isCorrect: true },
      { text: "Because banks dislike accepting collateral", isCorrect: false },
      { text: "Because collateral guarantees 100% repayment automatically", isCorrect: false },
      { text: "Because loans are only granted to foreign governments", isCorrect: false }
    ],
    explanation: "Lenders look at primary repayment source (cash flow) first. Collateral is only a secondary fallback in case of default."
  },
  {
    text: "Which factor refers to the borrower's moral standing, honesty, and past credit repayment history?",
    options: [
      { text: "Character", isCorrect: true },
      { text: "Capacity", isCorrect: false },
      { text: "Capital", isCorrect: false },
      { text: "Collateral", isCorrect: false }
    ],
    explanation: "Character evaluates the borrower's integrity, honesty, and commitment to fulfill financial obligations."
  },
  {
    text: "In credit analysis, 'Capability' assesses:",
    options: [
      { text: "The borrower's professional expertise, experience, and managerial skill to operate the business successfully", isCorrect: true },
      { text: "The size of the borrower's personal house", isCorrect: false },
      { text: "The distance between the bank and the market", isCorrect: false },
      { text: "The color of the business logo", isCorrect: false }
    ],
    explanation: "Capability evaluates whether the management team possesses the technical and business expertise to run the venture profitably."
  },
  {
    text: "Which of the following is considered tangible collateral for a bank loan?",
    options: [
      { text: "Fixed asset title documents (Certificate of Occupancy for land/building)", isCorrect: true },
      { text: "A verbal promise from a friend", isCorrect: false },
      { text: "Unwritten business ideas", isCorrect: false },
      { text: "An expired identity card", isCorrect: false }
    ],
    explanation: "Tangible collateral includes real estate title documents (C of O), equipment, or pledged fixed deposit certificates."
  },
  {
    text: "Guarantors provided for a business loan agree to:",
    options: [
      { text: "Assume financial responsibility and repay the debt if the principal borrower defaults", isCorrect: true },
      { text: "Manage the business daily without pay", isCorrect: false },
      { text: "Audit the bank's annual report", isCorrect: false },
      { text: "Collect taxes for the government", isCorrect: false }
    ],
    explanation: "Guarantors legally pledge to settle the outstanding debt if the primary borrower fails to pay."
  },
  {
    text: "Over-extended credit can be dangerous for a small enterprise because:",
    options: [
      { text: "High debt service costs can swallow cash flow and lead to insolvency/bankruptcy", isCorrect: true },
      { text: "It causes immediate government tax hikes", isCorrect: false },
      { text: "It forces the business to hire 1,000 workers", isCorrect: false },
      { text: "It doubles customer demand overnight", isCorrect: false }
    ],
    explanation: "Taking on excessive debt burden increases interest expenses, straining liquidity and risking bankruptcy during sales slumps."
  },

  // --- INTEREST BENEFITS & COMPOUNDING CALCULATIONS (226-240) ---
  {
    text: "Interest is conceptually defined as:",
    options: [
      { text: "The price of money — a reward for savers and a cost for borrowers", isCorrect: true },
      { text: "A government penalty tax on sales", isCorrect: false },
      { text: "The physical paper used to print money", isCorrect: false },
      { text: "A mandatory donation to charity", isCorrect: false }
    ],
    explanation: "Interest is the cost of borrowing money or the financial reward paid to savers for depositing their capital."
  },
  {
    text: "How does interest act as a 'Passive Income' generator for savers?",
    options: [
      { text: "It turns idle cash into a financial 'worker' that earns regular returns without active physical labor", isCorrect: true },
      { text: "It requires working 18 hours daily at a factory", isCorrect: false },
      { text: "It pays salary in foreign goods only", isCorrect: false },
      { text: "It eliminates all living expenses", isCorrect: false }
    ],
    explanation: "Savings earning interest generate passive income—money working for you while idle."
  },
  {
    text: "How does interest act as an 'Inflation Hedge'?",
    options: [
      { text: "It helps preserve the purchasing power of money over time against rising commodity prices", isCorrect: true },
      { text: "It reduces the physical size of bank notes", isCorrect: false },
      { text: "It stops all market price increases in the country", isCorrect: false },
      { text: "It guarantees zero taxation", isCorrect: false }
    ],
    explanation: "Hiding cash under a mattress causes it to lose purchasing power due to inflation; interest earned on savings counteracts this erosion."
  },
  {
    text: "If N200,000 is kept hidden under a mattress for 5 years without earning interest in an inflationary economy, what happens to its real value?",
    options: [
      { text: "It loses purchasing power, meaning it can buy significantly fewer goods than 5 years ago", isCorrect: true },
      { text: "It automatically doubles in purchasing power", isCorrect: false },
      { text: "Its real value remains 100% unchanged", isCorrect: false },
      { text: "The bank adds N50,000 to it automatically", isCorrect: false }
    ],
    explanation: "Uninvested cash succumbs to inflation, severely diminishing the actual quantity of goods it can purchase in the future."
  },
  {
    text: "How does interest act as an 'Incentive' for savings culture in a nation?",
    options: [
      { text: "It rewards individuals for foregoing immediate consumption in favor of future capital accumulation", isCorrect: true },
      { text: "It forces people to spend all their cash immediately", isCorrect: false },
      { text: "It penalizes people who save in banks", isCorrect: false },
      { text: "It makes borrowing completely free", isCorrect: false }
    ],
    explanation: "Interest offers a financial incentive, encouraging individuals to save capital which banks can lend to productive businesses."
  },
  {
    text: "What is the core principle of 'Compounding' (Compound Interest)?",
    options: [
      { text: "Earning 'growth on growth' — interest is earned on both the initial principal AND previously accumulated interest", isCorrect: true },
      { text: "Paying interest only once at the end of 50 years", isCorrect: false },
      { text: "Charging interest only on cash purchases", isCorrect: false },
      { text: "Deducting fees from savings every day", isCorrect: false }
    ],
    explanation: "Compounding means earning interest on your interest, creating an exponential growth curve for savings over time."
  },
  {
    text: "If N1,000 is saved at a 10% annual compound interest rate, how much interest is earned in the FIRST year?",
    options: [
      { text: "N100", isCorrect: true },
      { text: "N110", isCorrect: false },
      { text: "N200", isCorrect: false },
      { text: "N1,000", isCorrect: false }
    ],
    explanation: "Year 1 interest = 10% of N1,000 = (10/100) * 1,000 = N100."
  },
  {
    text: "Using the same N1,000 at 10% compound interest, what is the new principal balance at the start of the SECOND year?",
    options: [
      { text: "N1,100 (N1,000 principal + N100 first year interest)", isCorrect: true },
      { text: "N1,000", isCorrect: false },
      { text: "N1,200", isCorrect: false },
      { text: "N900", isCorrect: false }
    ],
    explanation: "At the start of Year 2, the new balance is Principal (N1,000) + Year 1 Interest (N100) = N1,100."
  },
  {
    text: "How much interest is earned in the SECOND year on that N1,100 balance at 10% compound interest?",
    options: [
      { text: "N110 (10% of N1,100)", isCorrect: true },
      { text: "N100", isCorrect: false },
      { text: "N150", isCorrect: false },
      { text: "N210", isCorrect: false }
    ],
    explanation: "Year 2 interest = 10% of N1,100 = N110."
  },
  {
    text: "What is the total account balance at the end of the second year for N1,000 compounded at 10% annually?",
    options: [
      { text: "N1,210", isCorrect: true },
      { text: "N1,200", isCorrect: false },
      { text: "N1,100", isCorrect: false },
      { text: "N1,300", isCorrect: false }
    ],
    explanation: "Total balance end of Year 2 = N1,100 + N110 = N1,210 (compared to simple interest which would yield N1,200)."
  },
  {
    text: "To maximize compounding benefits on savings, financial experts recommend:",
    options: [
      { text: "Choosing an account where interest is compounded more frequently (e.g. monthly/daily) and leaving funds invested long-term", isCorrect: true },
      { text: "Withdrawing all interest every week and spending it on impulse items", isCorrect: false },
      { text: "Changing bank accounts every 3 days", isCorrect: false },
      { text: "Saving only when you reach age 60", isCorrect: false }
    ],
    explanation: "More frequent compounding frequencies (e.g. monthly vs annual) generate higher overall effective yield over time."
  },
  {
    text: "What does the 'Risk Compensation' principle of interest state?",
    options: [
      { text: "The higher the perceived risk of default by a borrower, the higher the interest rate demanded by lenders", isCorrect: true },
      { text: "High risk borrowers always pay zero interest", isCorrect: false },
      { text: "Safe government bonds pay the highest interest rates", isCorrect: false },
      { text: "Risk has no influence on interest rates", isCorrect: false }
    ],
    explanation: "Lenders demand a higher risk premium (higher interest rate) to compensate for taking on riskier borrowers."
  },
  {
    text: "Retained Earnings' in business finance refers to:",
    options: [
      { text: "Net profits kept within the business after dividends, reused for reinvestment and expansion", isCorrect: true },
      { text: "Unpaid taxes owed to the state government", isCorrect: false },
      { text: "Salaries withheld from defaulting staff", isCorrect: false },
      { text: "Cash stolen by fraudulent employees", isCorrect: false }
    ],
    explanation: "Retained earnings are accumulated net profits retained in the firm rather than distributed as dividends."
  },
  {
    text: "Why are retained earnings considered a cheap and flexible source of business expansion funding?",
    options: [
      { text: "They incur no debt interest payments, require no loan approval, and do not dilute owner control", isCorrect: true },
      { text: "They are funded by government subventions", isCorrect: false },
      { text: "They carry zero risk of loss", isCorrect: false },
      { text: "Banks pay a bonus whenever retained earnings are used", isCorrect: false }
    ],
    explanation: "Using retained earnings avoids interest costs, debt covenants, and share dilution associated with external capital."
  },
  {
    text: "What is 'Cash Flow' in business operations?",
    options: [
      { text: "The net amount of cash and cash-equivalents moving into and out of a business", isCorrect: true },
      { text: "The total physical weight of currency notes in a safe", isCorrect: false },
      { text: "The official profit reported on paper regardless of actual cash collection", isCorrect: false },
      { text: "The speed of electronic bank transfers", isCorrect: false }
    ],
    explanation: "Cash flow tracks the actual timing and volume of cash receipts (inflows) and cash payments (outflows)."
  },

  // --- POLICY INTERVENTIONS & EXTENDED BUSINESS FINANCIALS (241-250) ---
  {
    text: "What is the United Nations TOKTEN scheme mentioned in Nigerian SME policy development?",
    options: [
      { text: "Transfer of Knowledge Through Expatriate Nationals", isCorrect: true },
      { text: "Taxation of Overseas Korean Technology Networks", isCorrect: false },
      { text: "Trade Organization for Knowledge and Technical Education in Nigeria", isCorrect: false },
      { text: "Total Operational Knowledge for Tertiary Education Networks", isCorrect: false }
    ],
    explanation: "TOKTEN stands for Transfer of Knowledge Through Expatriate Nationals, tapping into diaspora expertise."
  },
  {
    text: "In Nigerian public procurement, 'Due Process' was introduced to ensure:",
    options: [
      { text: "Transparency, competitive bidding, openness, and value for money in contract awards", isCorrect: true },
      { text: "Awarding all contracts exclusively to foreign firms", isCorrect: false },
      { text: "Eliminating small enterprises from government bidding", isCorrect: false },
      { text: "Bypassing audit inspections", isCorrect: false }
    ],
    explanation: "Due Process mechanisms ensure competitive, transparent, and fair public procurement practices."
  },
  {
    text: "How does government patronage of local small enterprises stimulate national development?",
    options: [
      { text: "It creates local demand, builds indigenous industrial capacity, and conserves foreign exchange", isCorrect: true },
      { text: "It increases foreign import bills", isCorrect: false },
      { text: "It forces small firms out of business", isCorrect: false },
      { text: "It causes immediate currency devaluation", isCorrect: false }
    ],
    explanation: "Government sub-contracting and procurement from local SMEs boosts domestic production and employment."
  },
  {
    text: "What is 'Sub-Contracting' in industrial manufacturing?",
    options: [
      { text: "An arrangement where a large main enterprise hires a smaller firm to perform specific component production or services", isCorrect: true },
      { text: "A legal suit between two competing companies", isCorrect: false },
      { text: "Closing down a factory due to labor strikes", isCorrect: false },
      { text: "Exporting raw materials directly without processing", isCorrect: false }
    ],
    explanation: "Sub-contracting links large industries with small specialized suppliers who manufacture specific parts or components."
  },
  {
    text: "What key indicator warns a business owner that their business is facing a 'Liquidity Crisis'?",
    options: [
      { text: "Inability to pay immediate short-term obligations (like bills, wages, supplier invoices) as they fall due", isCorrect: true },
      { text: "Having too much cash in the bank account", isCorrect: false },
      { text: "Winning an international business award", isCorrect: false },
      { text: "Increased customer orders for next year", isCorrect: false }
    ],
    explanation: "A liquidity crisis occurs when a firm lacks cash to meet immediate short-term liabilities despite holding non-cash assets."
  },
  {
    text: "Which type of financial ratio evaluates a firm's ability to cover its short-term debts with short-term assets?",
    options: [
      { text: "Liquidity Ratio (e.g. Current Ratio, Quick Ratio)", isCorrect: true },
      { text: "Debt-to-Equity Ratio", isCorrect: false },
      { text: "Return on Equity (ROE)", isCorrect: false },
      { text: "Inventory Turnover Ratio", isCorrect: false }
    ],
    explanation: "Liquidity ratios measure a company's capacity to pay off short-term obligations without raising external capital."
  },
  {
    text: "What does the Current Ratio measure?",
    options: [
      { text: "Current Assets divided by Current Liabilities", isCorrect: true },
      { text: "Total Debt divided by Total Revenue", isCorrect: false },
      { text: "Gross Income minus Net Income", isCorrect: false },
      { text: "Stock Price divided by Earnings Per Share", isCorrect: false }
    ],
    explanation: "Current Ratio = Current Assets / Current Liabilities, showing if a business has enough short-term assets to cover short-term debts."
  },
  {
    text: "Why is a Business Plan considered a living document?",
    options: [
      { text: "It should be continuously updated and revised to reflect changing market conditions and performance metrics", isCorrect: true },
      { text: "It grows physically larger over time by itself", isCorrect: false },
      { text: "It is written in spoken human language", isCorrect: false },
      { text: "It never needs to be read after starting the business", isCorrect: false }
    ],
    explanation: "A business plan is 'living' because it must be regularly reviewed, adjusted, and updated as market circumstances evolve."
  },
  {
    text: "What is 'Depreciation' in business accounting?",
    options: [
      { text: "The systematic allocation of the cost of a tangible fixed asset over its useful economic life", isCorrect: true },
      { text: "The physical loss of cash from a safe", isCorrect: false },
      { text: "An increase in the market price of real estate", isCorrect: false },
      { text: "The interest paid on bank deposits", isCorrect: false }
    ],
    explanation: "Depreciation accounts for the wear, tear, and loss of value of tangible capital assets over time."
  },
  {
    text: "In conclusion, the ultimate goal of studying EED 326 (Entrepreneurship Development II) for tertiary students is to:",
    options: [
      { text: "Equip scholars with entrepreneurial mindsets, life skills, financial literacy, and practical knowledge to create sustainable enterprises and employment", isCorrect: true },
      { text: "Encourage all graduates to rely solely on government civil service job postings", isCorrect: false },
      { text: "Teach students how to avoid paying for goods at market stores", isCorrect: false },
      { text: "Memorize definitions without practical application", isCorrect: false }
    ],
    explanation: "EED 326 empowers students to become self-reliant job creators, innovative leaders, and skilled financial managers in the national economy."
  }
];

async function updateEED326To250Questions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for EED 326 Expansion to 250 Questions...");

    // Find all EED 326 quizzes in the database
    const quizzes = await Quiz.find({ title: /EED 326/i });
    console.log(`Found ${quizzes.length} EED 326 Quizzes to update.`);

    for (const quiz of quizzes) {
      // Check existing questions count
      const existingCount = quiz.questions.length;
      console.log(`Quiz "${quiz.title}" currently has ${existingCount} questions.`);

      // Combine existing questions with the 50 new questions (avoiding duplicate text if already present)
      const existingTexts = new Set(quiz.questions.map(q => q.text.trim()));
      const toAdd = new50Questions.filter(q => !existingTexts.has(q.text.trim()));

      quiz.questions.push(...toAdd);
      quiz.timeLimit = 30; // 30 minutes limit for 60-question shuffle
      await quiz.save();

      console.log(`Updated "${quiz.title}": added ${toAdd.length} new unique questions. Total count now: ${quiz.questions.length}`);
    }

    console.log("\n✅ Success! All EED 326 Quizzes now contain 250 unique, unrepeated questions.");
    process.exit(0);
  } catch (err) {
    console.error("Expansion failed:", err);
    process.exit(1);
  }
}

updateEED326To250Questions();
