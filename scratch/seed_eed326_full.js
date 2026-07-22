import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

// Array of 200 Questions for EED 326
const questions = [
  // ==========================================
  // TOPIC 1: HISTORY & CONCEPTS OF ENTREPRENEURSHIP (1-50)
  // ==========================================
  {
    text: "In the wider context, an enterprise is best defined as:",
    options: [
      { text: "Any business venture that yields immediate cash dividends", isCorrect: false },
      { text: "An identified idea that is translated into a planned and satisfactorily implemented activity", isCorrect: true },
      { text: "A government-owned corporation operating in the public sector", isCorrect: false },
      { text: "A non-profit organization focused solely on charity work", isCorrect: false }
    ],
    explanation: "In its wider sense, an enterprise is any identified idea that is translated into a planned and satisfactorily implemented activity, whereas in a narrower sense, it refers to a business venture that brings profit."
  },
  {
    text: "In the narrower economic context, an enterprise refers specifically to:",
    options: [
      { text: "A business venture or undertaking that brings profit", isCorrect: true },
      { text: "Any social gathering organized by community members", isCorrect: false },
      { text: "A non-governmental organization providing free healthcare", isCorrect: false },
      { text: "A public utility project fully funded by taxes", isCorrect: false }
    ],
    explanation: "In its narrower context, an enterprise means a business venture or undertaking that brings profit."
  },
  {
    text: "Which 18th-century French economist first introduced the term 'entrepreneur' into economic literature?",
    options: [
      { text: "Adam Smith", isCorrect: false },
      { text: "Richard Cantillon", isCorrect: true },
      { text: "Alfred Marshall", isCorrect: false },
      { text: "Joseph Schumpeter", isCorrect: false }
    ],
    explanation: "The term 'entrepreneur' was first introduced into economic theory by the 18th-century French economist Richard Cantillon, defining him as the agent who buys means of production at certain prices to combine them."
  },
  {
    text: "How did Richard Cantillon define the entrepreneur in his early economic writings?",
    options: [
      { text: "As a risk-averse corporate manager receiving a fixed salary", isCorrect: false },
      { text: "As an agent who buys means of production at certain prices in order to combine them into a new product", isCorrect: true },
      { text: "As a government regulator overseeing public trade", isCorrect: false },
      { text: "As an investor who only provides passive capital without operational involvement", isCorrect: false }
    ],
    explanation: "Cantillon defined the entrepreneur as an agent who buys factors of production at known prices to combine them into a new product to sell at uncertain future prices."
  },
  {
    text: "Which economist in 1803 expanded Cantillon's definition by stating that an entrepreneur brings other people together into a single productive organization?",
    options: [
      { text: "J.B. Say", isCorrect: true },
      { text: "David Ricardo", isCorrect: false },
      { text: "John Stuart Mill", isCorrect: false },
      { text: "Israel Kirzner", isCorrect: false }
    ],
    explanation: "J.B. Say (1803) added to Cantillon's definition by emphasizing that the entrepreneur brings other people together into a single productive organization."
  },
  {
    text: "In 1890, Alfred Marshall published 'Principles of Economics' and asserted that there are how many factors of production?",
    options: [
      { text: "Two: Land and Labor", isCorrect: false },
      { text: "Three: Land, Labor, and Capital", isCorrect: false },
      { text: "Four: Land, Labor, Capital, and Organization (Entrepreneurship)", isCorrect: true },
      { text: "Five: Land, Labor, Capital, Technology, and Money", isCorrect: false }
    ],
    explanation: "Alfred Marshall (1890) asserted that there are four factors of production: land, labor, capital, and organization, where organization/entrepreneurship is the coordinating factor."
  },
  {
    text: "Joseph Schumpeter (1934) associated the core role of the entrepreneur primarily with which concept?",
    options: [
      { text: "Routine administration", isCorrect: false },
      { text: "Innovation and 'creative destruction'", isCorrect: true },
      { text: "Passive stock trading", isCorrect: false },
      { text: "Government policy formulation", isCorrect: false }
    ],
    explanation: "Schumpeter argued that the primary function of an entrepreneur is innovation—introducing new products, methods, markets, or sources of supply."
  },
  {
    text: "Which school of thought, championed by Israel Kirzner (1973), emphasizes 'undeliberate learning' and 'alertness to opportunities'?",
    options: [
      { text: "Classical Economics", isCorrect: false },
      { text: "Modern Neo-Austrian School of Thought", isCorrect: true },
      { text: "Keynesian Economics", isCorrect: false },
      { text: "Marxist Economics", isCorrect: false }
    ],
    explanation: "Israel Kirzner represented the modern Neo-Austrian school, defining entrepreneurship in terms of alertness to unnoticed opportunities."
  },
  {
    text: "Harvey Leibenstein (1968) described the entrepreneur as performing which crucial function in the market?",
    options: [
      { text: "Price regulator", isCorrect: false },
      { text: "'Gap-filler' and 'input-completer'", isCorrect: true },
      { text: "Tax collector", isCorrect: false },
      { text: "Central banker", isCorrect: false }
    ],
    explanation: "Leibenstein conceptualized the entrepreneur as a 'gap-filler' and 'input-completer' who makes up for market deficiencies and missing inputs."
  },
  {
    text: "Frank Knight (1921) highlighted that entrepreneurs are unique because they bear:",
    options: [
      { text: "Only insurable risks", isCorrect: false },
      { text: "Non-calculable / uninsurable uncertainty and risk", isCorrect: true },
      { text: "No risk whatsoever", isCorrect: false },
      { text: "Only political risks", isCorrect: false }
    ],
    explanation: "Frank Knight distinguished between ordinary risk (which is insurable) and true uncertainty (which is uninsurable), asserting that entrepreneurs bear uninsurable uncertainty."
  },
  {
    text: "According to the Federal Republic of Nigeria classification, a Micro or Cottage Industry is defined as an enterprise whose total investment cost (excluding land) does not exceed:",
    options: [
      { text: "N500,000.00", isCorrect: false },
      { text: "N1,500,000.00 (One Million Five Hundred Thousand Naira)", isCorrect: true },
      { text: "N10,000,000.00", isCorrect: false },
      { text: "N50,000,000.00", isCorrect: false }
    ],
    explanation: "Micro/Cottage Industries in Nigeria are defined as enterprises whose total investment cost does not exceed N1,500,000.00 (excluding land) and/or workforce of not more than 10 workers."
  },
  {
    text: "What is the maximum workforce limit for a Micro/Cottage Industry in Nigeria?",
    options: [
      { text: "Not more than 10 workers", isCorrect: true },
      { text: "Between 11 and 50 workers", isCorrect: false },
      { text: "Between 51 and 100 workers", isCorrect: false },
      { text: "Up to 300 workers", isCorrect: false }
    ],
    explanation: "A Micro/Cottage Industry has a workforce of not more than 10 workers."
  },
  {
    text: "A Small Scale Industry in Nigeria is classified as having a total investment cost (excluding land) between:",
    options: [
      { text: "N100,000 and N1,000,000", isCorrect: false },
      { text: "N1,500,000.00 and N50,000,000.00", isCorrect: true },
      { text: "N50,000,000.00 and N200,000,000.00", isCorrect: false },
      { text: "Above N200,000,000.00", isCorrect: false }
    ],
    explanation: "Small Scale Industries are defined as those with total investment between N1,500,000.00 and N50,000,000.00 (excluding land) and workforce between 11 and 100 workers."
  },
  {
    text: "The workforce size for a Small Scale Industry in Nigeria ranges between:",
    options: [
      { text: "1 and 5 workers", isCorrect: false },
      { text: "11 and 100 workers", isCorrect: true },
      { text: "101 and 300 workers", isCorrect: false },
      { text: "Over 300 workers", isCorrect: false }
    ],
    explanation: "A Small Scale Industry employs between 11 and 100 workers."
  },
  {
    text: "A Medium Scale Industry in Nigeria has a total investment cost (excluding land) ranging between:",
    options: [
      { text: "N1.5M and N10M", isCorrect: false },
      { text: "N50,000,000.00 and N200,000,000.00", isCorrect: true },
      { text: "N200M and N500M", isCorrect: false },
      { text: "N500M and N1 Billion", isCorrect: false }
    ],
    explanation: "Medium Scale Industries have a total investment of N50,000,000.00 to N200,000,000.00 (excluding land) and workforce of 101 to 300 workers."
  },
  {
    text: "What is the workforce size specified for a Medium Scale Industry in Nigeria?",
    options: [
      { text: "10 to 50 workers", isCorrect: false },
      { text: "51 to 100 workers", isCorrect: false },
      { text: "101 to 300 workers", isCorrect: true },
      { text: "Above 500 workers", isCorrect: false }
    ],
    explanation: "Medium Scale Industry workforce is between 101 and 300 workers."
  },
  {
    text: "An enterprise with total investment exceeding N200,000,000.00 (excluding land) or a labor force of over 300 workers is classified as a:",
    options: [
      { text: "Cottage Industry", isCorrect: false },
      { text: "Small Scale Industry", isCorrect: false },
      { text: "Medium Scale Industry", isCorrect: false },
      { text: "Large Scale Industry", isCorrect: true }
    ],
    explanation: "Large scale industries are defined as those with total investment over N200,000,000.00 excluding land, and/or labor force of over 300 workers."
  },
  {
    text: "Which of the following is an advantage of Paid Employment?",
    options: [
      { text: "Unlimited potential income", isCorrect: false },
      { text: "Total independence in decision making", isCorrect: false },
      { text: "Steady/fixed income and fringe benefits", isCorrect: true },
      { text: "Complete control over company policies", isCorrect: false }
    ],
    explanation: "Advantages of paid employment include steady (fixed) income, fringe benefits, specific responsibilities, and fixed hours of work."
  },
  {
    text: "Which of the following is a major challenge associated with Paid Employment?",
    options: [
      { text: "Uncertainty of learning", isCorrect: false },
      { text: "Limited responsibility and dependence on the employer", isCorrect: true },
      { text: "Bearing all financial losses alone", isCorrect: false },
      { text: "Providing fringe benefits to staff", isCorrect: false }
    ],
    explanation: "Paid employment challenges include following orders, limited responsibility, set income limits, and dependence on the employer."
  },
  {
    text: "Which of the following is a primary advantage of Self-Employment?",
    options: [
      { text: "Fixed work hours every day", isCorrect: false },
      { text: "Guaranteed monthly pension by government", isCorrect: false },
      { text: "Independence, ability to implement creative ideas, and unlimited income potential", isCorrect: true },
      { text: "Minimal personal risk", isCorrect: false }
    ],
    explanation: "Self-employment offers independence, creative freedom, potential for unlimited income, and control over work environment."
  },
  {
    text: "A major challenge faced by self-employed entrepreneurs is:",
    options: [
      { text: "Fixed salary limits set by trade unions", isCorrect: false },
      { text: "Long, irregular work hours and income instability", isCorrect: true },
      { text: "Lack of opportunity to take initiative", isCorrect: false },
      { text: "Having to follow strict supervisor commands daily", isCorrect: false }
    ],
    explanation: "Self-employment challenges include long irregular hours, income instability, lack of fringe benefits, and bearing total business risk."
  },
  {
    text: "Which international classification standard is used to categorize enterprises by sector (e.g. manufacturing, service, retail)?",
    options: [
      { text: "ISIC (International Standard Industrial Classification)", isCorrect: true },
      { text: "ISO 9001", isCorrect: false },
      { text: "GAAP", isCorrect: false },
      { text: "IFRS 15", isCorrect: false }
    ],
    explanation: "Enterprises are classified by sector using the ISIC (International Standard Industrial Classification) code."
  },
  {
    text: "Which of the following business types is classified under Commercial/Service enterprise?",
    options: [
      { text: "Automobile Assembly Plant", isCorrect: false },
      { text: "Banking and Forex Bureau", isCorrect: true },
      { text: "Textile Weaving Mill", isCorrect: false },
      { text: "Cement Manufacturing Factory", isCorrect: false }
    ],
    explanation: "Banking, forex, travel agencies, and consulting are service/commercial enterprises, whereas assembly plants and textile mills are manufacturing enterprises."
  },
  {
    text: "David McClelland's psychological research identified which key trait as a primary driver for entrepreneurs?",
    options: [
      { text: "Need for Power (nPow)", isCorrect: false },
      { text: "Need for Achievement (nAch)", isCorrect: true },
      { text: "Need for Affiliation (nAff)", isCorrect: false },
      { text: "Need for Security (nSec)", isCorrect: false }
    ],
    explanation: "McClelland highlighted the 'Need for Achievement' (nAch) as the defining psychological trait of successful entrepreneurs."
  },
  {
    text: "An entrepreneur with an 'Internal Locus of Control' believes that:",
    options: [
      { text: "Success depends purely on luck and fate", isCorrect: false },
      { text: "Their actions, decisions, and hard work directly determine their success or failure", isCorrect: true },
      { text: "External government policies are solely responsible for business outcomes", isCorrect: false },
      { text: "Competitors control their market destiny", isCorrect: false }
    ],
    explanation: "Internal locus of control means the entrepreneur believes they are in control of their own outcome through effort and skill, rather than external forces."
  },
  {
    text: "What ratio describes the synergy of personality factors (genetics vs environment) in shaping an entrepreneur?",
    options: [
      { text: "90% genetic / 10% environment", isCorrect: false },
      { text: "50/50 synergy of genetic and environmental influences", isCorrect: true },
      { text: "100% genetic", isCorrect: false },
      { text: "100% environmental", isCorrect: false }
    ],
    explanation: "Personality factors in entrepreneurship are described as a 50/50 synergy of genetic (born) and environmental (made/nurture) influences."
  },
  {
    text: "Which of the following is NOT a recognized characteristic of successful entrepreneurs?",
    options: [
      { text: "Calculated risk-taking", isCorrect: false },
      { text: "Persistence under adversity", isCorrect: false },
      { text: "Extreme aversion to all forms of change", isCorrect: true },
      { text: "Opportunity seeking and creativity", isCorrect: false }
    ],
    explanation: "Entrepreneurs initiate and welcome change; they are not averse to change."
  },
  {
    text: "Which type of enterprise has profit generation as its primary motive?",
    options: [
      { text: "Non-Governmental Organization (NGO)", isCorrect: false },
      { text: "Business Enterprise", isCorrect: true },
      { text: "Public Charity Trust", isCorrect: false },
      { text: "Community Development Club", isCorrect: false }
    ],
    explanation: "Business enterprises have profit-making as their primary motive, unlike non-business/social enterprises."
  },
  {
    text: "Perceived opportunities' in entrepreneurship involve:",
    options: [
      { text: "Copying existing businesses blindly without modification", isCorrect: false },
      { text: "Spotting and exploiting ideas of recognized value that others miss or only see in retrospect", isCorrect: true },
      { text: "Waiting for government subsidies before starting", isCorrect: false },
      { text: "Only investing in low-yielding fixed bank deposits", isCorrect: false }
    ],
    explanation: "'Perceived opportunities' means spotting and exploiting an idea that has economic, social, or commercial value which others miss."
  },
  {
    text: "In Nigeria, poor infrastructure such as unstable power supply affects entrepreneurship primarily by:",
    options: [
      { text: "Reducing product demand to zero", isCorrect: false },
      { text: "Increasing operational costs and lowering competitiveness", isCorrect: true },
      { text: "Eliminating the need for capital", isCorrect: false },
      { text: "Increasing government tax revenues", isCorrect: false }
    ],
    explanation: "Infrastructure deficits like power outages force businesses to run generators, severely increasing operating expenses."
  },
  {
    text: "Which factor describes an entrepreneur's ability to withstand hardship and maintain determination over long periods?",
    options: [
      { text: "Impulsiveness", isCorrect: false },
      { text: "Persistence and Perseverance", isCorrect: true },
      { text: "Procrastination", isCorrect: false },
      { text: "Complacency", isCorrect: false }
    ],
    explanation: "Persistence and perseverance enable entrepreneurs to face adversity and keep going until goals are achieved."
  },
  {
    text: "An example of a Non-Business/Non-Profit enterprise is:",
    options: [
      { text: "Commercial Bank", isCorrect: false },
      { text: "Church / Charitable Foundation", isCorrect: true },
      { text: "Supermarket Chain", isCorrect: false },
      { text: "Telecommunications Network Operator", isCorrect: false }
    ],
    explanation: "Churches, charities, and NGOs are classified as non-business/non-profit enterprises."
  },
  {
    text: "Which of the following describes 'Formal Enterprises'?",
    options: [
      { text: "Unregistered street hawkers", isCorrect: false },
      { text: "Registered businesses operating within legal, regulatory, and tax frameworks", isCorrect: true },
      { text: "Illegal contraband syndicates", isCorrect: false },
      { text: "Temporary informal peer savings groups", isCorrect: false }
    ],
    explanation: "Formal enterprises are officially registered with authorities (e.g. CAC) and comply with statutory regulations."
  },
  {
    text: "What is the primary difference between a Consumer Enterprise and an Industrial Enterprise?",
    options: [
      { text: "Consumer enterprises sell directly to end-users; Industrial enterprises produce goods/inputs for other businesses", isCorrect: true },
      { text: "Consumer enterprises are state-owned; Industrial enterprises are private", isCorrect: false },
      { text: "Consumer enterprises operate only online; Industrial enterprises are offline", isCorrect: false },
      { text: "Industrial enterprises never use machinery", isCorrect: false }
    ],
    explanation: "Consumer enterprises provide goods/services to final consumers, while industrial enterprises produce goods used by other producers."
  },
  {
    text: "Which classical economist viewed the entrepreneur under the broad concept of 'business management' without treating it as a distinct factor of production?",
    options: [
      { text: "Adam Smith", isCorrect: true },
      { text: "Joseph Schumpeter", isCorrect: false },
      { text: "Israel Kirzner", isCorrect: false },
      { text: "Harvey Leibenstein", isCorrect: false }
    ],
    explanation: "Early English economists like Adam Smith and David Ricardo subsumed entrepreneurship under general business management."
  },
  {
    text: "What key attribute distinguishes an entrepreneur from a gambler?",
    options: [
      { text: "Entrepreneurs take uncalculated wild risks", isCorrect: false },
      { text: "Entrepreneurs calculate and manage risks carefully before acting", isCorrect: true },
      { text: "Entrepreneurs never face risk", isCorrect: false },
      { text: "Gamblers always rely on thorough market research", isCorrect: false }
    ],
    explanation: "Entrepreneurs calculate and assess risks carefully to mitigate potential failure, unlike gamblers who rely purely on chance."
  },
  {
    text: "Which environmental factor directly influences entrepreneurial activity in a country?",
    options: [
      { text: "Family background and education", isCorrect: false },
      { text: "Government policy, tax incentives, and infrastructure quality", isCorrect: true },
      { text: "Individual blood group", isCorrect: false },
      { text: "Personal height and weight", isCorrect: false }
    ],
    explanation: "Environmental factors include macroeconomic stability, government policies, tax incentives, and infrastructure."
  },
  {
    text: "Which of the following enterprise types is characterized by heavy capital expenditure, complex corporate structure, and large workforce?",
    options: [
      { text: "Cottage enterprise", isCorrect: false },
      { text: "Micro enterprise", isCorrect: false },
      { text: "Large scale enterprise", isCorrect: true },
      { text: "Sole proprietorship kiosk", isCorrect: false }
    ],
    explanation: "Large scale enterprises require massive capital (>N200M) and large labor force (>300 workers)."
  },
  {
    text: "The process of transforming an innovation into a commercial product or service that creates value is called:",
    options: [
      { text: "Stagnation", isCorrect: false },
      { text: "Entrepreneurial process / Commercialization", isCorrect: true },
      { text: "Liquidation", isCorrect: false },
      { text: "Depreciation", isCorrect: false }
    ],
    explanation: "Commercialization/Entrepreneurial process turns creative ideas and innovations into market-ready products."
  },
  {
    text: "Why is entrepreneurship vital for national economic development in Nigeria?",
    options: [
      { text: "It reduces government tax revenue", isCorrect: false },
      { text: "It creates employment, fosters innovation, and utilizes local raw materials", isCorrect: true },
      { text: "It increases dependence on foreign imported finished goods", isCorrect: false },
      { text: "It eliminates all forms of market competition", isCorrect: false }
    ],
    explanation: "Entrepreneurship drives job creation, wealth generation, local resource utilization, and economic growth."
  },
  {
    text: "Which of the following is a characteristic of 'Creative Imitation' in developing countries according to Drucker?",
    options: [
      { text: "Invention of completely original basic science", isCorrect: false },
      { text: "Adapting innovations developed elsewhere to suit local market needs", isCorrect: true },
      { text: "Rejecting all modern technology", isCorrect: false },
      { text: "Focusing solely on traditional agriculture", isCorrect: false }
    ],
    explanation: "Creative imitation involves taking an existing innovation from elsewhere and modifying/improving it for the local context."
  },
  {
    text: "In Nigeria, which government initiative aimed to achieve economic growth by developing top 20 economies by year 2020?",
    options: [
      { text: "Vision 20:2020", isCorrect: true },
      { text: "SAP 1986", isCorrect: false },
      { text: "OFN 1976", isCorrect: false },
      { text: "Green Revolution 1980", isCorrect: false }
    ],
    explanation: "Vision 20:2020 was Nigeria's economic growth strategy aimed at positioning the country among the top 20 economies."
  },
  {
    text: "Which factor describes an entrepreneur's ability to identify opportunities where others see only chaos or confusion?",
    options: [
      { text: "Opportunity Perception & Vision", isCorrect: true },
      { text: "Rigidity", isCorrect: false },
      { text: "Risk Avoidance", isCorrect: false },
      { text: "Short-termism", isCorrect: false }
    ],
    explanation: "Vision and opportunity perception allow entrepreneurs to see business potential in challenging circumstances."
  },
  {
    text: "What is the primary constraint identified by the Lagos Business School (LBS) regarding SME growth in Nigeria?",
    options: [
      { text: "Lack of human desire to work", isCorrect: false },
      { text: "Inadequate access to structured markets and infrastructure", isCorrect: true },
      { text: "Too much electricity supply", isCorrect: false },
      { text: "Excessive cheap long-term bank credit", isCorrect: false }
    ],
    explanation: "LBS research identified market access, infrastructure deficits, and high credit costs as major SME growth bottlenecks."
  },
  {
    text: "An entrepreneur who starts a new business from scratch and brings something into existence that did not exist before is fulfilling the core definition of:",
    options: [
      { text: "'Creates' (New Venture Creation)", isCorrect: true },
      { text: "Corporate franchising", isCorrect: false },
      { text: "Inheritance management", isCorrect: false },
      { text: "Passive tenancy", isCorrect: false }
    ],
    explanation: "'Creates' means building from scratch and bringing into being something that was not there before."
  },
  {
    text: "Which of the following is NOT a challenge of self-employment?",
    options: [
      { text: "Income is not stable or guaranteed", isCorrect: false },
      { text: "Learning never ends", isCorrect: false },
      { text: "Steady guaranteed monthly pension from employer", isCorrect: true },
      { text: "High time constraints and heavy paperwork", isCorrect: false }
    ],
    explanation: "Guaranteed monthly pensions are features of paid/civil service employment, not self-employment."
  },
  {
    text: "Which scholar defined entrepreneurship as the process of creating something of value by devoting the necessary time and effort?",
    options: [
      { text: "Robert Hisrich", isCorrect: true },
      { text: "Karl Marx", isCorrect: false },
      { text: "Milton Friedman", isCorrect: false },
      { text: "Thomas Malthus", isCorrect: false }
    ],
    explanation: "Hisrich defined entrepreneurship as creating something of value with devoted time, effort, and assuming financial/social risks."
  },
  {
    text: "What term describes the ratio of enterprise output circulation within a local community?",
    options: [
      { text: "Local Multiplier / Synergistic Effect", isCorrect: true },
      { text: "Capital Flight", isCorrect: false },
      { text: "Inflationary Spiral", isCorrect: false },
      { text: "Devaluation", isCorrect: false }
    ],
    explanation: "The synergistic nature of local enterprises means output and money circulate among members, multiplying local wealth."
  },
  {
    text: "In enterprise classification, 'Public Enterprises' are owned and controlled by:",
    options: [
      { text: "Private family members", isCorrect: false },
      { text: "Foreign venture capitalists", isCorrect: false },
      { text: "Government / State authorities", isCorrect: true },
      { text: "Sole proprietors", isCorrect: false }
    ],
    explanation: "Public enterprises are statutory corporations or companies owned fully or majority-controlled by government."
  },
  {
    text: "Which characteristic enables entrepreneurs to turn problems encountered by people into profitable solutions?",
    options: [
      { text: "Problem-Solving Mindset", isCorrect: true },
      { text: "Apathy", isCorrect: false },
      { text: "Resignation", isCorrect: false },
      { text: "Defeatism", isCorrect: false }
    ],
    explanation: "Entrepreneurs view problems as market opportunities waiting for practical solutions."
  },

  // ==========================================
  // TOPIC 2: PERSONAL SAVINGS & PORTFOLIO INVESTMENT (51-100)
  // ==========================================
  {
    text: "In personal finance, 'Gross Income' is best defined as:",
    options: [
      { text: "Total earnings before any taxes or deductions are subtracted", isCorrect: true },
      { text: "Take-home pay after all tax deductions", isCorrect: false },
      { text: "Money set aside specifically for emergency savings", isCorrect: false },
      { text: "Interest earned on stock portfolio", isCorrect: false }
    ],
    explanation: "Gross income represents total income earned before taxes, pension, and other statutory deductions."
  },
  {
    text: "Net Income (or Disposable Income) is calculated as:",
    options: [
      { text: "Gross Income plus total bank loans", isCorrect: false },
      { text: "Gross Income minus taxes and mandatory deductions", isCorrect: true },
      { text: "Total monthly expenditures minus savings", isCorrect: false },
      { text: "Investment returns plus dividend yield", isCorrect: false }
    ],
    explanation: "Net Income is the actual take-home income remaining after deducting taxes and mandatory withholdings."
  },
  {
    text: "The primary difference between 'Saving' and 'Investing' is that:",
    options: [
      { text: "Saving involves risk of capital loss; Investing guarantees zero risk", isCorrect: false },
      { text: "Saving focuses on capital preservation and liquidity; Investing seeks capital growth by accepting risk", isCorrect: true },
      { text: "Saving is done only in stock markets; Investing is done only in piggy banks", isCorrect: false },
      { text: "There is no difference between saving and investing", isCorrect: false }
    ],
    explanation: "Saving prioritizes capital safety and immediate availability, while investing puts funds into risk assets for growth."
  },
  {
    text: "What is the recommended minimum percentage of monthly income an individual should aim to save according to personal financial guidelines?",
    options: [
      { text: "1%", isCorrect: false },
      { text: "5%", isCorrect: false },
      { text: "10%", isCorrect: true },
      { text: "50%", isCorrect: false }
    ],
    explanation: "Standard personal finance rules recommend saving at least 10% of gross or disposable monthly income."
  },
  {
    text: "Which financial market is designed for short-term borrowing and lending with maturity of 1 year or less?",
    options: [
      { text: "Capital Market", isCorrect: false },
      { text: "Money Market", isCorrect: true },
      { text: "Forex Derivative Market", isCorrect: false },
      { text: "Commodity Futures Exchange", isCorrect: false }
    ],
    explanation: "The Money Market deals in short-term debt instruments with tenors of up to 12 months."
  },
  {
    text: "Which regulatory body oversees the Nigerian Money Market?",
    options: [
      { text: "Securities and Exchange Commission (SEC)", isCorrect: false },
      { text: "Central Bank of Nigeria (CBN)", isCorrect: true },
      { text: "Nigerian Exchange Group (NGX)", isCorrect: false },
      { text: "National Insurance Commission (NAICOM)", isCorrect: false }
    ],
    explanation: "The Central Bank of Nigeria (CBN) regulates money market operations and monetary policy."
  },
  {
    text: "Which of the following is a classic Money Market instrument?",
    options: [
      { text: "Treasury Bills (T-Bills)", isCorrect: true },
      { text: "Ordinary Shares of First Bank PLC", isCorrect: false },
      { text: "20-Year FGN Corporate Bond", isCorrect: false },
      { text: "Real Estate REIT Equity Units", isCorrect: false }
    ],
    explanation: "Treasury Bills are short-term government debt instruments traded in the money market."
  },
  {
    text: "What is a Commercial Paper (CP)?",
    options: [
      { text: "A long-term 30-year government bond", isCorrect: false },
      { text: "An unsecured, short-term debt instrument issued by creditworthy corporations to meet short-term liabilities", isCorrect: true },
      { text: "A paper certificate representing equity ownership in a small business", isCorrect: false },
      { text: "A bank receipt for fixed deposits lasting 10 years", isCorrect: false }
    ],
    explanation: "Commercial Papers are short-term promissory notes issued by top corporations to raise working capital."
  },
  {
    text: "The Capital Market is the market for:",
    options: [
      { text: "Short-term loans under 30 days", isCorrect: false },
      { text: "Medium- and long-term funds, securities, shares, and bonds (tenor > 1 year)", isCorrect: true },
      { text: "Immediate cash currency exchange only", isCorrect: false },
      { text: "Overnight interbank liquidity", isCorrect: false }
    ],
    explanation: "The Capital Market channels long-term funds (> 1 year) for industrial expansion and infrastructure."
  },
  {
    text: "Who is the apex regulator of the Nigerian Capital Market?",
    options: [
      { text: "Central Bank of Nigeria (CBN)", isCorrect: false },
      { text: "Securities and Exchange Commission (SEC)", isCorrect: true },
      { text: "Federal Inland Revenue Service (FIRS)", isCorrect: false },
      { text: "Corporate Affairs Commission (CAC)", isCorrect: false }
    ],
    explanation: "The Securities and Exchange Commission (SEC) is the apex regulatory body for the Nigerian capital market under the ISA Act 1999."
  },
  {
    text: "What is the primary trading floor/platform for equities and bonds in Nigeria?",
    options: [
      { text: "Nigerian Exchange Group (NGX, formerly NSE)", isCorrect: true },
      { text: "Lagos Commodity Hub", isCorrect: false },
      { text: "Abuja Trade Fair Complex", isCorrect: false },
      { text: "Central Bank Clearing House", isCorrect: false }
    ],
    explanation: "The Nigerian Exchange Group (NGX, formerly Nigerian Stock Exchange) is the principal stock exchange."
  },
  {
    text: "What role does the Central Securities Clearing System (CSCS) play in Nigeria's capital market?",
    options: [
      { text: "Setting benchmark interest rates", isCorrect: false },
      { text: "Clearing, settlement, and electronic depository for securities transactions", isCorrect: true },
      { text: "Auditing corporate annual tax returns", isCorrect: false },
      { text: "Printing physical paper share certificates", isCorrect: false }
    ],
    explanation: "CSCS acts as the central depository and handles electronic clearing and settlement of trades."
  },
  {
    text: "What is the standard settlement cycle for stock transactions on the Nigerian stock market?",
    options: [
      { text: "T+0 (Same day)", isCorrect: false },
      { text: "T+3 (Trade day plus 3 working days)", isCorrect: true },
      { text: "T+14 (Two weeks)", isCorrect: false },
      { text: "T+30 (One month)", isCorrect: false }
    ],
    explanation: "The Nigerian capital market operates on a T+3 settlement cycle (Trade date + 3 transaction days)."
  },
  {
    text: "Holders of Ordinary Shares (Equities) in a public company enjoy which of the following rights?",
    options: [
      { text: "Guaranteed fixed annual interest regardless of profit", isCorrect: false },
      { text: "Voting rights at AGMs and claim to residual profits via dividends", isCorrect: true },
      { text: "Priority payout over debenture holders during liquidation", isCorrect: false },
      { text: "Exemption from all corporate financial risks", isCorrect: false }
    ],
    explanation: "Ordinary shareholders own the equity, have voting rights at AGMs, and receive variable dividends based on profits."
  },
  {
    text: "How do Preference Shares differ from Ordinary Shares?",
    options: [
      { text: "Preference shares carry full voting rights; ordinary shares do not", isCorrect: false },
      { text: "Preference shares receive fixed dividends and have priority payout over ordinary shares during liquidation", isCorrect: true },
      { text: "Preference shares are issued only by the Central Bank", isCorrect: false },
      { text: "Preference shares never pay any dividends", isCorrect: false }
    ],
    explanation: "Preference shares carry a fixed dividend rate and take precedence over ordinary shares for dividend and asset liquidation payments."
  },
  {
    text: "A 'Debenture' or 'Corporate Bond' represents:",
    options: [
      { text: "Equity ownership in a company", isCorrect: false },
      { text: "A debt instrument acknowledging a loan to a company with fixed interest and maturity", isCorrect: true },
      { text: "A short-term currency note", isCorrect: false },
      { text: "A government tax receipt", isCorrect: false }
    ],
    explanation: "Bonds/debentures are long-term debt securities issued by corporations or governments to borrow funds at specified interest rates."
  },
  {
    text: "Investors who purchase Federal Government of Nigeria (FGN) Bonds are lending money to:",
    options: [
      { text: "Private commercial banks", isCorrect: false },
      { text: "The Federal Government of Nigeria", isCorrect: true },
      { text: "Foreign multinational corporations", isCorrect: false },
      { text: "Local government councils only", isCorrect: false }
    ],
    explanation: "FGN Bonds are debt securities issued by the Debt Management Office (DMO) on behalf of the Federal Government of Nigeria."
  },
  {
    text: "Which financial professional is licensed by SEC to execute buying and selling orders of stocks on behalf of investors?",
    options: [
      { text: "Stockbroker", isCorrect: true },
      { text: "Actuary", isCorrect: false },
      { text: "Liquidator", isCorrect: false },
      { text: "Auditor-General", isCorrect: false }
    ],
    explanation: "Stockbrokers are licensed dealing members of the stock exchange authorized to trade securities for clients."
  },
  {
    text: "What is 'Capital Gain' in stock investing?",
    options: [
      { text: "The monthly salary paid to company directors", isCorrect: false },
      { text: "The profit realized when a security is sold for a price higher than its purchase price", isCorrect: true },
      { text: "The fixed interest rate paid on savings accounts", isCorrect: false },
      { text: "The tax paid on corporate profits", isCorrect: false }
    ],
    explanation: "Capital gain is the profit earned when the selling price of a stock exceeds its initial purchase price."
  },
  {
    text: "What is a 'Dividend'?",
    options: [
      { text: "A fine paid for late tax filing", isCorrect: false },
      { text: "A portion of a company's profit distributed to its shareholders", isCorrect: true },
      { text: "The principal amount repaid on a loan", isCorrect: false },
      { text: "The fee charged by stockbrokers", isCorrect: false }
    ],
    explanation: "Dividends are payments made by a corporation to its equity shareholders out of its post-tax earnings."
  },
  {
    text: "In stock market terminology, a 'Bull Market' refers to a period where:",
    options: [
      { text: "Stock prices are steadily falling and investor confidence is low", isCorrect: false },
      { text: "Stock prices are rising or expected to rise, driven by buyer optimism", isCorrect: true },
      { text: "Trading is completely suspended by regulators", isCorrect: false },
      { text: "Only agricultural commodities are traded", isCorrect: false }
    ],
    explanation: "A Bull Market is characterized by rising asset prices and widespread investor optimism."
  },
  {
    text: "Conversely, a 'Bear Market' is characterized by:",
    options: [
      { text: "Sustained decline in stock prices and widespread market pessimism", isCorrect: true },
      { text: "Rapid increases in stock values", isCorrect: false },
      { text: "Record high dividend payouts", isCorrect: false },
      { text: "Zero trading fees for all brokers", isCorrect: false }
    ],
    explanation: "A Bear Market refers to a prolonged period of declining stock prices."
  },
  {
    text: "What is 'Portfolio Diversification'?",
    options: [
      { text: "Putting all your savings into a single high-risk stock", isCorrect: false },
      { text: "Spreading investments across various asset classes (stocks, bonds, real estate) to reduce overall risk", isCorrect: true },
      { text: "Withdrawing all money and keeping cash under a mattress", isCorrect: false },
      { text: "Investing exclusively in foreign currencies", isCorrect: false }
    ],
    explanation: "Diversification reduces risk by allocating capital across different financial instruments, industries, and asset categories."
  },
  {
    text: "Which of the following is a Mutual Fund / Collective Investment Scheme?",
    options: [
      { text: "A pool of funds collected from many investors to invest in a diversified portfolio of securities managed by professionals", isCorrect: true },
      { text: "A personal emergency cash vault in a commercial bank", isCorrect: false },
      { text: "A private loan given to a family friend", isCorrect: false },
      { text: "A lottery scheme organized by state governments", isCorrect: false }
    ],
    explanation: "Mutual funds pool money from multiple investors to buy a professionally managed portfolio of stocks, bonds, or short-term debt."
  },
  {
    text: "The 5 steps of Personal Financial Planning include: Assessment, Goal Setting, Plan Creation, Execution, and:",
    options: [
      { text: "Tax Evasion", isCorrect: false },
      { text: "Monitoring and Reassessment", isCorrect: true },
      { text: "Immediate Liquidation", isCorrect: false },
      { text: "Uncontrolled Spending", isCorrect: false }
    ],
    explanation: "The 5 steps of financial planning culminate in regular monitoring and reassessment of the financial plan."
  },
  {
    text: "What type of financial asset represents ownership in real property such as land, commercial buildings, or residential apartments?",
    options: [
      { text: "Real Estate Investment", isCorrect: true },
      { text: "Treasury Bill", isCorrect: false },
      { text: "Commercial Paper", isCorrect: false },
      { text: "Banker's Acceptance", isCorrect: false }
    ],
    explanation: "Real estate investments involve purchasing land or physical structures for rental income or capital appreciation."
  },
  {
    text: "Compound interest is calculated on:",
    options: [
      { text: "Initial principal only", isCorrect: false },
      { text: "The initial principal AND accumulated interest from previous periods", isCorrect: true },
      { text: "Government tax refunds only", isCorrect: false },
      { text: "Stock market commission fees", isCorrect: false }
    ],
    explanation: "Compound interest is 'interest on interest', calculated on principal plus accumulated prior interest."
  },
  {
    text: "In financial literacy, an 'Emergency Fund' should ideally cover how many months of living expenses?",
    options: [
      { text: "1 week", isCorrect: false },
      { text: "3 to 6 months", isCorrect: true },
      { text: "5 years", isCorrect: false },
      { text: "20 years", isCorrect: false }
    ],
    explanation: "Financial experts recommend keeping 3 to 6 months of essential living expenses in an accessible emergency fund."
  },
  {
    text: "Which of the following is considered an asset with high liquidity?",
    options: [
      { text: "A piece of undeveloped land in a remote village", isCorrect: false },
      { text: "Cash in a savings account", isCorrect: true },
      { text: "A specialized heavy industrial machine", isCorrect: false },
      { text: "Unquoted private company shares", isCorrect: false }
    ],
    explanation: "Liquidity measures how quickly an asset can be converted into cash without loss of value. Cash is the most liquid asset."
  },
  {
    text: "What is the function of an 'Underwriter' in a public share offering?",
    options: [
      { text: "To print the financial prospectus", isCorrect: false },
      { text: "To guarantee to buy any unsubscribed shares in a public offer for an agreed fee", isCorrect: true },
      { text: "To audit company tax returns", isCorrect: false },
      { text: "To enforce labor union compliance", isCorrect: false }
    ],
    explanation: "Underwriters agree to purchase remaining unsold shares in a public issue to ensure the issuer raises the targeted capital."
  },
  {
    text: "What risk arises when inflation erodes the purchasing power of investment returns over time?",
    options: [
      { text: "Credit Risk", isCorrect: false },
      { text: "Inflation / Purchasing Power Risk", isCorrect: true },
      { text: "Liquidity Risk", isCorrect: false },
      { text: "Foreign Exchange Risk", isCorrect: false }
    ],
    explanation: "Inflation risk is the risk that price inflation will lower the real value of investment returns."
  },
  {
    text: "The document issued by a company inviting the public to subscribe for its shares or bonds is called a:",
    options: [
      { text: "Prospectus", isCorrect: true },
      { text: "Waybill", isCorrect: false },
      { text: "Certificate of Occupancy", isCorrect: false },
      { text: "Bill of Lading", isCorrect: false }
    ],
    explanation: "A Prospectus is a formal legal document providing full details about an investment offering for the public."
  },
  {
    text: "In Nigeria, statutory tax relief on housing allowances for individuals residing in state capitals is capped at what percentage of basic salary under tax guidelines?",
    options: [
      { text: "5%", isCorrect: false },
      { text: "10%", isCorrect: false },
      { text: "28%", isCorrect: true },
      { text: "50%", isCorrect: false }
    ],
    explanation: "Tax guidelines provide specific housing tax relief allowances (e.g. 28% of basic salary in state capitals/Lagos)."
  },
  {
    text: "What type of financial return is paid to debenture holders?",
    options: [
      { text: "Variable dividends", isCorrect: false },
      { text: "Fixed interest", isCorrect: true },
      { text: "Royalty bonuses", isCorrect: false },
      { text: "Capital gains tax", isCorrect: false }
    ],
    explanation: "Debenture holders are creditors of the firm and receive fixed interest payments regardless of company profit level."
  },
  {
    text: "Which market institution acts as an intermediary rating the creditworthiness of corporate bond issuers?",
    options: [
      { text: "Credit Rating Agency (e.g. Agusto & Co, DataPro)", isCorrect: true },
      { text: "Central Securities Clearing System (CSCS)", isCorrect: false },
      { text: "Registrar of Companies", isCorrect: false },
      { text: "Stockbroking Firm", isCorrect: false }
    ],
    explanation: "Credit Rating Agencies evaluate the credit risk and default probability of debt issuers and their instruments."
  },
  {
    text: "If an investor buys 1,000 shares of XYZ PLC at N10 per share and sells them later at N25 per share, what is the capital gain?",
    options: [
      { text: "N10,000", isCorrect: false },
      { text: "N15,000", isCorrect: true },
      { text: "N25,000", isCorrect: false },
      { text: "N35,000", isCorrect: false }
    ],
    explanation: "Profit per share = N25 - N10 = N15. Total capital gain = 1,000 shares * N15 = N15,000."
  },
  {
    text: "What is an 'Index' on a stock exchange (such as the NGX All-Share Index)?",
    options: [
      { text: "A list of delinquent brokers", isCorrect: false },
      { text: "A statistical benchmark reflecting the overall performance and price movements of listed stocks", isCorrect: true },
      { text: "The total tax revenue collected by SEC", isCorrect: false },
      { text: "A government interest rate ceiling", isCorrect: false }
    ],
    explanation: "A stock market index measures the aggregate price performance of a representative group of listed equities."
  },
  {
    text: "Which of the following is considered a Low-Risk, Low-Return investment instrument?",
    options: [
      { text: "Start-up tech venture equity", isCorrect: false },
      { text: "Nigerian Treasury Bills (T-Bills)", isCorrect: true },
      { text: "Cryptocurrency tokens", isCorrect: false },
      { text: "Speculative penny stocks", isCorrect: false }
    ],
    explanation: "Treasury Bills are backed by the full faith and credit of the sovereign government, making them virtually risk-free."
  },
  {
    text: "Corporate governance in public listed companies ensures:",
    options: [
      { text: "Management acts in the best interest of shareholders and transparently reports financial status", isCorrect: true },
      { text: "Directors can spend company funds without accounting to anyone", isCorrect: false },
      { text: "Shareholders are barred from attending annual general meetings", isCorrect: false },
      { text: "Taxes are completely eliminated", isCorrect: false }
    ],
    explanation: "Corporate governance rules promote transparency, accountability, and protection of shareholder rights."
  },
  {
    text: "What is 'Yield' in bond investment?",
    options: [
      { text: "The physical weight of the bond certificate", isCorrect: false },
      { text: "The percentage rate of return earned on the bond relative to its price", isCorrect: true },
      { text: "The fee paid to the stockbroker", isCorrect: false },
      { text: "The total penalty for early withdrawal", isCorrect: false }
    ],
    explanation: "Bond yield reflects the annual interest income returned on an investment expressed as a percentage of the bond's market price."
  },
  {
    text: "Which type of bank deposit account typically restricts immediate withdrawals but pays higher interest rates?",
    options: [
      { text: "Current Account", isCorrect: false },
      { text: "Fixed / Time Deposit Account", isCorrect: true },
      { text: "Call Money Account", isCorrect: false },
      { text: "Automated Teller Account", isCorrect: false }
    ],
    explanation: "Fixed/Term deposit accounts lock funds for a specific tenure (e.g. 30, 90, 365 days) in exchange for higher interest rates."
  },
  {
    text: "The primary purpose of an Annual General Meeting (AGM) for a public company is to:",
    options: [
      { text: "Present financial accounts, elect directors, declare dividends, and engage shareholders", isCorrect: true },
      { text: "Sell products directly to retail consumers at discounted prices", isCorrect: false },
      { text: "Hire junior office clerks", isCorrect: false },
      { text: "Negotiate raw material prices with suppliers", isCorrect: false }
    ],
    explanation: "At the AGM, company leadership presents audited results, reports to shareholders, votes on board members and dividend approvals."
  },
  {
    text: "What is a 'Rights Issue' in capital market operations?",
    options: [
      { text: "An offering of new shares to existing shareholders in proportion to their current holdings at a special price", isCorrect: true },
      { text: "A public ban on trading company shares", isCorrect: false },
      { text: "A legal suit filed by workers against management", isCorrect: false },
      { text: "A government takeover of a private firm", isCorrect: false }
    ],
    explanation: "A Rights Issue gives existing shareholders the pre-emptive right to buy additional new shares before they are offered to the public."
  },
  {
    text: "What is the primary role of a 'Registrar' in the stock market?",
    options: [
      { text: "Maintaining the official register of shareholders, issuing share certificates/statements, and dispatching dividend warrants", isCorrect: true },
      { text: "Determining the national minimum wage", isCorrect: false },
      { text: "Managing corporate tax collections", isCorrect: false },
      { text: "Trading currencies on the forex market", isCorrect: false }
    ],
    explanation: "Registrars keep ownership records of company securities, handle transfers, and manage dividend payments."
  },
  {
    text: "In financial budgeting, the '50/30/20 Rule' suggests allocating income into:",
    options: [
      { text: "50% Needs, 30% Wants, 20% Savings/Debt Repayment", isCorrect: true },
      { text: "50% Gambling, 30% Rent, 20% Tax", isCorrect: false },
      { text: "50% Food, 30% Clothes, 20% Parties", isCorrect: false },
      { text: "50% Savings, 30% Investments, 20% Luxury", isCorrect: false }
    ],
    explanation: "The 50/30/20 budgeting rule splits net income into 50% essential needs, 30% discretionary wants, and 20% savings/financial goals."
  },
  {
    text: "What is 'Inflation'?",
    options: [
      { text: "A continuous rise in the general price level of goods and services over time", isCorrect: true },
      { text: "A sudden drop in total population", isCorrect: false },
      { text: "An increase in bank interest rates", isCorrect: false },
      { text: "A decrease in corporate taxes", isCorrect: false }
    ],
    explanation: "Inflation represents the sustained rate at which the general level of prices for goods and services rises, eroding purchasing power."
  },
  {
    text: "Which capital market participant acts as a neutral party holding assets or funds on behalf of bondholders?",
    options: [
      { text: "Trustee", isCorrect: true },
      { text: "Market Maker", isCorrect: false },
      { text: "Jobber", isCorrect: false },
      { text: "Speculator", isCorrect: false }
    ],
    explanation: "Trustees protect bondholders' interests and enforce the terms of the trust deed against the issuing entity."
  },
  {
    text: "Which of the following describes 'Capital Preservation' as an investment objective?",
    options: [
      { text: "Protecting the initial principal amount from nominal loss above all else", isCorrect: true },
      { text: "Maximizing short-term speculative profits at high risk", isCorrect: false },
      { text: "Investing 100% in penny stocks", isCorrect: false },
      { text: "Borrowing heavily to purchase high-risk assets", isCorrect: false }
    ],
    explanation: "Capital preservation strategies prioritize preventing financial loss over seeking aggressive returns."
  },
  {
    text: "In Nigeria, Treasury Bills are issued by the CBN on behalf of the Federal Government in tenors of:",
    options: [
      { text: "91 days, 182 days, and 364 days", isCorrect: true },
      { text: "5 years, 10 years, and 20 years", isCorrect: false },
      { text: "1 day, 2 days, and 3 days", isCorrect: false },
      { text: "50 years only", isCorrect: false }
    ],
    explanation: "Nigerian Treasury Bills are issued for standard tenors of 91 days (3 months), 182 days (6 months), and 364 days (1 year)."
  },
  {
    text: "What does 'Portfolio' mean in finance?",
    options: [
      { text: "A leather bag used to carry official paper files", isCorrect: false },
      { text: "A collection of financial investments like stocks, bonds, commodities, cash, and funds held by an investor", isCorrect: true },
      { text: "A list of company employee names", isCorrect: false },
      { text: "A government tax receipt ledger", isCorrect: false }
    ],
    explanation: "A financial portfolio is the combined collection of investment assets owned by an individual or institution."
  },

  // ==========================================
  // TOPIC 3: LIFE SKILLS NEEDED BY AN ENTREPRENEUR (101-150)
  // ==========================================
  {
    text: "Self-discipline is best described as the ability to:",
    options: [
      { text: "Take action regardless of your emotional state or feelings", isCorrect: true },
      { text: "Act only when you feel highly motivated and energetic", isCorrect: false },
      { text: "Punish employees for minor workplace mistakes", isCorrect: false },
      { text: "Avoid making any tough business decisions", isCorrect: false }
    ],
    explanation: "Self-discipline is the ability to get yourself to take action regardless of your emotional state or feelings."
  },
  {
    text: "How many primary pillars of self-discipline are detailed in the curriculum?",
    options: [
      { text: "3", isCorrect: false },
      { text: "5 (Acceptance, Willpower, Hard Work, Industry, Persistence)", isCorrect: true },
      { text: "7", isCorrect: false },
      { text: "10", isCorrect: false }
    ],
    explanation: "The 5 pillars of self-discipline are: Acceptance, Willpower, Hard Work, Industry, and Persistence (recalled by the acronym 'A WHIP')."
  },
  {
    text: "Which acronym helps students remember the 5 pillars of self-discipline?",
    options: [
      { text: "SMART", isCorrect: false },
      { text: "A WHIP (Acceptance, Willpower, Hard Work, Industry, Persistence)", isCorrect: true },
      { text: "SWOT", isCorrect: false },
      { text: "PESTEL", isCorrect: false }
    ],
    explanation: "The acronym 'A WHIP' stands for Acceptance, Willpower, Hard Work, Industry, and Persistence."
  },
  {
    text: "The first pillar of self-discipline, 'Acceptance', means:",
    options: [
      { text: "Blindly accepting defeat without trying", isCorrect: false },
      { text: "Accurately perceiving and consciously acknowledging reality and your current situation", isCorrect: true },
      { text: "Accepting bribes from business partners", isCorrect: false },
      { text: "Ignoring all personal weaknesses", isCorrect: false }
    ],
    explanation: "Acceptance means perceiving reality accurately and acknowledging where you currently stand before trying to improve."
  },
  {
    text: "Willpower' is described as which component of self-discipline?",
    options: [
      { text: "A temporary, powerful boost/thruster used to set a course of action and start", isCorrect: true },
      { text: "A long-term 20-year continuous habit", isCorrect: false },
      { text: "A passive state of waiting for luck", isCorrect: false },
      { text: "An physical muscle in the arm", isCorrect: false }
    ],
    explanation: "Willpower is like a temporary rocket thruster—it provides a short-term burst of energy to initiate action ('Engage!')."
  },
  {
    text: "How does 'Hard Work' differ from 'Industry' in the 5 pillars of self-discipline?",
    options: [
      { text: "Hard work is doing difficult challenges; Industry is working hard over a sustained period of time", isCorrect: true },
      { text: "Hard work is for employees; Industry is for government", isCorrect: false },
      { text: "Industry requires no physical effort; Hard work requires no mental effort", isCorrect: false },
      { text: "They are completely identical terms with no difference", isCorrect: false }
    ],
    explanation: "Hard Work refers to tackling heavy, difficult challenges; Industry refers to sustaining hard work over time ('press on')."
  },
  {
    text: "The 5th pillar, 'Persistence', is defined as:",
    options: [
      { text: "Giving up as soon as obstacles arise", isCorrect: false },
      { text: "The ability to maintain action regardless of feelings or initial setbacks", isCorrect: true },
      { text: "Delegating all difficult work to subordinates", isCorrect: false },
      { text: "Waiting for external inspiration before working", isCorrect: false }
    ],
    explanation: "Persistence is the ability to maintain action over time, pressing on even when motivation wanes."
  },
  {
    text: "In communication theory, what constitutes the complete communication process?",
    options: [
      { text: "Sender encoding message -> Channel -> Receiver decoding message -> Feedback to Sender", isCorrect: true },
      { text: "Sender talking continuously without listening", isCorrect: false },
      { text: "Sending an email without checking if it was delivered", isCorrect: false },
      { text: "Posting an advertisement on a bill board", isCorrect: false }
    ],
    explanation: "Communication is two-way: Sender encodes message, sends via medium/channel, Receiver decodes, and provides Feedback."
  },
  {
    text: "Which of the following is an example of Non-Verbal communication?",
    options: [
      { text: "A written business letter", isCorrect: false },
      { text: "Body language, facial expressions, eye contact, and posture", isCorrect: true },
      { text: "A spoken telephone conversation", isCorrect: false },
      { text: "A radio broadcast", isCorrect: false }
    ],
    explanation: "Non-verbal communication relies on body language, gestures, posture, facial expressions, and eye contact."
  },
  {
    text: "Paralanguage' in non-verbal communication refers to:",
    options: [
      { text: "The foreign language spoken in computer programming", isCorrect: false },
      { text: "Vocal tone, pitch, volume, speed, and emphasis accompanying spoken words", isCorrect: true },
      { text: "Sign language used by the deaf", isCorrect: false },
      { text: "Written symbols on ancient monuments", isCorrect: false }
    ],
    explanation: "Paralanguage includes vocal nuances such as tone of voice, pitch, loudness, and speech rate that modify meaning."
  },
  {
    text: "Which active listening practice is essential for effective communication?",
    options: [
      { text: "Planning your response while the other person is still speaking", isCorrect: false },
      { text: "Paraphrasing and summarizing what the speaker said to confirm understanding", isCorrect: true },
      { text: "Interrupting frequently to state your opinion", isCorrect: false },
      { text: "Distracting yourself with your phone during a briefing", isCorrect: false }
    ],
    explanation: "Active listening requires focusing completely on the speaker, avoiding interruptions, and summarizing to confirm understanding."
  },
  {
    text: "According to management authority Peter Drucker, the primary role of a Leader is to:",
    options: [
      { text: "Do things right (efficiency and control)", isCorrect: false },
      { text: "Do the right things (vision, direction, and purpose)", isCorrect: true },
      { text: "Maintain status quo at all costs", isCorrect: false },
      { text: "Focus purely on daily paperwork", isCorrect: false }
    ],
    explanation: "Drucker famously stated: 'Management is doing things right; leadership is doing the right things.'"
  },
  {
    text: "What is a major distinction between a Manager and a Leader?",
    options: [
      { text: "Managers administer and maintain; Leaders innovate and inspire", isCorrect: true },
      { text: "Managers have vision; Leaders only focus on budgets", isCorrect: false },
      { text: "Leaders control; Managers challenge the status quo", isCorrect: false },
      { text: "Managers work for free; Leaders earn salaries", isCorrect: false }
    ],
    explanation: "Managers focus on structure, administration, and control; Leaders focus on people, innovation, and long-term vision."
  },
  {
    text: "According to John C. Maxwell's '17 Indisputable Laws of Teamwork', what does the 'Law of Significance' state?",
    options: [
      { text: "One is too small a number to achieve greatness", isCorrect: true },
      { text: "Money is the only thing that matters in a business", isCorrect: false },
      { text: "The leader must do all the work alone", isCorrect: false },
      { text: "Significance is measured by total bank balance", isCorrect: false }
    ],
    explanation: "The Law of Significance states: 'One is too small a number to achieve greatness'—no one can build anything of significance alone."
  },
  {
    text: "What does John Maxwell's 'Law of the Big Picture' emphasize?",
    options: [
      { text: "Individual roles are more important than team goals", isCorrect: false },
      { text: "The goal is more important than the role", isCorrect: true },
      { text: "Every team member must take photographs", isCorrect: false },
      { text: "Only the CEO should see the company plans", isCorrect: false }
    ],
    explanation: "The Law of the Big Picture states that members must see the team's overarching vision: 'The goal is more important than the role.'"
  },
  {
    text: "Which law of teamwork states that 'All players have a place where they add the most value'?",
    options: [
      { text: "Law of the Niche", isCorrect: true },
      { text: "Law of the Chain", isCorrect: false },
      { text: "Law of the Bench", isCorrect: false },
      { text: "Law of the Price Tag", isCorrect: false }
    ],
    explanation: "The Law of the Niche states that maximum value is achieved when team members work in their areas of strength."
  },
  {
    text: "What does the 'Law of Mount Everest' teach about teamwork?",
    options: [
      { text: "Teams should go mountain climbing every year", isCorrect: false },
      { text: "As the challenge escalates, the need for teamwork elevates", isCorrect: true },
      { text: "High goals require fewer team members", isCorrect: false },
      { text: "Only foreign experts can handle big projects", isCorrect: false }
    ],
    explanation: "The Law of Mount Everest states: 'As the challenge escalates, the need for teamwork elevates.'"
  },
  {
    text: "The 'Law of the Chain' warns that:",
    options: [
      { text: "A team is only as strong as its weakest link", isCorrect: true },
      { text: "Chains must be used to lock office doors", isCorrect: false },
      { text: "Every worker must be chained to their desk", isCorrect: false },
      { text: "Strong leaders make weak teams", isCorrect: false }
    ],
    explanation: "The Law of the Chain asserts: 'The strength of the team is impacted by its weakest link.'"
  },
  {
    text: "According to Maxwell, what describes a 'Catalyst' on a team (Law of the Catalyst)?",
    options: [
      { text: "A person who creates conflict and leaves", isCorrect: false },
      { text: "Winning teams have players who make things happen and stir action", isCorrect: true },
      { text: "A chemical compound used in factories", isCorrect: false },
      { text: "A passive observer during meetings", isCorrect: false }
    ],
    explanation: "The Law of the Catalyst states that winning teams have self-motivated catalysts who initiate action and drive success."
  },
  {
    text: "The 'Law of the Compass' states that:",
    options: [
      { text: "Vision gives team members direction and confidence", isCorrect: true },
      { text: "Teams must always travel North", isCorrect: false },
      { text: "Leaders should never change directions", isCorrect: false },
      { text: "Rules must replace vision", isCorrect: false }
    ],
    explanation: "The Law of the Compass teaches that a clear vision provides direction and alignment for the entire team."
  },
  {
    text: "What effect does a bad attitude have on a team according to the 'Law of the Bad Apple'?",
    options: [
      { text: "It improves performance through competition", isCorrect: false },
      { text: "Rotten attitudes ruin a team faster than lack of skill", isCorrect: true },
      { text: "It has no effect on other team members", isCorrect: false },
      { text: "It automatically increases company profits", isCorrect: false }
    ],
    explanation: "The Law of the Bad Apple states: 'Rotten attitudes ruin a team.' Attitude spreads faster than talent."
  },
  {
    text: "What is the core message of the 'Law of Countability'?",
    options: [
      { text: "Teammates must count company cash every day", isCorrect: false },
      { text: "Teammates must be able to count on each other when it counts (reliability)", isCorrect: true },
      { text: "Only accounting staff matter in a business", isCorrect: false },
      { text: "Countability means keeping secret records", isCorrect: false }
    ],
    explanation: "The Law of Countability means team members can depend on each other with complete trust and reliability."
  },
  {
    text: "According to the 'Law of the Price Tag':",
    options: [
      { text: "Everything in an office must have a price sticker", isCorrect: false },
      { text: "The team fails to reach its potential when members fail to pay the price of sacrifice and commitment", isCorrect: true },
      { text: "High prices guarantee good products", isCorrect: false },
      { text: "Success comes completely free without sacrifice", isCorrect: false }
    ],
    explanation: "The Law of the Price Tag emphasizes that team success requires sacrifice, hard work, and continuous investment."
  },
  {
    text: "The 'Law of the Scoreboard' highlights that:",
    options: [
      { text: "The team can make vital adjustments only when it knows where it stands (measuring performance)", isCorrect: true },
      { text: "Scoreboards are used only in football stadiums", isCorrect: false },
      { text: "Tracking progress wastes productive time", isCorrect: false },
      { text: "Scoreboards should be kept secret from workers", isCorrect: false }
    ],
    explanation: "The Law of the Scoreboard states that tracking metrics allows the team to evaluate progress and make tactical adjustments."
  },
  {
    text: "What does the 'Law of the Bench' emphasize?",
    options: [
      { text: "Great teams have great depth (qualified reserves and support personnel)", isCorrect: true },
      { text: "Offices should buy wooden benches for staff", isCorrect: false },
      { text: "Only starters should be trained", isCorrect: false },
      { text: "Substitute workers are unnecessary", isCorrect: false }
    ],
    explanation: "The Law of the Bench stresses that building depth in talent ensures sustainability when key members step down or transition."
  },
  {
    text: "What defines a team's culture according to the 'Law of Identity'?",
    options: [
      { text: "Shared values and core beliefs define the team", isCorrect: true },
      { text: "The color of their official uniform", isCorrect: false },
      { text: "The city where the headquarters is located", isCorrect: false },
      { text: "The brand of computers they use", isCorrect: false }
    ],
    explanation: "The Law of Identity teaches that shared core values form the foundation and identity of a high-performing team."
  },
  {
    text: "The 'Law of Communication' asserts that:",
    options: [
      { text: "Interaction fuels action; open communication is vital for team execution", isCorrect: true },
      { text: "Team members should speak only when spoken to by the boss", isCorrect: false },
      { text: "Silent assumptions are better than verbal meetings", isCorrect: false },
      { text: "Communication should happen only once a year", isCorrect: false }
    ],
    explanation: "The Law of Communication states: 'Interaction fuels action.' Clear dialogue drives team alignment and execution."
  },
  {
    text: "According to the 'Law of the Edge', what provides the ultimate margin of victory between two equally talented teams?",
    options: [
      { text: "Better physical office furniture", isCorrect: false },
      { text: "Leadership", isCorrect: true },
      { text: "Luck", isCorrect: false },
      { text: "Larger bank loans", isCorrect: false }
    ],
    explanation: "The Law of the Edge states: 'The difference between two equally talented teams is leadership.'"
  },
  {
    text: "What phenomenon is described by the 'Law of High Morale'?",
    options: [
      { text: "When you're winning, nothing hurts; high morale elevates performance and solves many minor issues", isCorrect: true },
      { text: "Morale has no relationship with output", isCorrect: false },
      { text: "High morale causes laziness", isCorrect: false },
      { text: "Winning causes teams to break up immediately", isCorrect: false }
    ],
    explanation: "The Law of High Morale states that high morale acts as a catalyst that makes challenges easier to overcome."
  },
  {
    text: "The 'Law of Dividends' states that:",
    options: [
      { text: "Investing in the team compounds over time, yielding massive long-term benefits", isCorrect: true },
      { text: "Dividends must be paid to shareholders every Monday", isCorrect: false },
      { text: "Training staff is a wasteful expenditure", isCorrect: false },
      { text: "Team investments yield zero returns", isCorrect: false }
    ],
    explanation: "The Law of Dividends emphasizes that investing in team development pays exponential compound dividends in the long run."
  },
  {
    text: "What is the recommended size for an effective core 'Dream Team' in business?",
    options: [
      { text: "1 person working alone", isCorrect: false },
      { text: "Between 3 to 10 people with complementary skills", isCorrect: true },
      { text: "At least 100 people", isCorrect: false },
      { text: "Exactly 50 managers", isCorrect: false }
    ],
    explanation: "Core high-performing dream teams typically consist of 3 to 10 members working closely with complementary skill sets."
  },
  {
    text: "Cross-functional teams are composed of:",
    options: [
      { text: "Individuals from different functional departments (e.g. marketing, engineering, finance) collaborating on a project", isCorrect: true },
      { text: "People from only one academic department", isCorrect: false },
      { text: "External competitors", isCorrect: false },
      { text: "Retired company directors", isCorrect: false }
    ],
    explanation: "Cross-functional teams bring together expertise from various functional areas to solve complex problems holistically."
  },
  {
    text: "Which barrier to effective communication occurs when a listener holds strong pre-existing prejudices against the speaker?",
    options: [
      { text: "Physical Noise", isCorrect: false },
      { text: "Psychological / Bias Barrier", isCorrect: true },
      { text: "Technical Failure", isCorrect: false },
      { text: "Linguistic Translation Error", isCorrect: false }
    ],
    explanation: "Personal biases and emotional prejudices act as psychological barriers that distort incoming messages."
  },
  {
    text: "In goal-setting methodology, what does the 'S' in SMART goals stand for?",
    options: [
      { text: "Specific", isCorrect: true },
      { text: "Simple", isCorrect: false },
      { text: "Slow", isCorrect: false },
      { text: "Secret", isCorrect: false }
    ],
    explanation: "SMART stands for Specific, Measurable, Achievable, Realistic, and Timely."
  },
  {
    text: "What does the 'M' in SMART goals stand for?",
    options: [
      { text: "Mandatory", isCorrect: false },
      { text: "Measurable", isCorrect: true },
      { text: "Monetary", isCorrect: false },
      { text: "Maximum", isCorrect: false }
    ],
    explanation: "Measurable ensures that progress towards the goal can be objectively tracked."
  },
  {
    text: "What does the 'A' in SMART goals represent?",
    options: [
      { text: "Achievable / Attainable", isCorrect: true },
      { text: "Aggressive", isCorrect: false },
      { text: "Automatic", isCorrect: false },
      { text: "Anonymous", isCorrect: false }
    ],
    explanation: "Achievable means the goal is realistic given current resources and capabilities."
  },
  {
    text: "What does the 'R' in SMART goals represent?",
    options: [
      { text: "Realistic / Relevant", isCorrect: true },
      { text: "Rigid", isCorrect: false },
      { text: "Random", isCorrect: false },
      { text: "Rapid", isCorrect: false }
    ],
    explanation: "Relevant/Realistic ensures the goal aligns with broader business objectives and is practically possible."
  },
  {
    text: "What does the 'T' in SMART goals stand for?",
    options: [
      { text: "Theoretical", isCorrect: false },
      { text: "Timely / Time-bound", isCorrect: true },
      { text: "Tough", isCorrect: false },
      { text: "Temporary", isCorrect: false }
    ],
    explanation: "Time-bound sets a clear deadline date by which the target must be accomplished."
  },
  {
    text: "Which life skill enables an entrepreneur to handle time efficiently and prioritize high-value tasks?",
    options: [
      { text: "Procrastination", isCorrect: false },
      { text: "Time Management & Prioritization", isCorrect: true },
      { text: "Micromanagement", isCorrect: false },
      { text: "Multi-tasking overload", isCorrect: false }
    ],
    explanation: "Effective time management helps entrepreneurs focus on high-impact strategic tasks rather than urgent trivialities."
  },
  {
    text: "What principle states that 80% of business results often come from 20% of effort/causes?",
    options: [
      { text: "Pareto Principle (80/20 Rule)", isCorrect: true },
      { text: "Murphy's Law", isCorrect: false },
      { text: "Parkinson's Law", isCorrect: false },
      { text: "Gresham's Law", isCorrect: false }
    ],
    explanation: "The Pareto Principle asserts that roughly 80% of consequences come from 20% of the causes."
  },
  {
    text: "Parkinson's Law states that:",
    options: [
      { text: "Work expands so as to fill the time available for its completion", isCorrect: true },
      { text: "Money doubles every 7 years", isCorrect: false },
      { text: "Whatever can go wrong will go wrong", isCorrect: false },
      { text: "Supply creates its own demand", isCorrect: false }
    ],
    explanation: "Parkinson's Law observes that work expands to fill the time allocated for its completion."
  },
  {
    text: "Which active listening habit hinders clear understanding during communication?",
    options: [
      { text: "Maintaining open body posture", isCorrect: false },
      { text: "Formulating counter-arguments mentally while the speaker is talking", isCorrect: true },
      { text: "Taking key notes", isCorrect: false },
      { text: "Nodding to show attention", isCorrect: false }
    ],
    explanation: "Formulating counter-arguments while listening prevents full comprehension of the speaker's actual point."
  },
  {
    text: "What term describes the emotional state of enthusiasm, commitment, and drive within a team?",
    options: [
      { text: "Team Morale", isCorrect: true },
      { text: "Bureaucracy", isCorrect: false },
      { text: "Friction", isCorrect: false },
      { text: "Attrition", isCorrect: false }
    ],
    explanation: "Team morale reflects the shared confidence, enthusiasm, and dedication of team members."
  },
  {
    text: "What is the primary role of a 'Catalyst' in Maxwell's leadership model?",
    options: [
      { text: "To slow down team activities", isCorrect: false },
      { text: "To initiate action, drive change, and inspire results", isCorrect: true },
      { text: "To enforce rigid paperwork", isCorrect: false },
      { text: "To report errors to management", isCorrect: false }
    ],
    explanation: "Catalysts are action-oriented team members who ignite energy and push projects forward."
  },
  {
    text: "Self-discipline is built progressively much like:",
    options: [
      { text: "Building a physical muscle through progressive weight training", isCorrect: true },
      { text: "Winning a cash lottery overnight", isCorrect: false },
      { text: "Inheriting a family asset", isCorrect: false },
      { text: "Reading a single comic book", isCorrect: false }
    ],
    explanation: "The curriculum compares building self-discipline to weightlifting—starting within your current limit and progressively increasing challenge."
  },
  {
    text: "Which pillar of self-discipline represents the refusal to quit even when all circumstances seem discouraging?",
    options: [
      { text: "Persistence", isCorrect: true },
      { text: "Acceptance", isCorrect: false },
      { text: "Willpower", isCorrect: false },
      { text: "Impulsiveness", isCorrect: false }
    ],
    explanation: "Persistence is the staying power to keep taking action despite discouragement or lack of immediate results."
  },
  {
    text: "Effective feedback in communication must be:",
    options: [
      { text: "Delayed by several years", isCorrect: false },
      { text: "Constructive, timely, specific, and clear", isCorrect: true },
      { text: "Vague and aggressive", isCorrect: false },
      { text: "Given only in writing via legal letters", isCorrect: false }
    ],
    explanation: "Feedback is effective when it is timely, specific, constructive, and aimed at mutual understanding."
  },
  {
    text: "Strategic Alignment in team building ensures that:",
    options: [
      { text: "All team members work towards the same overall organizational vision and objectives", isCorrect: true },
      { text: "Every worker pursues their own private goals independently", isCorrect: false },
      { text: "No meetings are ever held", isCorrect: false },
      { text: "Management changes goals every hour", isCorrect: false }
    ],
    explanation: "Strategic alignment coordinates all team efforts so they move in harmony toward organizational goals."
  },
  {
    text: "Which law of teamwork warns that rotten attitudes spread faster than skills or talent?",
    options: [
      { text: "Law of the Bad Apple", isCorrect: true },
      { text: "Law of the Scoreboard", isCorrect: false },
      { text: "Law of the Compass", isCorrect: false },
      { text: "Law of the Edge", isCorrect: false }
    ],
    explanation: "The Law of the Bad Apple teaches that negative attitudes destroy team cohesion and performance."
  },
  {
    text: "Why is self-discipline essential for entrepreneurs who lack external bosses?",
    options: [
      { text: "Because no external supervisor enforces work hours or task completion; self-direction is required", isCorrect: true },
      { text: "Because government laws require self-discipline certificates", isCorrect: false },
      { text: "Because self-discipline replaces the need for capital", isCorrect: false },
      { text: "Because banks only loan money to disciplined people", isCorrect: false }
    ],
    explanation: "Without a boss to issue commands, entrepreneurs must rely on internal self-discipline to structure their days and execute tasks."
  },

  // ==========================================
  // TOPIC 4: GOVERNMENT FINANCIAL AGENCIES & SUPPORT INSTITUTIONS (151-200)
  // ==========================================
  {
    text: "What does the acronym 'SMEDAN' stand for?",
    options: [
      { text: "Small and Medium Enterprises Development Agency of Nigeria", isCorrect: true },
      { text: "State Micro Enterprise Direct Assistance Network", isCorrect: false },
      { text: "Society for Manufacturing and Export Development in Africa and Nigeria", isCorrect: false },
      { text: "Standard Monetary Economic Development Agency of Nigeria", isCorrect: false }
    ],
    explanation: "SMEDAN stands for Small and Medium Enterprises Development Agency of Nigeria."
  },
  {
    text: "In what year was the SMEDAN Act passed to establish the agency as a 'One Stop Shop' for MSMEs in Nigeria?",
    options: [
      { text: "1960", isCorrect: false },
      { text: "1986", isCorrect: false },
      { text: "2003", isCorrect: true },
      { text: "2020", isCorrect: false }
    ],
    explanation: "SMEDAN was established by the SMEDAN Act of 2003 to facilitate the development of the MSME sector."
  },
  {
    text: "What is the main vision of SMEDAN in Nigeria?",
    options: [
      { text: "To liquidate all small businesses", isCorrect: false },
      { text: "To establish a structured and efficient micro, small and medium enterprises sector that drives sustainable economic growth", isCorrect: true },
      { text: "To collect tax revenues directly from open market traders", isCorrect: false },
      { text: "To replace all commercial banks in Nigeria", isCorrect: false }
    ],
    explanation: "SMEDAN's vision is to establish a structured and efficient MSME sector that fosters job creation and poverty reduction."
  },
  {
    text: "The Bank of Industry (BOI) emerged in October 2001 following the merger of which three former development financial institutions?",
    options: [
      { text: "NIDB, NBCI, and NERFUND", isCorrect: true },
      { text: "CBN, NDIC, and SEC", isCorrect: false },
      { text: "PBN, FEAP, and NACB", isCorrect: false },
      { text: "UBA, First Bank, and Zenith Bank", isCorrect: false }
    ],
    explanation: "BOI was created from the reconstruction of Nigerian Industrial Development Bank (NIDB), Nigerian Bank for Commerce and Industry (NBCI), and National Economic Reconstruction Fund (NERFUND)."
  },
  {
    text: "What was the initial capital base of the Bank of Industry (BOI) at its restructuring in 2001?",
    options: [
      { text: "N1 Billion", isCorrect: false },
      { text: "N10 Billion", isCorrect: false },
      { text: "N50 Billion", isCorrect: true },
      { text: "N500 Billion", isCorrect: false }
    ],
    explanation: "BOI was established with an initial capital base of N50 Billion naira."
  },
  {
    text: "What is the primary mandate of the Bank of Industry (BOI)?",
    options: [
      { text: "Providing financial assistance for industrial development, manufacturing, and processing projects", isCorrect: true },
      { text: "Issuing student scholarships for foreign universities", isCorrect: false },
      { text: "Printing currency bank notes", isCorrect: false },
      { text: "Regulating stockbrokers on the exchange", isCorrect: false }
    ],
    explanation: "BOI provides medium and long-term financial support to industrial, manufacturing, mining, and agro-processing projects."
  },
  {
    text: "The Nigerian Agricultural Cooperative and Rural Development Bank (NACRDB), now Bank of Agriculture (BOA), was formed in 2000 by merging:",
    options: [
      { text: "People's Bank of Nigeria (PBN), FEAP, and NACB", isCorrect: true },
      { text: "NIDB, NBCI, and NERFUND", isCorrect: false },
      { text: "SEC, NGX, and CSCS", isCorrect: false },
      { text: "SMEDAN, NIPC, and NEPC", isCorrect: false }
    ],
    explanation: "NACRDB (BOA) was formed by merging People's Bank of Nigeria (PBN), Family Economic Advancement Programme (FEAP), and Nigerian Agricultural and Cooperative Bank (NACB)."
  },
  {
    text: "What is the equity ownership breakdown of the Bank of Agriculture (NACRDB)?",
    options: [
      { text: "Federal Ministry of Finance (60%) and Central Bank of Nigeria (40%)", isCorrect: true },
      { text: "Private investors (100%)", isCorrect: false },
      { text: "World Bank (50%) and IMF (50%)", isCorrect: false },
      { text: "State Governments (100%)", isCorrect: false }
    ],
    explanation: "NACRDB ownership is held 60% by the Federal Ministry of Finance Incorporated and 40% by the Central Bank of Nigeria."
  },
  {
    text: "What is the main target group for NACRDB / Bank of Agriculture loans?",
    options: [
      { text: "Farmers, agricultural enterprises, rural micro-entrepreneurs, and cooperative societies", isCorrect: true },
      { text: "Heavy petroleum refining conglomerates", isCorrect: false },
      { text: "Foreign airline operators", isCorrect: false },
      { text: "Urban luxury real estate developers", isCorrect: false }
    ],
    explanation: "NACRDB/BOA focuses on agricultural production, processing, livestock, and rural micro-finance."
  },
  {
    text: "Which federal agency was established by Decree No. 16 of 1995 to encourage, promote, and coordinate investments in the Nigerian economy?",
    options: [
      { text: "NIPC (Nigerian Investment Promotion Commission)", isCorrect: true },
      { text: "SON (Standards Organisation of Nigeria)", isCorrect: false },
      { text: "NAFDAC", isCorrect: false },
      { text: "EFCC", isCorrect: false }
    ],
    explanation: "NIPC was established by Decree 16 of 1995 to promote and coordinate domestic and foreign investments in Nigeria."
  },
  {
    text: "What does RMRDC stand for?",
    options: [
      { text: "Raw Materials Research and Development Council", isCorrect: true },
      { text: "Rural Mining Resource Development Commission", isCorrect: false },
      { text: "Regional Manufacturing Reform and Development Centre", isCorrect: false },
      { text: "Royal Merchant Risk Development Council", isCorrect: false }
    ],
    explanation: "RMRDC stands for Raw Materials Research and Development Council."
  },
  {
    text: "In what year was RMRDC established by Decree No. 39?",
    options: [
      { text: "1960", isCorrect: false },
      { text: "1987 (commenced operational work in Feb 1988)", isCorrect: true },
      { text: "1999", isCorrect: false },
      { text: "2015", isCorrect: false }
    ],
    explanation: "RMRDC was established by Decree No. 39 of 1987 following a national workshop by MAN."
  },
  {
    text: "The primary mandate of RMRDC is to:",
    options: [
      { text: "Promote local raw material sourcing, research, development, and utilization by industries in Nigeria", isCorrect: true },
      { text: "Export unprocessed raw food items to Europe", isCorrect: false },
      { text: "Collect import tariffs at sea ports", isCorrect: false },
      { text: "Manage local transport buses", isCorrect: false }
    ],
    explanation: "RMRDC supports research and industrial utilization of local raw materials to substitute imported inputs."
  },
  {
    text: "What does the Nigerian Export Promotion Council (NEPC) focus on promoting?",
    options: [
      { text: "Crude oil exports only", isCorrect: false },
      { text: "Non-oil exports to diversify Nigeria's foreign exchange earnings", isCorrect: true },
      { text: "Importation of secondhand automobiles", isCorrect: false },
      { text: "Domestic retail markets only", isCorrect: false }
    ],
    explanation: "NEPC was established to spearhead the development and promotion of non-oil exports."
  },
  {
    text: "Industrial Development Centers (IDCs) were established in Nigeria to provide:",
    options: [
      { text: "Technical support, extension services, management training, and machinery layout assistance to small scale industries", isCorrect: true },
      { text: "Passports and travel visas", isCorrect: false },
      { text: "Military training for security guards", isCorrect: false },
      { text: "Free internet cafes for university students", isCorrect: false }
    ],
    explanation: "IDCs provide technical, managerial, and advisory extension services to small-scale industrial entrepreneurs."
  },
  {
    text: "Where was the very first Industrial Development Center (IDC) established in Nigeria in 1962?",
    options: [
      { text: "Owerri", isCorrect: true },
      { text: "Lagos", isCorrect: false },
      { text: "Kano", isCorrect: false },
      { text: "Ibadan", isCorrect: false }
    ],
    explanation: "The first IDC was established in Owerri in 1962 by the former Eastern Nigeria government."
  },
  {
    text: "When did the Federal Government of Nigeria take over all regional IDCs to expand them nationwide?",
    options: [
      { text: "1970", isCorrect: true },
      { text: "1980", isCorrect: false },
      { text: "1995", isCorrect: false },
      { text: "2010", isCorrect: false }
    ],
    explanation: "The Federal Government took over IDCs in 1970 to create a coordinated national industrial support network."
  },
  {
    text: "What is the purpose of Technology Business Incubation Centers (TBICs)?",
    options: [
      { text: "To nurture technology-based start-ups, assist in commercializing R&D, and provide shared facilities and mentoring", isCorrect: true },
      { text: "To incubate agricultural poultry eggs", isCorrect: false },
      { text: "To manufacture plastic household goods", isCorrect: false },
      { text: "To inspect hospital hygiene", isCorrect: false }
    ],
    explanation: "TBICs nurture tech entrepreneurs by offering office space, technology access, mentoring, and commercialization support."
  },
  {
    text: "Which scheme, introduced by the Bankers' Committee in 1999/2001, required commercial banks to set aside 10% of their Profit After Tax (PAT) for SME equity investment?",
    options: [
      { text: "SMEIES (Small and Medium Industries Equity Investment Scheme)", isCorrect: true },
      { text: "NEPZA", isCorrect: false },
      { text: "YOUWIN", isCorrect: false },
      { text: "N-POWER", isCorrect: false }
    ],
    explanation: "SMEIES mandated participating commercial banks to invest 10% of their PAT into equity of small and medium enterprises."
  },
  {
    text: "Under SMEIES guidelines, bank funding to SMEs was provided in the form of:",
    options: [
      { text: "Equity investment (ownership stake) rather than high-interest debt loans", isCorrect: true },
      { text: "High-interest short-term microcredit", isCorrect: false },
      { text: "Unconditional free cash grants", isCorrect: false },
      { text: "Foreign exchange futures contracts", isCorrect: false }
    ],
    explanation: "SMEIES aimed to relieve SMEs of debt burden by providing equity financing, managerial, and technical support."
  },
  {
    text: "Which agency serves as the secretariat for national policy development on MSMEs in Nigeria?",
    options: [
      { text: "SMEDAN", isCorrect: true },
      { text: "Customs Service", isCorrect: false },
      { text: "Immigration Service", isCorrect: false },
      { text: "Nigerian Port Authority", isCorrect: false }
    ],
    explanation: "SMEDAN formulates policy recommendations and coordinates MSME development across federal and state levels."
  },
  {
    text: "What does 'BSCs' stand for in SMEDAN's support infrastructure?",
    options: [
      { text: "Business Support Centers", isCorrect: true },
      { text: "Bank Savings Certificates", isCorrect: false },
      { text: "Basic Science Colleges", isCorrect: false },
      { text: "Bureau of Securities Control", isCorrect: false }
    ],
    explanation: "SMEDAN established Business Support Centers (BSCs) to provide advisory and information services to entrepreneurs at local levels."
  },
  {
    text: "What does 'IPs' stand for in industrial infrastructure setup?",
    options: [
      { text: "Industrial Parks", isCorrect: true },
      { text: "Internet Protocols", isCorrect: false },
      { text: "Import Permits", isCorrect: false },
      { text: "Initial Payments", isCorrect: false }
    ],
    explanation: "Industrial Parks (IPs) provide dedicated industrial land equipped with power, water, roads, and security for manufacturing SMEs."
  },
  {
    text: "Which regulatory body certifies the safety and quality standards of food, drugs, and chemicals produced by Nigerian entrepreneurs?",
    options: [
      { text: "NAFDAC (National Agency for Food and Drug Administration and Control)", isCorrect: true },
      { text: "SON", isCorrect: false },
      { text: "NEPC", isCorrect: false },
      { text: "CAC", isCorrect: false }
    ],
    explanation: "NAFDAC regulates and controls the manufacture, importation, exportation, distribution, and sale of food, drugs, cosmetics, and medical devices."
  },
  {
    text: "Which body sets general industrial standards and quality benchmarks for manufactured goods in Nigeria?",
    options: [
      { text: "SON (Standards Organisation of Nigeria)", isCorrect: true },
      { text: "SEC", isCorrect: false },
      { text: "NIPC", isCorrect: false },
      { text: "BOI", isCorrect: false }
    ],
    explanation: "SON prepares standards for products, industrial materials, and processes, enforcing quality certification (NIS)."
  },
  {
    text: "The Corporate Affairs Commission (CAC) was established under which Nigerian legislation?",
    options: [
      { text: "Companies and Allied Matters Act (CAMA) 1990", isCorrect: true },
      { text: "Central Bank of Nigeria Act 1958", isCorrect: false },
      { text: "Labor Act 1974", isCorrect: false },
      { text: "Insurance Act 2003", isCorrect: false }
    ],
    explanation: "CAC was established by the Companies and Allied Matters Act (CAMA) 1990 to regulate the formation and management of companies."
  },
  {
    text: "Which government agency is responsible for issuing tax identification numbers (TIN) and collecting federal corporate income tax?",
    options: [
      { text: "FIRS (Federal Inland Revenue Service)", isCorrect: true },
      { text: "CBN", isCorrect: false },
      { text: "SMEDAN", isCorrect: false },
      { text: "RMRDC", isCorrect: false }
    ],
    explanation: "FIRS assesses, collects, and accounts for federal taxes including Company Income Tax (CIT) and Value Added Tax (VAT)."
  },
  {
    text: "What major service do Business Development Services (BDS) providers offer to SMEs?",
    options: [
      { text: "Training, business plan preparation, market research, accounting setup, and consultancy", isCorrect: true },
      { text: "Free machinery donation", isCorrect: false },
      { text: "Diplomatic immunity", isCorrect: false },
      { text: "Direct tax exemption certificates", isCorrect: false }
    ],
    explanation: "BDS providers offer non-financial support services such as training, counseling, marketing, and business planning."
  },
  {
    text: "Which acronym describes the industrial cluster scheme where small firms share common facilities to lower operational costs?",
    options: [
      { text: "Industrial Clusters / Incubators", isCorrect: true },
      { text: "Monopoly Zones", isCorrect: false },
      { text: "Cartel Units", isCorrect: false },
      { text: "Offshore Havens", isCorrect: false }
    ],
    explanation: "Industrial Clusters allow SMEs in similar sectors to share infrastructure, reduce overheads, and benefit from agglomeration."
  },
  {
    text: "What is the primary role of the Nigerian Export-Import Bank (NEXIM)?",
    options: [
      { text: "Providing export credit insurance, export financing, and guarantee services to non-oil exporters", isCorrect: true },
      { text: "Financing personal residential mortgages only", isCorrect: false },
      { text: "Regulating primary schools", isCorrect: false },
      { text: "Collecting municipal garbage fees", isCorrect: false }
    ],
    explanation: "NEXIM Bank provides export credit facilities, risk guarantees, and trade information to expand Nigeria's non-oil export trade."
  },
  {
    text: "Under BOI funding guidelines, eligible projects must demonstrate:",
    options: [
      { text: "Financial viability, commercial feasibility, high local content usage, and job creation potential", isCorrect: true },
      { text: "100% reliance on foreign imported raw materials", isCorrect: false },
      { text: "Zero economic impact", isCorrect: false },
      { text: "Exclusive focus on speculative stock trading", isCorrect: false }
    ],
    explanation: "BOI prioritizes projects that utilize local raw materials, generate employment, and possess clear commercial viability."
  },
  {
    text: "Which agency operates under the Federal Ministry of Science, Technology and Innovation to promote technology incubators?",
    options: [
      { text: "NBTI (National Board for Technology Incubation)", isCorrect: true },
      { text: "NUC", isCorrect: false },
      { text: "NBTE", isCorrect: false },
      { text: "JAMB", isCorrect: false }
    ],
    explanation: "NBTI supervises and coordinates Technology Business Incubators (TBICs) across Nigeria."
  },
  {
    text: "What is the main objective of the National Economic Reconstruction Fund (NERFUND) before its merger into BOI?",
    options: [
      { text: "Providing medium to long-term real-sector loans in local and foreign currencies to manufacturing SMEs", isCorrect: true },
      { text: "Funding political election campaigns", isCorrect: false },
      { text: "Building federal highways", isCorrect: false },
      { text: "Providing free housing to civil servants", isCorrect: false }
    ],
    explanation: "NERFUND was established to provide long-term micro/SME financing for industrial production."
  },
  {
    text: "Which financial support scheme was designed to assist young university/polytechnic graduates with seed capital for business start-ups?",
    options: [
      { text: "NYSC Foundation / Youth Entrepreneurship Support (YES) Programme", isCorrect: true },
      { text: "Paris Club Debt Relief", isCorrect: false },
      { text: "Anchor Borrowers' Programme for big rice mills only", isCorrect: false },
      { text: "Sovereign Wealth Pension Fund", isCorrect: false }
    ],
    explanation: "YES-P and youth entrepreneurship initiatives target tertiary graduates with entrepreneurship training and seed funding."
  },
  {
    text: "What is the benefit of registering a business name or private limited company with the Corporate Affairs Commission (CAC)?",
    options: [
      { text: "It confers legal personality, name protection, corporate credibility, and access to bank credit", isCorrect: true },
      { text: "It guarantees that the business will never make a loss", isCorrect: false },
      { text: "It exempts the business from all electricity bills", isCorrect: false },
      { text: "It automatically grants government contracts without bidding", isCorrect: false }
    ],
    explanation: "Registration with CAC gives an enterprise legal status, protects its business name, and facilitates formal banking/funding access."
  },
  {
    text: "Which institution establishes national policy guidelines for microfinance banks (MFBs) in Nigeria?",
    options: [
      { text: "Central Bank of Nigeria (CBN)", isCorrect: true },
      { text: "Ministry of Works", isCorrect: false },
      { text: "Manufacturers Association of Nigeria (MAN)", isCorrect: false },
      { text: "National Union of Road Transport Workers (NURTW)", isCorrect: false }
    ],
    explanation: "The CBN licenses, regulates, and supervises Microfinance Banks (MFBs) under the Microfinance Policy Framework."
  },
  {
    text: "What is the primary role of Microfinance Banks (MFBs) in Nigeria's financial ecosystem?",
    options: [
      { text: "Providing financial services (micro-loans, savings, insurance) to low-income earners, unbanked individuals, and micro-enterprises", isCorrect: true },
      { text: "Financing multi-billion dollar oil refineries", isCorrect: false },
      { text: "Issuing sovereign government bonds", isCorrect: false },
      { text: "Managing international airport customs", isCorrect: false }
    ],
    explanation: "MFBs provide accessible micro-credit and financial inclusion services to micro-entrepreneurs lacking formal collateral."
  },
  {
    text: "Which of the following is a non-governmental business membership organization representing manufacturers in Nigeria?",
    options: [
      { text: "MAN (Manufacturers Association of Nigeria)", isCorrect: true },
      { text: "NEMA", isCorrect: false },
      { text: "INEC", isCorrect: false },
      { text: "NUC", isCorrect: false }
    ],
    explanation: "MAN is the leading advocacy body representing manufacturing companies across Nigeria."
  },
  {
    text: "What does NACCIMA stand for in Nigeria's organized private sector?",
    options: [
      { text: "Nigerian Association of Chambers of Commerce, Industry, Mines and Agriculture", isCorrect: true },
      { text: "National Agency for Commercial Credit and Industrial Market Analysis", isCorrect: false },
      { text: "New African Confederation of Capital Investment and Management Agencies", isCorrect: false },
      { text: "National Agricultural Council for Cooperative Import and Export Management", isCorrect: false }
    ],
    explanation: "NACCIMA is the umbrella body for all regional chambers of commerce, industry, mines, and agriculture in Nigeria."
  },
  {
    text: "Which agency coordinates national technology acquisition and promotion of indigenous technology in Nigeria?",
    options: [
      { text: "NOTAP (National Office for Technology Acquisition and Promotion)", isCorrect: true },
      { text: "JAMB", isCorrect: false },
      { text: "NPHCDA", isCorrect: false },
      { text: "NITDA", isCorrect: false }
    ],
    explanation: "NOTAP registers technology transfer agreements and promotes the commercialization of indigenous research and patents."
  },
  {
    text: "What does NITDA stand for?",
    options: [
      { text: "National Information Technology Development Agency", isCorrect: true },
      { text: "Nigerian International Trade and Tariff Association", isCorrect: false },
      { text: "National Industrial Training and Development Authority", isCorrect: false },
      { text: "New Information and Telecommunication Drivers Agency", isCorrect: false }
    ],
    explanation: "NITDA is responsible for developing, regulating, and coordinating Information Technology practice in Nigeria."
  },
  {
    text: "Industrial training and skill upgrading for workers in Nigeria is funded and coordinated by which agency?",
    options: [
      { text: "ITF (Industrial Training Fund)", isCorrect: true },
      { text: "TETFund", isCorrect: false },
      { text: "UBEC", isCorrect: false },
      { text: "NYSC", isCorrect: false }
    ],
    explanation: "The Industrial Training Fund (ITF) promotes and provides manpower training in industry and commerce."
  },
  {
    text: "What is the primary objective of the DMO (Debt Management Office)?",
    options: [
      { text: "Managing Nigeria's public debt portfolio, issuing government bonds and Treasury bills", isCorrect: true },
      { text: "Managing private student loans", isCorrect: false },
      { text: "Collecting municipal market stall rents", isCorrect: false },
      { text: "Auditing private small business accounts", isCorrect: false }
    ],
    explanation: "The DMO centrally manages Nigeria's federal debt stock and issues sovereign securities like FGN Bonds and Sukuk."
  },
  {
    text: "Which government scheme provides equity funding and technical advice specifically for clean energy and agricultural processing SMEs?",
    options: [
      { text: "Clean Energy & Agri-Business SME Investment Funds (BOI / CBN Schemes)", isCorrect: true },
      { text: "Customs Tariff Rebate Fund", isCorrect: false },
      { text: "National Lottery Grant Scheme", isCorrect: false },
      { text: "Road Maintenance Fund", isCorrect: false }
    ],
    explanation: "Targeted development funds from BOI and CBN support green energy, agro-processing, and local manufacturing start-ups."
  },
  {
    text: "What is 'Venture Capital'?",
    options: [
      { text: "High-risk, high-reward equity funding provided by specialized firms to early-stage growth start-ups in exchange for equity ownership", isCorrect: true },
      { text: "A standard bank overdraft with 30% monthly interest", isCorrect: false },
      { text: "A government grant that never requires performance reporting", isCorrect: false },
      { text: "A lottery ticket purchased by business partners", isCorrect: false }
    ],
    explanation: "Venture capital provides financing to early-stage, high-potential growth companies in exchange for equity."
  },
  {
    text: "An 'Angel Investor' is best described as:",
    options: [
      { text: "A high-net-worth individual who provides capital for a business start-up, usually in exchange for convertible debt or equity", isCorrect: true },
      { text: "A non-profit religious organization", isCorrect: false },
      { text: "A government tax collector", isCorrect: false },
      { text: "A commercial bank loan manager", isCorrect: false }
    ],
    explanation: "Angel investors are wealthy individuals who invest their own personal capital into early-stage start-ups."
  },
  {
    text: "What is a 'Business Plan'?",
    options: [
      { text: "A comprehensive written document outlining a business's goals, strategies, target market, operational structure, and financial projections", isCorrect: true },
      { text: "A receipt issued to customers after purchasing goods", isCorrect: false },
      { text: "A daily office attendance register", isCorrect: false },
      { text: "A certificate of tax clearance", isCorrect: false }
    ],
    explanation: "A business plan is the strategic roadmap detailing how a business will achieve its operational and financial goals."
  },
  {
    text: "Why is an Executive Summary the most crucial section of a Business Plan for investors?",
    options: [
      { text: "It provides a concise, compelling overview of the entire business opportunity, highlighting key value propositions and financials", isCorrect: true },
      { text: "It contains the legal signatures of all junior workers", isCorrect: false },
      { text: "It lists the office furniture inventory", isCorrect: false },
      { text: "It is the only section required by law", isCorrect: false }
    ],
    explanation: "The Executive Summary synthesizes the essence of the business plan, giving investors an immediate overview of the investment opportunity."
  },
  {
    text: "Which analysis tool evaluates an enterprise's internal Strengths and Weaknesses along with external Opportunities and Threats?",
    options: [
      { text: "SWOT Analysis", isCorrect: true },
      { text: "PESTEL Analysis", isCorrect: false },
      { text: "Ratio Analysis", isCorrect: false },
      { text: "Break-even Analysis", isCorrect: false }
    ],
    explanation: "SWOT Analysis assesses internal Strengths and Weaknesses and external Opportunities and Threats to guide strategic decisions."
  },
  {
    text: "What does 'Break-Even Point' mean in business financial analysis?",
    options: [
      { text: "The production/sales level where total revenue equals total expenses (zero profit, zero loss)", isCorrect: true },
      { text: "The point where a business makes its maximum profit", isCorrect: false },
      { text: "The day a business closes down permanently", isCorrect: false },
      { text: "The date bank loans are completely written off", isCorrect: false }
    ],
    explanation: "The Break-Even Point is the revenue level where total costs equal total revenue, resulting in neither profit nor loss."
  }
];

