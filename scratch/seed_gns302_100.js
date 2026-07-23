import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';

dotenv.config();

const rawGns302Questions = [
  // SECTION 1: TYPES OF SENTENCES BY STRUCTURE & FUNCTION (1-20)
  {
    questionText: "A sentence is defined as a group of words that expresses a complete thought or conveys a complete sense. What essential components must a sentence possess?",
    options: [
      "A subject and a predicate",
      "A preposition and an adverb",
      "An adjective and an object",
      "A conjunction and an interjection"
    ],
    correctAnswer: "A subject and a predicate",
    explanation: "According to GNS 302 notes, every complete sentence must contain a subject and a predicate."
  },
  {
    questionText: "Which type of sentence contains only one finite verb and expresses only one idea?",
    options: [
      "Simple Sentence",
      "Complex Sentence",
      "Compound Sentence",
      "Compound-Complex Sentence"
    ],
    correctAnswer: "Simple Sentence",
    explanation: "A Simple Sentence contains only one finite verb and expresses a single complete idea."
  },
  {
    questionText: "What type of sentence is 'Jesus wept'?",
    options: [
      "Simple Sentence",
      "Complex Sentence",
      "Compound Sentence",
      "Imperative Sentence"
    ],
    correctAnswer: "Simple Sentence",
    explanation: "'Jesus wept' has one subject ('Jesus') and one finite verb ('wept'), making it a Simple Sentence."
  },
  {
    questionText: "A sentence containing two finite verbs or two ideas where one is the main clause and the other is a subordinate clause joined by a subordinating conjunction is called a _____.",
    options: [
      "Complex Sentence",
      "Simple Sentence",
      "Compound Sentence",
      "Declarative Sentence"
    ],
    correctAnswer: "Complex Sentence",
    explanation: "A Complex Sentence consists of a main independent clause and at least one subordinate (dependent) clause."
  },
  {
    questionText: "In the sentence 'The teacher who came here yesterday is my uncle', which part is the subordinate clause?",
    options: [
      "who came here yesterday",
      "The teacher is my uncle",
      "came here yesterday is my uncle",
      "The teacher who came"
    ],
    correctAnswer: "who came here yesterday",
    explanation: "'who came here yesterday' is a relative/subordinate clause modifying 'The teacher'."
  },
  {
    questionText: "Identify the subordinate clause in the sentence: 'James started a coin collection while his wife started picking flowers.'",
    options: [
      "while his wife started picking flowers",
      "James started a coin collection",
      "started a coin collection while",
      "his wife started picking"
    ],
    correctAnswer: "while his wife started picking flowers",
    explanation: "'while' introduces the subordinate adverbial clause of time."
  },
  {
    questionText: "A sentence with two related independent clauses joined by a coordinating conjunction (such as and, but, or) or a semicolon is a _____.",
    options: [
      "Compound Sentence",
      "Complex Sentence",
      "Simple Sentence",
      "Optative Sentence"
    ],
    correctAnswer: "Compound Sentence",
    explanation: "Compound sentences connect two equal independent clauses using coordinating conjunctions or semicolons."
  },
  {
    questionText: "Which of the following is an example of a Compound Sentence?",
    options: [
      "The male student outplayed us but we won.",
      "Jesus wept.",
      "The man recognized his wife when she arrived because she is very beautiful.",
      "Can you read and write?"
    ],
    correctAnswer: "The male student outplayed us but we won.",
    explanation: "'The male student outplayed us but we won' joins two independent clauses using the coordinating conjunction 'but'."
  },
  {
    questionText: "What type of sentence is 'To err is human; to forgive is divine'?",
    options: [
      "Compound Sentence",
      "Complex Sentence",
      "Simple Sentence",
      "Exclamatory Sentence"
    ],
    correctAnswer: "Compound Sentence",
    explanation: "It joins two independent clauses using a semicolon, making it a Compound Sentence."
  },
  {
    questionText: "A sentence containing two or more independent clauses and at least one dependent clause is classified as a _____.",
    options: [
      "Compound-Complex Sentence",
      "Complex Sentence",
      "Compound Sentence",
      "Declarative Sentence"
    ],
    correctAnswer: "Compound-Complex Sentence",
    explanation: "Compound-Complex sentences combine features of both compound and complex structures."
  },
  {
    questionText: "Identify the sentence structure: 'Peter worked hard for the examination but failed because he didn't read instructions well before he answered the questions.'",
    options: [
      "Compound-Complex Sentence",
      "Complex Sentence",
      "Compound Sentence",
      "Simple Sentence"
    ],
    correctAnswer: "Compound-Complex Sentence",
    explanation: "It has multiple independent clauses joined by 'but' and subordinate clauses introduced by 'because' and 'before'."
  },
  {
    questionText: "Which functional category of sentence is used to state a statement or assertion?",
    options: [
      "Declarative or Assertive Sentence",
      "Imperative Sentence",
      "Optative Sentence",
      "Interrogative Sentence"
    ],
    correctAnswer: "Declarative or Assertive Sentence",
    explanation: "Declarative/Assertive sentences state facts, opinions, or assertions."
  },
  {
    questionText: "Which functional category of sentence is used to issue a command or instruction?",
    options: [
      "Imperative Sentence",
      "Declarative Sentence",
      "Optative Sentence",
      "Exclamatory Sentence"
    ],
    correctAnswer: "Imperative Sentence",
    explanation: "Imperative sentences issue orders, requests, commands, or instructions (e.g., 'Close your eyes')."
  },
  {
    questionText: "Sentence types like 'Close your eye' and 'Get the book' belong to which functional classification?",
    options: [
      "Imperative Sentence",
      "Optative Sentence",
      "Declarative Sentence",
      "Interrogative Sentence"
    ],
    correctAnswer: "Imperative Sentence",
    explanation: "These express direct commands or instructions."
  },
  {
    questionText: "Which sentence type is specifically used to express a wish or polite request?",
    options: [
      "Optative Sentence",
      "Imperative Sentence",
      "Exclamatory Sentence",
      "Declarative Sentence"
    ],
    correctAnswer: "Optative Sentence",
    explanation: "Optative sentences express wishes, desires, or polite prayers."
  },
  {
    questionText: "Sentences such as 'Can you read?' or 'Where are you going?' belong to which functional type?",
    options: [
      "Interrogative Sentence",
      "Optative Sentence",
      "Declarative Sentence",
      "Imperative Sentence"
    ],
    correctAnswer: "Interrogative Sentence",
    explanation: "Interrogative sentences ask direct questions."
  },
  {
    questionText: "What type of sentence according to function is 'What a pity!'?",
    options: [
      "Exclamatory Sentence",
      "Optative Sentence",
      "Imperative Sentence",
      "Assertive Sentence"
    ],
    correctAnswer: "Exclamatory Sentence",
    explanation: "Exclamatory sentences express strong sudden emotion or intense feeling."
  },
  {
    questionText: "All of the following are functional categories of sentences EXCEPT _____.",
    options: [
      "Subordinate Sentence",
      "Declarative Sentence",
      "Imperative Sentence",
      "Exclamatory Sentence"
    ],
    correctAnswer: "Subordinate Sentence",
    explanation: "Subordinate is a structural clause term, not a functional sentence type."
  },
  {
    questionText: "In structural grammar, subordinating conjunctions include all of the following EXCEPT _____.",
    options: [
      "and",
      "because",
      "while",
      "since"
    ],
    correctAnswer: "and",
    explanation: "'and' is a coordinating conjunction (FANBOYS), whereas 'because', 'while', and 'since' are subordinating conjunctions."
  },
  {
    questionText: "Coordinating conjunctions used to join independent clauses in a compound sentence include _____.",
    options: [
      "but, and, or, nor, for, so, yet",
      "because, although, since, unless",
      "which, who, whom, whose",
      "if, provided that, in order that"
    ],
    correctAnswer: "but, and, or, nor, for, so, yet",
    explanation: "These are the standard coordinating conjunctions used to form compound sentences."
  },

  // SECTION 2: TENSES & VERB ASPECTS (21-40)
  {
    questionText: "In English grammar, tenses indicate when an action happens in relation to time. What two essential concepts are considered when analyzing tenses?",
    options: [
      "Time and Aspect",
      "Mood and Voice",
      "Gender and Number",
      "Case and Concord"
    ],
    correctAnswer: "Time and Aspect",
    explanation: "Tense analysis balances Time (Present, Past, Future) and Aspect (Simple, Progressive, Perfect, Perfect Progressive)."
  },
  {
    questionText: "The sentence 'I sing a song' is an example of which tense?",
    options: [
      "Simple Present Tense",
      "Simple Past Tense",
      "Present Progressive Tense",
      "Present Perfect Tense"
    ],
    correctAnswer: "Simple Present Tense",
    explanation: "'I sing a song' expresses habitual/present state in the Simple Present Tense."
  },
  {
    questionText: "What tense is expressed in the sentence 'James wore glasses'?",
    options: [
      "Simple Past Tense",
      "Simple Present Tense",
      "Past Perfect Tense",
      "Past Progressive Tense"
    ],
    correctAnswer: "Simple Past Tense",
    explanation: "'wore' is the simple past form of the verb 'wear'."
  },
  {
    questionText: "The sentence 'JJ Okocha is playing well' represents which tense and aspect?",
    options: [
      "Simple Present Progressive Tense",
      "Simple Past Progressive Tense",
      "Simple Present Perfect Tense",
      "Simple Future Progressive Tense"
    ],
    correctAnswer: "Simple Present Progressive Tense",
    explanation: "'is playing' combines the auxiliary 'is' with the '-ing' participle, forming Present Progressive."
  },
  {
    questionText: "What tense is illustrated by 'I was singing a song'?",
    options: [
      "Simple Past Progressive Tense",
      "Simple Present Progressive Tense",
      "Past Perfect Tense",
      "Past Perfect Progressive Tense"
    ],
    correctAnswer: "Simple Past Progressive Tense",
    explanation: "'was singing' expresses continuous action in the past (Past Progressive)."
  },
  {
    questionText: "The sentence 'James has worn glasses' belongs to which tense?",
    options: [
      "Simple Present Perfect Tense",
      "Simple Past Perfect Tense",
      "Present Progressive Tense",
      "Past Perfect Progressive Tense"
    ],
    correctAnswer: "Simple Present Perfect Tense",
    explanation: "'has worn' uses auxiliary 'has' + past participle 'worn', indicating Present Perfect."
  },
  {
    questionText: "Identify the tense of 'JJ Okocha had played well'.",
    options: [
      "Simple Past Perfect Tense",
      "Simple Present Perfect Tense",
      "Past Progressive Tense",
      "Past Perfect Progressive Tense"
    ],
    correctAnswer: "Simple Past Perfect Tense",
    explanation: "'had played' expresses an action completed before another point in the past (Past Perfect)."
  },
  {
    questionText: "What tense and aspect is demonstrated by 'I have been singing a song'?",
    options: [
      "Simple Present Perfect Progressive Tense",
      "Simple Past Perfect Progressive Tense",
      "Present Progressive Tense",
      "Past Perfect Tense"
    ],
    correctAnswer: "Simple Present Perfect Progressive Tense",
    explanation: "'have been singing' combines present perfect auxiliary with progressive participle."
  },
  {
    questionText: "Identify the tense: 'James had been wearing glasses.'",
    options: [
      "Past Perfect Progressive Tense",
      "Present Perfect Progressive Tense",
      "Past Progressive Tense",
      "Future Perfect Progressive Tense"
    ],
    correctAnswer: "Past Perfect Progressive Tense",
    explanation: "'had been wearing' represents duration of action prior to a past reference point."
  },
  {
    questionText: "Which of the following is in the Present Perfect Tense?",
    options: [
      "I have sung a song.",
      "I sang a song.",
      "I was singing a song.",
      "I had sung a song."
    ],
    correctAnswer: "I have sung a song.",
    explanation: "'have sung' is the Present Perfect form."
  },
  {
    questionText: "Which of the following sentences illustrates the Past Perfect Progressive Tense?",
    options: [
      "JJ Okocha had been playing well.",
      "JJ Okocha was playing well.",
      "JJ Okocha has played well.",
      "JJ Okocha plays well."
    ],
    correctAnswer: "JJ Okocha had been playing well.",
    explanation: "'had been playing' is Past Perfect Progressive."
  },
  {
    questionText: "What is the past participle form of 'wear' used in Perfect Tenses?",
    options: [
      "worn",
      "wore",
      "wearing",
      "wears"
    ],
    correctAnswer: "worn",
    explanation: "The principal parts of 'wear' are wear (present), wore (past), worn (past participle)."
  },
  {
    questionText: "In English grammar, aspect concerns _____.",
    options: [
      "the manner in which the verbal action is expected to progress or complete",
      "the physical location of the speaker",
      "the number of nouns in the sentence",
      "the emotional pitch of the utterance"
    ],
    correctAnswer: "the manner in which the verbal action is expected to progress or complete",
    explanation: "Aspect indicates whether an action is ongoing (progressive) or completed (perfect)."
  },
  {
    questionText: "Convert 'James wears glasses' into Present Progressive Tense:",
    options: [
      "James is wearing glasses.",
      "James wore glasses.",
      "James has worn glasses.",
      "James had been wearing glasses."
    ],
    correctAnswer: "James is wearing glasses.",
    explanation: "Present Progressive requires am/is/are + verb-ing ('is wearing')."
  },
  {
    questionText: "Convert 'I sing a song' into Simple Past Tense:",
    options: [
      "I sang a song.",
      "I have sung a song.",
      "I was singing a song.",
      "I had sung a song."
    ],
    correctAnswer: "I sang a song.",
    explanation: "'sang' is the simple past form of 'sing'."
  },
  {
    questionText: "Convert 'I sing a song' into Past Perfect Tense:",
    options: [
      "I had sung a song.",
      "I have sung a song.",
      "I was singing a song.",
      "I had been singing a song."
    ],
    correctAnswer: "I had sung a song.",
    explanation: "Past Perfect uses 'had' + past participle ('had sung')."
  },
  {
    questionText: "Convert 'JJ Okocha plays well' into Present Perfect Progressive Tense:",
    options: [
      "JJ Okocha has been playing well.",
      "JJ Okocha had been playing well.",
      "JJ Okocha is playing well.",
      "JJ Okocha played well."
    ],
    correctAnswer: "JJ Okocha has been playing well.",
    explanation: "Present Perfect Progressive uses has/have + been + verb-ing ('has been playing')."
  },
  {
    questionText: "Which verb form represents the continuous or progressive aspect?",
    options: [
      "Verb ending in '-ing' with an auxiliary verb",
      "Past participle verb ending in '-ed'",
      "Infinitive verb with 'to'",
      "Base form of the verb"
    ],
    correctAnswer: "Verb ending in '-ing' with an auxiliary verb",
    explanation: "Progressive aspect always uses auxiliary be + present participle (-ing)."
  },
  {
    questionText: "'Time' in tense analysis consists of which three major periods?",
    options: [
      "Present, Past, and Future",
      "Simple, Compound, and Complex",
      "Subject, Verb, and Object",
      "Diction, Imagery, and Sound"
    ],
    correctAnswer: "Present, Past, and Future",
    explanation: "Grammatical time is divided into Present, Past, and Future."
  },
  {
    questionText: "What is the correct Simple Past form of the verb 'sing'?",
    options: [
      "sang",
      "sung",
      "singed",
      "singing"
    ],
    correctAnswer: "sang",
    explanation: "Simple past of sing is sang; past participle is sung."
  },

  // SECTION 3: RULES & TYPES OF CONCORD (41-55)
  {
    questionText: "Concord in English grammar is defined as _____.",
    options: [
      "an agreement between the subject and the predicate of the main clause",
      "a contrast between main and subordinate clauses",
      "the rhyming pattern of poetic stanzas",
      "the chronological ordering of historical events"
    ],
    correctAnswer: "an agreement between the subject and the predicate of the main clause",
    explanation: "Concord refers to the grammatical agreement between subject and verb/predicate."
  },
  {
    questionText: "According to the first rule of Concord, when a singular noun is used in a sentence, _____.",
    options: [
      "a singular verb must be used",
      "a plural verb must be used",
      "an auxiliary verb is omitted",
      "a collective noun is mandatory"
    ],
    correctAnswer: "a singular verb must be used",
    explanation: "Rule 1 of Concord states: Singular subject takes a singular verb (e.g., 'The boy is good')."
  },
  {
    questionText: "Which sentence correctly illustrates the first rule of Concord?",
    options: [
      "The boy is good.",
      "The boy are good.",
      "The boys is good.",
      "The boy have good."
    ],
    correctAnswer: "The boy is good.",
    explanation: "'The boy' (singular noun) agrees with 'is' (singular verb)."
  },
  {
    questionText: "The second rule of Concord states that if you use a plural noun, you must use a _____.",
    options: [
      "plural verb",
      "singular verb",
      "subordinating conjunction",
      "singular pronoun"
    ],
    correctAnswer: "plural verb",
    explanation: "Rule 2 of Concord states: Plural subject requires a plural verb."
  },
  {
    questionText: "Which type of concord applies when correlatives like 'either...or' or 'neither...nor' are used?",
    options: [
      "Proximity Concord",
      "Grammatical Concord",
      "Notional Concord",
      "Poetic Concord"
    ],
    correctAnswer: "Proximity Concord",
    explanation: "Proximity Concord dictates that the verb agrees with the subject closest to it."
  },
  {
    questionText: "In Proximity Concord, complete the sentence: 'Either the student or the teacher _____ coming.'",
    options: [
      "is",
      "are",
      "were",
      "have"
    ],
    correctAnswer: "is",
    explanation: "The verb is closest to 'the teacher' (singular), so singular verb 'is' is used."
  },
  {
    questionText: "In Proximity Concord, complete the sentence: 'Either the teacher or the students _____ coming.'",
    options: [
      "are",
      "is",
      "was",
      "has"
    ],
    correctAnswer: "are",
    explanation: "The verb is closest to 'the students' (plural), so plural verb 'are' is used."
  },
  {
    questionText: "Choose the correct verb under Proximity Concord: 'Neither the teacher nor the students _____ the ball.'",
    options: [
      "kick",
      "kicks",
      "kicking",
      "is kick"
    ],
    correctAnswer: "kick",
    explanation: "'the students' is plural and closest to the verb, so plural verb 'kick' is correct."
  },
  {
    questionText: "What type of concord operates when collective nouns (e.g. army, committee, class) dictate verb agreement based on meaning?",
    options: [
      "Notional Concord",
      "Proximity Concord",
      "Grammatical Concord",
      "Structural Concord"
    ],
    correctAnswer: "Notional Concord",
    explanation: "Notional Concord bases agreement on the idea/meaning (notion) rather than strict grammatical form."
  },
  {
    questionText: "All of the following are recognized types of concord in GNS 302 EXCEPT _____.",
    options: [
      "Dialectal Concord",
      "Grammatical Concord",
      "Proximity Concord",
      "Notional Concord"
    ],
    correctAnswer: "Dialectal Concord",
    explanation: "The three main types taught in GNS 302 are Grammatical, Proximity, and Notional Concord."
  },
  {
    questionText: "In Notional Concord, collective nouns include examples such as _____.",
    options: [
      "army, committee, class",
      "teacher, student, boy",
      "either, neither, or",
      "because, since, although"
    ],
    correctAnswer: "army, committee, class",
    explanation: "Army, committee, and class are standard collective nouns."
  },
  {
    questionText: "Choose the correct sentence following Proximity Concord:",
    options: [
      "Neither John nor his brothers were present.",
      "Neither John nor his brothers was present.",
      "Neither John nor his brothers is present.",
      "Neither John nor his brothers has present."
    ],
    correctAnswer: "Neither John nor his brothers were present.",
    explanation: "The verb is closest to 'his brothers' (plural), requiring plural verb 'were'."
  },
  {
    questionText: "Which statement best describes Grammatical Concord?",
    options: [
      "Singular subject takes singular verb, and plural subject takes plural verb.",
      "The verb agrees strictly with the nearest subject regardless of main subject.",
      "The verb agrees with the speaker's emotional state.",
      "The subject is omitted in favor of an imperative verb."
    ],
    correctAnswer: "Singular subject takes singular verb, and plural subject takes plural verb.",
    explanation: "Grammatical Concord is the basic rule: singular subject -> singular verb, plural subject -> plural verb."
  },
  {
    questionText: "Identify the correct usage: 'The committee _____ divided in their decisions.'",
    options: [
      "are",
      "is",
      "was",
      "has"
    ],
    correctAnswer: "are",
    explanation: "When members of a collective noun act individually (divided), Notional Concord takes a plural verb."
  },
  {
    questionText: "Identify the correct usage: 'The committee _____ agreed on a single proposal.'",
    options: [
      "has",
      "have",
      "were",
      "are"
    ],
    correctAnswer: "has",
    explanation: "When a collective noun acts as a unified body, Notional Concord takes a singular verb ('has')."
  },

  // SECTION 4: LOGIC, PRINCIPLES OF LOGIC & FACTS VS OPINION (56-75)
  {
    questionText: "Logic is defined in philosophy as the branch that deals with _____.",
    options: [
      "analyzing, codifying, and systematizing principles used in evaluating evidence in a given argument",
      "studying the biological development of the human brain",
      "writing fictional stories about ancient heroes",
      "composing rhymed poetry for public performance"
    ],
    correctAnswer: "analyzing, codifying, and systematizing principles used in evaluating evidence in a given argument",
    explanation: "This is the precise formal definition of Logic in philosophy from GNS 302 notes."
  },
  {
    questionText: "Why is logic referred to as the science of the principles of correct reasoning?",
    options: [
      "It is systematic, follows laid down rules, and classifies arguments into valid or invalid",
      "It relies exclusively on emotional feelings and subjective personal tastes",
      "It only applies to mathematical calculations",
      "It is an unwritten oral tradition without fixed rules"
    ],
    correctAnswer: "It is systematic, follows laid down rules, and classifies arguments into valid or invalid",
    explanation: "Logic is a science because it is systematic, rule-based, data-driven, and distinguishes valid from invalid reasoning."
  },
  {
    questionText: "In logic, inferences are drawn from established statements known as _____.",
    options: [
      "premises",
      "fallacies",
      "stanzas",
      "meters"
    ],
    correctAnswer: "premises",
    explanation: "Premises are the foundational statements or evidence from which conclusions/inferences are drawn."
  },
  {
    questionText: "What is a 'Fact'?",
    options: [
      "A statement that portrays reality and can be tested and verified",
      "A subjective belief based on personal bias",
      "An unproven assumption about the future",
      "A literary device used in dramatic plays"
    ],
    correctAnswer: "A statement that portrays reality and can be tested and verified",
    explanation: "A fact is a statement depicting reality that is known/believed true and verifiable."
  },
  {
    questionText: "Through which three methods can a statement of fact be tested and verified?",
    options: [
      "Experiment, Calculation, and Observation",
      "Brainstorming, Drafting, and Revision",
      "Prose, Drama, and Poetry",
      "Diction, Imagery, and Rhythm"
    ],
    correctAnswer: "Experiment, Calculation, and Observation",
    explanation: "Facts are tested and verified via Experiment, Calculation, and Observation."
  },
  {
    questionText: "Qualities that a statement must possess to be accepted as a fact include all of the following EXCEPT _____.",
    options: [
      "Subjective personal bias",
      "Relevance",
      "Truth and Proof",
      "Universal acceptability"
    ],
    correctAnswer: "Subjective personal bias",
    explanation: "Bias belongs to opinions, not objective facts."
  },
  {
    questionText: "Which Principle of Logic asserts that every statement should have a truth value (a statement is identical to itself)?",
    options: [
      "Principle of Identity",
      "Principle of Contradiction",
      "Principle of Excluded Middle",
      "Principle of Syllogism"
    ],
    correctAnswer: "Principle of Identity",
    explanation: "The Principle of Identity asserts that every statement or proposition is identical to itself and holds a truth value."
  },
  {
    questionText: "Which Principle of Logic ensures that there is no contradiction because the acceptance of truth is the denial of falsehood?",
    options: [
      "Principle of Contradiction",
      "Principle of Identity",
      "Principle of Excluded Middle",
      "Principle of Proximity"
    ],
    correctAnswer: "Principle of Contradiction",
    explanation: "The Principle of Contradiction states that a proposition cannot be both true and false at the same time."
  },
  {
    questionText: "Which Principle of Logic asserts that a proposition is either true or false with no middle ground?",
    options: [
      "Principle of Excluded Middle",
      "Principle of Identity",
      "Principle of Contradiction",
      "Principle of Diction"
    ],
    correctAnswer: "Principle of Excluded Middle",
    explanation: "The Principle of Excluded Middle states there is no third or middle option between true and false."
  },
  {
    questionText: "How is an 'Opinion' defined according to Hornby (1996)?",
    options: [
      "A belief or judgement not founded on proof or complete knowledge",
      "A statement verified through scientific calculation",
      "A universal truth accepted by all humans",
      "A 14-line poem written in iambic pentameter"
    ],
    correctAnswer: "A belief or judgement not founded on proof or complete knowledge",
    explanation: "Hornby (1996) defines opinion as a belief or judgement not founded on proof or complete knowledge."
  },
  {
    questionText: "Why are opinions described as subjective rather than objective?",
    options: [
      "They reflect personal taste, social background, cultural differences, and bias",
      "They can be calculated using mathematical formulas",
      "They are universally accepted by all scientific bodies",
      "They strictly adhere to the Principle of Contradiction"
    ],
    correctAnswer: "They reflect personal taste, social background, cultural differences, and bias",
    explanation: "Opinions stem from personal nurture, background, and perspective, making them subjective."
  },
  {
    questionText: "Which of the following statements is a FACT?",
    options: [
      "Water consists of hydrogen and oxygen molecules.",
      "Software Development is the most enjoyable course in the world.",
      "Blue is the prettiest color for a classroom wall.",
      "Rainy days are depressing."
    ],
    correctAnswer: "Water consists of hydrogen and oxygen molecules.",
    explanation: "This is a scientifically verifiable statement of fact."
  },
  {
    questionText: "Which of the following statements is an OPINION?",
    options: [
      "Pizza is the most delicious food ever created.",
      "The polytechnic is an educational institution.",
      "GNS 302 covers logic and communication skills.",
      "Human beings require oxygen to survive."
    ],
    correctAnswer: "Pizza is the most delicious food ever created.",
    explanation: "Deliciousness is a subjective personal taste (opinion)."
  },
  {
    questionText: "The three core principles of logic taught in GNS 302 are _____.",
    options: [
      "Principle of Identity, Principle of Contradiction, and Principle of Excluded Middle",
      "Principle of Simple, Compound, and Complex",
      "Principle of Prose, Drama, and Poetry",
      "Principle of Subject, Predicate, and Concord"
    ],
    correctAnswer: "Principle of Identity, Principle of Contradiction, and Principle of Excluded Middle",
    explanation: "These are the three fundamental laws of thought/logic."
  },
  {
    questionText: "Can an opinion be verified by objective scientific standards?",
    options: [
      "No, because it reflects personal taste and bias rather than objective proof",
      "Yes, always through laboratory experimentation",
      "Yes, using mathematical calculations",
      "Only if written in an essay conclusion"
    ],
    correctAnswer: "No, because it reflects personal taste and bias rather than objective proof",
    explanation: "Opinions cannot be verified by objective standards because they lack objective proof."
  },
  {
    questionText: "A statement that complies with the three principles of logic and is proven true universally possesses which quality?",
    options: [
      "Factuality / Truth",
      "Poetic Diction",
      "Subordinate Clause",
      "Grammatical Concord"
    ],
    correctAnswer: "Factuality / Truth",
    explanation: "Possessing universal acceptability and logical proof makes a statement a fact."
  },
  {
    questionText: "Which method of verifying facts involves performing controlled scientific tests?",
    options: [
      "Experiment",
      "Calculation",
      "Observation",
      "Revision"
    ],
    correctAnswer: "Experiment",
    explanation: "Controlled tests in science are Experiments."
  },
  {
    questionText: "Determining that 15 + 25 = 40 is an example of verifying a fact through _____.",
    options: [
      "Calculation",
      "Experiment",
      "Observation",
      "Deduction"
    ],
    correctAnswer: "Calculation",
    explanation: "Mathematical proof is verification through Calculation."
  },
  {
    questionText: "Noticing that leaves turn brown in dry weather is verification of a fact through _____.",
    options: [
      "Observation",
      "Calculation",
      "Experimentation",
      "Syllogism"
    ],
    correctAnswer: "Observation",
    explanation: "Direct sensory monitoring is Observation."
  },
  {
    questionText: "Why must one be careful when presenting opinions?",
    options: [
      "Because presenting an opinion as absolute truth can mislead listeners",
      "Because opinions are illegally prohibited in academic writing",
      "Because opinions automatically convert sentences into fragments",
      "Because opinions violate the rules of past tense"
    ],
    correctAnswer: "Because presenting an opinion as absolute truth can mislead listeners",
    explanation: "GNS 302 notes state: 'One must be very careful presenting opinion as absolute truth.'"
  },

  // SECTION 5: ARGUMENTS & SYLLOGISMS (76-85)
  {
    questionText: "An argument in logic is best defined as _____.",
    options: [
      "the process of reasoning by which a conclusion is reached through a presentation of proofs and premises",
      "a violent physical fight between two people",
      "a emotional shouting match without rules",
      "a form of lyric poetry sung during dance"
    ],
    correctAnswer: "the process of reasoning by which a conclusion is reached through a presentation of proofs and premises",
    explanation: "Logical argument is the chain of reasoning leading to an accepted conclusion."
  },
  {
    questionText: "What are the two major types of argument in logic?",
    options: [
      "Inductive Argument and Deductive Argument",
      "Declarative Argument and Imperative Argument",
      "Simple Argument and Complex Argument",
      "Prose Argument and Poetic Argument"
    ],
    correctAnswer: "Inductive Argument and Deductive Argument",
    explanation: "Logical arguments are divided into Inductive and Deductive reasoning."
  },
  {
    questionText: "An Inductive Argument is a type of reasoning that begins with _____ and moves to a _____.",
    options: [
      "specific instances; general proposition",
      "general proposition; specific instance",
      "false premise; true conclusion",
      "poetic meter; rhymed stanza"
    ],
    correctAnswer: "specific instances; general proposition",
    explanation: "Inductive reasoning moves from specific observations to a general conclusion."
  },
  {
    questionText: "Why may an Inductive Argument be defective or fallacious (full of fallacies)?",
    options: [
      "It may be based on insufficient data or a biased sample",
      "It uses strict mathematical calculations",
      "It always guarantees 100% certainty",
      "It follows the Principle of Identity"
    ],
    correctAnswer: "It may be based on insufficient data or a biased sample",
    explanation: "Inductive arguments risk fallacies when built on small or biased observation samples."
  },
  {
    questionText: "A Deductive Argument is a type of reasoning that begins from a _____ to affect a _____.",
    options: [
      "general conclusion/proposition; specific instance",
      "specific instance; general proposition",
      "subjective opinion; scientific calculation",
      "narrative draft; descriptive outline"
    ],
    correctAnswer: "general conclusion/proposition; specific instance",
    explanation: "Deductive reasoning applies general principles to specific cases."
  },
  {
    questionText: "In a Deductive Argument, if the premises are true, accepting the premises _____ one to accept the conclusion logically.",
    options: [
      "forces / compels",
      "discourages",
      "forbids",
      "randomizes"
    ],
    correctAnswer: "forces / compels",
    explanation: "In a valid deductive argument, true premises logically force acceptance of the conclusion."
  },
  {
    questionText: "Consider the argument: 'All mothers are female. Jane is a mother. Therefore, Jane is female.' This is an example of a _____.",
    options: [
      "Deductive Argument",
      "Inductive Argument",
      "Defective Argument",
      "Fallacious Argument"
    ],
    correctAnswer: "Deductive Argument",
    explanation: "It moves from a general truth ('All mothers are female') to a specific application ('Jane')."
  },
  {
    questionText: "A 3-part structured argument consisting of a major premise, minor premise, and conclusion is known as a _____.",
    options: [
      "Syllogism",
      "Sonnet",
      "Metaphor",
      "Concord"
    ],
    correctAnswer: "Syllogism",
    explanation: "A Syllogism is a standard 3-part deductive argument structure."
  },
  {
    questionText: "Analyze this syllogism: 'All nurses are kind. Mary is a nurse. Therefore, Mary is kind.' What role does 'Mary is a nurse' play?",
    options: [
      "Minor Premise",
      "Major Premise",
      "Conclusion",
      "Fallacy"
    ],
    correctAnswer: "Minor Premise",
    explanation: "'All nurses are kind' = Major Premise; 'Mary is a nurse' = Minor Premise; 'Mary is kind' = Conclusion."
  },
  {
    questionText: "A deductive argument is said to be INVALID when _____.",
    options: [
      "the premises do not lead logically to the conclusion",
      "the premises are written in past tense",
      "it contains more than three clauses",
      "it uses poetic imagery"
    ],
    correctAnswer: "the premises do not lead logically to the conclusion",
    explanation: "Invalidity occurs when the conclusion does not logically follow from the given premises."
  },

  // SECTION 6: ESSAY WRITING & ESSAY TYPES (86-93)
  {
    questionText: "An Essay is defined as a sequential piece of non-fiction writing that presents an author's argument, ideas, analysis, or perspective. What are its main aims?",
    options: [
      "To inform, persuade, and interpret",
      "To confuse, entertain, and rhyme",
      "To calculate, experiment, and observe",
      "To sing, dance, and act"
    ],
    correctAnswer: "To inform, persuade, and interpret",
    explanation: "An essay aims to inform, persuade, and interpret a specific topic."
  },
  {
    questionText: "What are the three core structural parts of an essay?",
    options: [
      "Introduction, Body, and Conclusion",
      "Major Premise, Minor Premise, and Syllogism",
      "Prose, Drama, and Poetry",
      "Preparation, Drafting, and Revision"
    ],
    correctAnswer: "Introduction, Body, and Conclusion",
    explanation: "The standard 3-part structure of an essay consists of Introduction, Body, and Conclusion."
  },
  {
    questionText: "The statement at the end of an essay introduction that outlines the main point or argument of the essay is called the _____.",
    options: [
      "Thesis Statement",
      "Topic Sentence",
      "Premise",
      "Concord"
    ],
    correctAnswer: "Thesis Statement",
    explanation: "A thesis statement summarizes the main point or claim of the essay."
  },
  {
    questionText: "What are the three main stages involved in the process of writing an essay?",
    options: [
      "Preparation, Drafting, and Revision",
      "Introduction, Body, and Conclusion",
      "Reading, Speaking, and Listening",
      "Premise, Argument, and Syllogism"
    ],
    correctAnswer: "Preparation, Drafting, and Revision",
    explanation: "The writing process includes 1. Preparation (Research/Outline), 2. Drafting (Writing), 3. Revision (Editing)."
  },
  {
    questionText: "Which type of essay tells a story from personal experience and is normally written in the past tense?",
    options: [
      "Narrative Essay",
      "Descriptive Essay",
      "Expository Essay",
      "Argumentative Essay"
    ],
    correctAnswer: "Narrative Essay",
    explanation: "Narrative essays recount events or personal experiences, usually in chronological past tense."
  },
  {
    questionText: "Which type of essay gives a vivid mental picture of a person, place, or event?",
    options: [
      "Descriptive Essay",
      "Narrative Essay",
      "Expository Essay",
      "Argumentative Essay"
    ],
    correctAnswer: "Descriptive Essay",
    explanation: "Descriptive essays paint a detailed mental picture using sensory details."
  },
  {
    questionText: "Which type of essay explains a concept, process, or topic objectively?",
    options: [
      "Expository Essay",
      "Argumentative Essay",
      "Narrative Essay",
      "Descriptive Essay"
    ],
    correctAnswer: "Expository Essay",
    explanation: "Expository essays expose, explain, or inform about a topic clearly and objectively."
  },
  {
    questionText: "Which type of essay takes a definite stand and uses facts and logical points to convince or persuade the reader?",
    options: [
      "Argumentative Essay",
      "Narrative Essay",
      "Descriptive Essay",
      "Expository Essay"
    ],
    correctAnswer: "Argumentative Essay",
    explanation: "Argumentative essays present a clear stance and persuade readers using evidence."
  },

  // SECTION 7: LITERATURE & GENRES (94-100)
  {
    questionText: "Literature is distinguished from other forms of printed writing (such as computer science or history text) primarily by its _____.",
    options: [
      "literary value, imagination, and artistic methods attached to it",
      "use of mathematical calculations",
      "exclusive reliance on true facts",
      "lack of sentence structure"
    ],
    correctAnswer: "literary value, imagination, and artistic methods attached to it",
    explanation: "Literature creates its own world through imaginative interpretation and aesthetic literary value."
  },
  {
    questionText: "What are the three main genres or branches of Literature in English?",
    options: [
      "Prose, Drama, and Poetry",
      "Narrative, Descriptive, and Expository",
      "Simple, Complex, and Compound",
      "Diction, Imagery, and Rhythm"
    ],
    correctAnswer: "Prose, Drama, and Poetry",
    explanation: "The three primary genres of literature are Prose, Drama, and Poetry."
  },
  {
    questionText: "A writer of dramatic plays is called a _____, while a writer of poems is called a _____.",
    options: [
      "Dramatist / Playwright; Poet",
      "Prose writer; Novelist",
      "Essayist; Biographer",
      "Philosopher; Logician"
    ],
    correctAnswer: "Dramatist / Playwright; Poet",
    explanation: "Drama is written by a Dramatist/Playwright; Poetry is written by a Poet."
  },
  {
    questionText: "How did William Wordsworth define Poetry?",
    options: [
      "The spontaneous overflow of powerful feelings recollected in tranquility",
      "A piece of writing arranged in sequential order to convince an audience",
      "A strict mathematical calculation of human emotion",
      "A 3-part syllogism composed of major and minor premises"
    ],
    correctAnswer: "The spontaneous overflow of powerful feelings recollected in tranquility",
    explanation: "Wordsworth famous definition states poetry is 'the spontaneous overflow of powerful feelings recollected in tranquility'."
  },
  {
    questionText: "Match the poetic type: A 14-line poem that often ends with rhyming couplets is a _____.",
    options: [
      "Sonnet",
      "Lyric",
      "Ballad",
      "Epic"
    ],
    correctAnswer: "Sonnet",
    explanation: "A Sonnet is strictly a 14-line poem."
  },
  {
    questionText: "A dignified poem written to mourn the death of someone is called an _____.",
    options: [
      "Elegy",
      "Ode",
      "Epic",
      "Lyric"
    ],
    correctAnswer: "Elegy",
    explanation: "An Elegy is a mournful, meditative poem lamenting a death."
  },
  {
    questionText: "In poetry terminologies, what is 'Diction'?",
    options: [
      "The choice and use of words by the poet",
      "The regular beat or pulse of a poem",
      "The 14-line structure of a sonnet",
      "The figurative picture beyond literal meaning"
    ],
    correctAnswer: "The choice and use of words by the poet",
    explanation: "Diction refers specifically to word choice and vocabulary selection in literature."
  }
];

// Transform raw questions to match Mongoose Quiz Schema
const gns302Questions = rawGns302Questions.map(q => ({
  text: q.questionText,
  options: q.options.map(opt => ({
    text: opt,
    isCorrect: opt === q.correctAnswer
  })),
  explanation: q.explanation,
  subject: "Communication Skills & Logic"
}));

async function seedGNS302() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for GNS 302 Seeding...");

    // Find ICT Faculty
    const faculties = await Faculty.find({});
    let ictFaculty = faculties.find(f => f.name.toLowerCase().includes('information') || f.name.toLowerCase().includes('ict') || f.name.toLowerCase().includes('technology'));
    if (!ictFaculty && faculties.length > 0) ictFaculty = faculties[0];

    const targetDepts = [
      "Software and Web Development",
      "Artificial Intelligence",
      "Networking and Cloud Computing",
      "Cyber Security"
    ];

    const existingDepts = await Department.find({ faculty: ictFaculty._id });
    
    let createdCourses = 0;
    let createdQuizzes = 0;

    for (const deptName of targetDepts) {
      let dept = existingDepts.find(d => d.name.toLowerCase().includes(deptName.toLowerCase()));
      if (!dept) {
        dept = await Department.create({
          name: deptName,
          code: deptName.split(' ').map(w => w[0]).join(''),
          faculty: ictFaculty._id,
          level: "HND1"
        });
        console.log(`Created missing Department: ${deptName}`);
      }

      // Check if GNS 302 Course exists for this department
      let course = await Course.findOne({
        code: /GNS\s*302/i,
        department: dept._id
      });

      if (!course) {
        course = await Course.create({
          title: `Communication Skills & Logic - ${deptName}`,
          code: "GNS 302",
          description: "Comprehensive HND1 Communication Skills, Grammar, Concord, Tenses, Logic, Argumentation, Essay Writing, and Literary Genres.",
          department: dept._id,
          faculty: ictFaculty._id,
          level: "HND1",
          semester: "Second Semester",
          path: "polytechnic",
          price: 1000,
          isPaid: true
        });
        createdCourses++;
        console.log(`Created GNS 302 Course for ${deptName}`);
      }

      // Check if Quiz exists for this Course
      let quiz = await Quiz.findOne({ course: course._id });
      if (!quiz) {
        quiz = await Quiz.create({
          title: `GNS 302 CBT Practice Test - ${deptName}`,
          description: "Master 100-question pool covering Sentence Structures, Tenses, Concord, Principles of Logic, Facts vs Opinions, Syllogisms, Essay Writing & Literature.",
          course: course._id,
          questions: gns302Questions,
          timeLimit: 30,
          totalMarks: 100,
          passingMarks: 50,
          shuffleQuestions: true,
          questionsPerAttempt: 60
        });
        createdQuizzes++;
        console.log(`Created GNS 302 Quiz for ${deptName} with ${gns302Questions.length} questions!`);
      } else {
        quiz.questions = gns302Questions;
        quiz.questionsPerAttempt = 60;
        quiz.timeLimit = 30;
        await quiz.save();
        console.log(`Updated GNS 302 Quiz for ${deptName} with full 100 question pool!`);
      }
    }

    console.log(`\n=======================================================`);
    console.log(`✅ GNS 302 Seeding Complete!`);
    console.log(`✅ 100 High-Quality Questions loaded across SWD, AI, NCC, and CYS.`);
    console.log(`✅ Exam settings: 60 questions shuffled per 30-minute attempt.`);
    console.log(`=======================================================\n`);
    process.exit(0);

  } catch (err) {
    console.error("GNS 302 Seeding failed:", err);
    process.exit(1);
  }
}

seedGNS302();