async function seedEED326() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for EED 326 Seeding...");

    // 1. Fetch ICT Faculty & Departments
    const targetDeptNames = [
      'Software and Web Development',
      'Networking and Cloud Computing',
      'Cyber Security',
      'Artificial Intelligence'
    ];

    const depts = await Department.find({ name: { $in: targetDeptNames.map(n => new RegExp(`^${n}$`, 'i')) } });
    console.log(`Found ${depts.length} matching ICT departments.`);

    // 2. Ensure general EED 326 course exists
    const courseTitle = "ENTREPRENEURSHIP DEVELOPMENT II (EED 326)";
    
    let course = await Course.findOne({ title: courseTitle });
    if (!course) {
      course = await Course.create({
        title: courseTitle,
        description: "Comprehensive Entrepreneurship Development II course covering History of Entrepreneurship, Personal Savings & Portfolio Investment, Life Skills & Teamwork, and Government Support Agencies.",
        department: null, // Shared across all ICT departments
        level: "HND1",
        path: "polytechnic",
        semester: "Second Semester",
        price: 1000
      });
      console.log(`Created general Course: ${course.title} (Price: ₦1000)`);
    } else {
      course.price = 1000;
      course.level = "HND1";
      course.path = "polytechnic";
      course.semester = "Second Semester";
      await course.save();
      console.log(`Updated existing Course: ${course.title} (Price: ₦1000)`);
    }

    // Also create department-specific Course records if needed so each department explicitly has it listed
    for (const dept of depts) {
      const specificTitle = `EED 326 - ${dept.name.toUpperCase()}`;
      let deptCourse = await Course.findOne({ title: specificTitle });
      if (!deptCourse) {
        deptCourse = await Course.create({
          title: specificTitle,
          description: `Entrepreneurship Development II (EED 326) for ${dept.name} students.`,
          department: dept._id,
          level: "HND1",
          path: "polytechnic",
          semester: "Second Semester",
          price: 1000
        });
        console.log(`Created Department Course: ${specificTitle}`);
      } else {
        deptCourse.price = 1000;
        deptCourse.level = "HND1";
        deptCourse.path = "polytechnic";
        deptCourse.semester = "Second Semester";
        await deptCourse.save();
        console.log(`Updated Department Course: ${specificTitle}`);
      }

      // Ensure Quiz exists for department course
      let deptQuiz = await Quiz.findOne({ course: deptCourse._id });
      if (!deptQuiz) {
        deptQuiz = await Quiz.create({
          title: `EED 326 CBT Practice Test - ${dept.name}`,
          description: "Full 200-Question bank for EED 326. 60 questions randomly selected per 30-minute test session.",
          course: deptCourse._id,
          questions: questions,
          timeLimit: 30,
          isActive: true
        });
        console.log(`Created Quiz for ${dept.name} with ${questions.length} questions.`);
      } else {
        deptQuiz.questions = questions;
        deptQuiz.timeLimit = 30;
        deptQuiz.title = `EED 326 CBT Practice Test - ${dept.name}`;
        await deptQuiz.save();
        console.log(`Updated Quiz for ${dept.name} with ${questions.length} questions.`);
      }
    }

    // Also create/update Quiz for the general course
    let generalQuiz = await Quiz.findOne({ course: course._id });
    if (!generalQuiz) {
      generalQuiz = await Quiz.create({
        title: "EED 326 CBT Practice Test",
        description: "Full 200-Question bank for EED 326. 60 questions randomly selected per 30-minute test session.",
        course: course._id,
        questions: questions,
        timeLimit: 30,
        isActive: true
      });
      console.log(`Created General Quiz for EED 326 with ${questions.length} questions.`);
    } else {
      generalQuiz.questions = questions;
      generalQuiz.timeLimit = 30;
      await generalQuiz.save();
      console.log(`Updated General Quiz for EED 326 with ${questions.length} questions.`);
    }

    console.log("\n✅ EED 326 Seeding Completed Successfully! All 200 questions loaded.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedEED326();
