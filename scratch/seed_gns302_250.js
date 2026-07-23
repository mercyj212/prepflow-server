import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

// PART 1: 100 Handwritten Lecture Note Questions
const noteQuestions100 = [
  {
    text: "A sentence is defined as a group of words that expresses a complete thought or conveys a complete sense. What essential components must a sentence possess?",
    options: [
      { text: "A subject and a predicate", isCorrect: true },
      { text: "A preposition and an adverb", isCorrect: false },
      { text: "An adjective and an object", isCorrect: false },
      { text: "A conjunction and an interjection", isCorrect: false }
    ],
    explanation: "According to GNS 302 notes, every complete sentence must contain a subject and a predicate."
  },
  {
    text: "Which type of sentence contains only one finite verb and expresses only one idea?",
    options: [
      { text: "Simple Sentence", isCorrect: true },
      { text: "Complex Sentence", isCorrect: false },
      { text: "Compound Sentence", isCorrect: false },
      { text: "Compound-Complex Sentence", isCorrect: false }
    ],
    explanation: "A Simple Sentence contains only one finite verb and expresses a single complete idea."
  },
  {
    text: "What type of sentence is 'Jesus wept'?",
    options: [
      { text: "Simple Sentence", isCorrect: true },
      { text: "Complex Sentence", isCorrect: false },
      { text: "Compound Sentence", isCorrect: false },
      { text: "Imperative Sentence", isCorrect: false }
    ],
    explanation: "'Jesus wept' has one subject ('Jesus') and one finite verb ('wept'), making it a Simple Sentence."
  },
  {
    text: "A sentence containing two finite verbs or two ideas where one is the main clause and the other is a subordinate clause joined by a subordinating conjunction is called a _____.",
    options: [
      { text: "Complex Sentence", isCorrect: true },
      { text: "Simple Sentence", isCorrect: false },
      { text: "Compound Sentence", isCorrect: false },
      { text: "Declarative Sentence", isCorrect: false }
    ],
    explanation: "A Complex Sentence consists of a main independent clause and at least one subordinate (dependent) clause."
  },
  {
    text: "In the sentence 'The teacher who came here yesterday is my uncle', which part is the subordinate clause?",
    options: [
      { text: "who came here yesterday", isCorrect: true },
      { text: "The teacher is my uncle", isCorrect: false },
      { text: "came here yesterday is my uncle", isCorrect: false },
      { text: "The teacher who came", isCorrect: false }
    ],
    explanation: "'who came here yesterday' is a relative/subordinate clause modifying 'The teacher'."
  },
  {
    text: "Identify the subordinate clause in the sentence: 'James started a coin collection while his wife started picking flowers.'",
    options: [
      { text: "while his wife started picking flowers", isCorrect: true },
      { text: "James started a coin collection", isCorrect: false },
      { text: "started a coin collection while", isCorrect: false },
      { text: "his wife started picking", isCorrect: false }
    ],
    explanation: "'while' introduces the subordinate adverbial clause of time."
  },
  {
    text: "A sentence with two related independent clauses joined by a coordinating conjunction (such as and, but, or) or a semicolon is a _____.",
    options: [
      { text: "Compound Sentence", isCorrect: true },
      { text: "Complex Sentence", isCorrect: false },
      { text: "Simple Sentence", isCorrect: false },
      { text: "Optative Sentence", isCorrect: false }
    ],
    explanation: "Compound sentences connect two equal independent clauses using coordinating conjunctions or semicolons."
  },
  {
    text: "Which of the following is an example of a Compound Sentence?",
    options: [
      { text: "The male student outplayed us but we won.", isCorrect: true },
      { text: "Jesus wept.", isCorrect: false },
      { text: "The man recognized his wife when she arrived because she is very beautiful.", isCorrect: false },
      { text: "Can you read and write?", isCorrect: false }
    ],
    explanation: "'The male student outplayed us but we won' joins two independent clauses using the coordinating conjunction 'but'."
  },
  {
    text: "What type of sentence is 'To err is human; to forgive is divine'?",
    options: [
      { text: "Compound Sentence", isCorrect: true },
      { text: "Complex Sentence", isCorrect: false },
      { text: "Simple Sentence", isCorrect: false },
      { text: "Exclamatory Sentence", isCorrect: false }
    ],
    explanation: "It joins two independent clauses using a semicolon, making it a Compound Sentence."
  },
  {
    text: "A sentence containing two or more independent clauses and at least one dependent clause is classified as a _____.",
    options: [
      { text: "Compound-Complex Sentence", isCorrect: true },
      { text: "Complex Sentence", isCorrect: false },
      { text: "Compound Sentence", isCorrect: false },
      { text: "Declarative Sentence", isCorrect: false }
    ],
    explanation: "Compound-Complex sentences combine features of both compound and complex structures."
  },
  {
    text: "Identify the sentence structure: 'Peter worked hard for the examination but failed because he didn't read instructions well before he answered the questions.'",
    options: [
      { text: "Compound-Complex Sentence", isCorrect: true },
      { text: "Complex Sentence", isCorrect: false },
      { text: "Compound Sentence", isCorrect: false },
      { text: "Simple Sentence", isCorrect: false }
    ],
    explanation: "It has multiple independent clauses joined by 'but' and subordinate clauses introduced by 'because' and 'before'."
  },
  {
    text: "Which functional category of sentence is used to state a statement or assertion?",
    options: [
      { text: "Declarative or Assertive Sentence", isCorrect: true },
      { text: "Imperative Sentence", isCorrect: false },
      { text: "Optative Sentence", isCorrect: false },
      { text: "Interrogative Sentence", isCorrect: false }
    ],
    explanation: "Declarative/Assertive sentences state facts, opinions, or assertions."
  },
  {
    text: "Which functional category of sentence is used to issue a command or instruction?",
    options: [
      { text: "Imperative Sentence", isCorrect: true },
      { text: "Declarative Sentence", isCorrect: false },
      { text: "Optative Sentence", isCorrect: false },
      { text: "Exclamatory Sentence", isCorrect: false }
    ],
    explanation: "Imperative sentences issue orders, requests, commands, or instructions (e.g., 'Close your eyes')."
  },
  {
    text: "Sentence types like 'Close your eye' and 'Get the book' belong to which functional classification?",
    options: [
      { text: "Imperative Sentence", isCorrect: true },
      { text: "Optative Sentence", isCorrect: false },
      { text: "Declarative Sentence", isCorrect: false },
      { text: "Interrogative Sentence", isCorrect: false }
    ],
    explanation: "These express direct commands or instructions."
  },
  {
    text: "Which sentence type is specifically used to express a wish or polite request?",
    options: [
      { text: "Optative Sentence", isCorrect: true },
      { text: "Imperative Sentence", isCorrect: false },
      { text: "Exclamatory Sentence", isCorrect: false },
      { text: "Declarative Sentence", isCorrect: false }
    ],
    explanation: "Optative sentences express wishes, desires, or polite prayers."
  },
  {
    text: "Sentences such as 'Can you read?' or 'Where are you going?' belong to which functional type?",
    options: [
      { text: "Interrogative Sentence", isCorrect: true },
      { text: "Optative Sentence", isCorrect: false },
      { text: "Declarative Sentence", isCorrect: false },
      { text: "Imperative Sentence", isCorrect: false }
    ],
    explanation: "Interrogative sentences ask direct questions."
  },
  {
    text: "What type of sentence according to function is 'What a pity!'?",
    options: [
      { text: "Exclamatory Sentence", isCorrect: true },
      { text: "Optative Sentence", isCorrect: false },
      { text: "Imperative Sentence", isCorrect: false },
      { text: "Assertive Sentence", isCorrect: false }
    ],
    explanation: "Exclamatory sentences express strong sudden emotion or intense feeling."
  },
  {
    text: "All of the following are functional categories of sentences EXCEPT _____.",
    options: [
      { text: "Subordinate Sentence", isCorrect: true },
      { text: "Declarative Sentence", isCorrect: false },
      { text: "Imperative Sentence", isCorrect: false },
      { text: "Exclamatory Sentence", isCorrect: false }
    ],
    explanation: "Subordinate is a structural clause term, not a functional sentence type."
  },
  {
    text: "In structural grammar, subordinating conjunctions include all of the following EXCEPT _____.",
    options: [
      { text: "and", isCorrect: true },
      { text: "because", isCorrect: false },
      { text: "while", isCorrect: false },
      { text: "since", isCorrect: false }
    ],
    explanation: "'and' is a coordinating conjunction (FANBOYS), whereas 'because', 'while', and 'since' are subordinating conjunctions."
  },
  {
    text: "Coordinating conjunctions used to join independent clauses in a compound sentence include _____.",
    options: [
      { text: "but, and, or, nor, for, so, yet", isCorrect: true },
      { text: "because, although, since, unless", isCorrect: false },
      { text: "which, who, whom, whose", isCorrect: false },
      { text: "if, provided that, in order that", isCorrect: false }
    ],
    explanation: "These are the standard coordinating conjunctions used to form compound sentences."
  },
  {
    text: "In English grammar, tenses indicate when an action happens in relation to time. What two essential concepts are considered when analyzing tenses?",
    options: [
      { text: "Time and Aspect", isCorrect: true },
      { text: "Mood and Voice", isCorrect: false },
      { text: "Gender and Number", isCorrect: false },
      { text: "Case and Concord", isCorrect: false }
    ],
    explanation: "Tense analysis balances Time (Present, Past, Future) and Aspect (Simple, Progressive, Perfect, Perfect Progressive)."
  },
  {
    text: "The sentence 'I sing a song' is an example of which tense?",
    options: [
      { text: "Simple Present Tense", isCorrect: true },
      { text: "Simple Past Tense", isCorrect: false },
      { text: "Present Progressive Tense", isCorrect: false },
      { text: "Present Perfect Tense", isCorrect: false }
    ],
    explanation: "'I sing a song' expresses habitual/present state in the Simple Present Tense."
  },
  {
    text: "What tense is expressed in the sentence 'James wore glasses'?",
    options: [
      { text: "Simple Past Tense", isCorrect: true },
      { text: "Simple Present Tense", isCorrect: false },
      { text: "Past Perfect Tense", isCorrect: false },
      { text: "Past Progressive Tense", isCorrect: false }
    ],
    explanation: "'wore' is the simple past form of the verb 'wear'."
  },
  {
    text: "The sentence 'JJ Okocha is playing well' represents which tense and aspect?",
    options: [
      { text: "Simple Present Progressive Tense", isCorrect: true },
      { text: "Simple Past Progressive Tense", isCorrect: false },
      { text: "Simple Present Perfect Tense", isCorrect: false },
      { text: "Simple Future Progressive Tense", isCorrect: false }
    ],
    explanation: "'is playing' combines the auxiliary 'is' with the '-ing' participle, forming Present Progressive."
  },
  {
    text: "What tense is illustrated by 'I was singing a song'?",
    options: [
      { text: "Simple Past Progressive Tense", isCorrect: true },
      { text: "Simple Present Progressive Tense", isCorrect: false },
      { text: "Past Perfect Tense", isCorrect: false },
      { text: "Past Perfect Progressive Tense", isCorrect: false }
    ],
    explanation: "'was singing' expresses continuous action in the past (Past Progressive)."
  },
  {
    text: "The sentence 'James has worn glasses' belongs to which tense?",
    options: [
      { text: "Simple Present Perfect Tense", isCorrect: true },
      { text: "Simple Past Perfect Tense", isCorrect: false },
      { text: "Present Progressive Tense", isCorrect: false },
      { text: "Past Perfect Progressive Tense", isCorrect: false }
    ],
    explanation: "'has worn' uses auxiliary 'has' + past participle 'worn', indicating Present Perfect."
  },
  {
    text: "Identify the tense of 'JJ Okocha had played well'.",
    options: [
      { text: "Simple Past Perfect Tense", isCorrect: true },
      { text: "Simple Present Perfect Tense", isCorrect: false },
      { text: "Past Progressive Tense", isCorrect: false },
      { text: "Past Perfect Progressive Tense", isCorrect: false }
    ],
    explanation: "'had played' expresses an action completed before another point in the past (Past Perfect)."
  },
  {
    text: "What tense and aspect is demonstrated by 'I have been singing a song'?",
    options: [
      { text: "Simple Present Perfect Progressive Tense", isCorrect: true },
      { text: "Simple Past Perfect Progressive Tense", isCorrect: false },
      { text: "Present Progressive Tense", isCorrect: false },
      { text: "Past Perfect Tense", isCorrect: false }
    ],
    explanation: "'have been singing' combines present perfect auxiliary with progressive participle."
  },
  {
    text: "Identify the tense: 'James had been wearing glasses.'",
    options: [
      { text: "Past Perfect Progressive Tense", isCorrect: true },
      { text: "Present Perfect Progressive Tense", isCorrect: false },
      { text: "Past Progressive Tense", isCorrect: false },
      { text: "Future Perfect Progressive Tense", isCorrect: false }
    ],
    explanation: "'had been wearing' represents duration of action prior to a past reference point."
  },
  {
    text: "Which of the following is in the Present Perfect Tense?",
    options: [
      { text: "I have sung a song.", isCorrect: true },
      { text: "I sang a song.", isCorrect: false },
      { text: "I was singing a song.", isCorrect: false },
      { text: "I had sung a song.", isCorrect: false }
    ],
    explanation: "'have sung' is the Present Perfect form."
  },
  {
    text: "Which of the following sentences illustrates the Past Perfect Progressive Tense?",
    options: [
      { text: "JJ Okocha had been playing well.", isCorrect: true },
      { text: "JJ Okocha was playing well.", isCorrect: false },
      { text: "JJ Okocha has played well.", isCorrect: false },
      { text: "JJ Okocha plays well.", isCorrect: false }
    ],
    explanation: "'had been playing' is Past Perfect Progressive."
  },
  {
    text: "What is the past participle form of 'wear' used in Perfect Tenses?",
    options: [
      { text: "worn", isCorrect: true },
      { text: "wore", isCorrect: false },
      { text: "wearing", isCorrect: false },
      { text: "wears", isCorrect: false }
    ],
    explanation: "The principal parts of 'wear' are wear (present), wore (past), worn (past participle)."
  },
  {
    text: "In English grammar, aspect concerns _____.",
    options: [
      { text: "the manner in which the verbal action is expected to progress or complete", isCorrect: true },
      { text: "the physical location of the speaker", isCorrect: false },
      { text: "the number of nouns in the sentence", isCorrect: false },
      { text: "the emotional pitch of the utterance", isCorrect: false }
    ],
    explanation: "Aspect indicates whether an action is ongoing (progressive) or completed (perfect)."
  },
  {
    text: "Convert 'James wears glasses' into Present Progressive Tense:",
    options: [
      { text: "James is wearing glasses.", isCorrect: true },
      { text: "James wore glasses.", isCorrect: false },
      { text: "James has worn glasses.", isCorrect: false },
      { text: "James had been wearing glasses.", isCorrect: false }
    ],
    explanation: "Present Progressive requires am/is/are + verb-ing ('is wearing')."
  },
  {
    text: "Convert 'I sing a song' into Simple Past Tense:",
    options: [
      { text: "I sang a song.", isCorrect: true },
      { text: "I have sung a song.", isCorrect: false },
      { text: "I was singing a song.", isCorrect: false },
      { text: "I had sung a song.", isCorrect: false }
    ],
    explanation: "'sang' is the simple past form of 'sing'."
  },
  {
    text: "Convert 'I sing a song' into Past Perfect Tense:",
    options: [
      { text: "I had sung a song.", isCorrect: true },
      { text: "I have sung a song.", isCorrect: false },
      { text: "I was singing a song.", isCorrect: false },
      { text: "I had been singing a song.", isCorrect: false }
    ],
    explanation: "Past Perfect uses 'had' + past participle ('had sung')."
  },
  {
    text: "Convert 'JJ Okocha plays well' into Present Perfect Progressive Tense:",
    options: [
      { text: "JJ Okocha has been playing well.", isCorrect: true },
      { text: "JJ Okocha had been playing well.", isCorrect: false },
      { text: "JJ Okocha is playing well.", isCorrect: false },
      { text: "JJ Okocha played well.", isCorrect: false }
    ],
    explanation: "Present Perfect Progressive uses has/have + been + verb-ing ('has been playing')."
  },
  {
    text: "Which verb form represents the continuous or progressive aspect?",
    options: [
      { text: "Verb ending in '-ing' with an auxiliary verb", isCorrect: true },
      { text: "Past participle verb ending in '-ed'", isCorrect: false },
      { text: "Infinitive verb with 'to'", isCorrect: false },
      { text: "Base form of the verb", isCorrect: false }
    ],
    explanation: "Progressive aspect always uses auxiliary be + present participle (-ing)."
  },
  {
    text: "'Time' in tense analysis consists of which three major periods?",
    options: [
      { text: "Present, Past, and Future", isCorrect: true },
      { text: "Simple, Compound, and Complex", isCorrect: false },
      { text: "Subject, Verb, and Object", isCorrect: false },
      { text: "Diction, Imagery, and Sound", isCorrect: false }
    ],
    explanation: "Grammatical time is divided into Present, Past, and Future."
  },
  {
    text: "What is the correct Simple Past form of the verb 'sing'?",
    options: [
      { text: "sang", isCorrect: true },
      { text: "sung", isCorrect: false },
      { text: "singed", isCorrect: false },
      { text: "singing", isCorrect: false }
    ],
    explanation: "Simple past of sing is sang; past participle is sung."
  },
  {
    text: "Concord in English grammar is defined as _____.",
    options: [
      { text: "an agreement between the subject and the predicate of the main clause", isCorrect: true },
      { text: "a contrast between main and subordinate clauses", isCorrect: false },
      { text: "the rhyming pattern of poetic stanzas", isCorrect: false },
      { text: "the chronological ordering of historical events", isCorrect: false }
    ],
    explanation: "Concord refers to the grammatical agreement between subject and verb/predicate."
  },
  {
    text: "According to the first rule of Concord, when a singular noun is used in a sentence, _____.",
    options: [
      { text: "a singular verb must be used", isCorrect: true },
      { text: "a plural verb must be used", isCorrect: false },
      { text: "an auxiliary verb is omitted", isCorrect: false },
      { text: "a collective noun is mandatory", isCorrect: false }
    ],
    explanation: "Rule 1 of Concord states: Singular subject takes a singular verb (e.g., 'The boy is good')."
  },
  {
    text: "Which sentence correctly illustrates the first rule of Concord?",
    options: [
      { text: "The boy is good.", isCorrect: true },
      { text: "The boy are good.", isCorrect: false },
      { text: "The boys is good.", isCorrect: false },
      { text: "The boy have good.", isCorrect: false }
    ],
    explanation: "'The boy' (singular noun) agrees with 'is' (singular verb)."
  },
  {
    text: "The second rule of Concord states that if you use a plural noun, you must use a _____.",
    options: [
      { text: "plural verb", isCorrect: true },
      { text: "singular verb", isCorrect: false },
      { text: "subordinating conjunction", isCorrect: false },
      { text: "singular pronoun", isCorrect: false }
    ],
    explanation: "Rule 2 of Concord states: Plural subject requires a plural verb."
  },
  {
    text: "Which type of concord applies when correlatives like 'either...or' or 'neither...nor' are used?",
    options: [
      { text: "Proximity Concord", isCorrect: true },
      { text: "Grammatical Concord", isCorrect: false },
      { text: "Notional Concord", isCorrect: false },
      { text: "Poetic Concord", isCorrect: false }
    ],
    explanation: "Proximity Concord dictates that the verb agrees with the subject closest to it."
  },
  {
    text: "In Proximity Concord, complete the sentence: 'Either the student or the teacher _____ coming.'",
    options: [
      { text: "is", isCorrect: true },
      { text: "are", isCorrect: false },
      { text: "were", isCorrect: false },
      { text: "have", isCorrect: false }
    ],
    explanation: "The verb is closest to 'the teacher' (singular), so singular verb 'is' is used."
  },
  {
    text: "In Proximity Concord, complete the sentence: 'Either the teacher or the students _____ coming.'",
    options: [
      { text: "are", isCorrect: true },
      { text: "is", isCorrect: false },
      { text: "was", isCorrect: false },
      { text: "has", isCorrect: false }
    ],
    explanation: "The verb is closest to 'the students' (plural), so plural verb 'are' is used."
  },
  {
    text: "Choose the correct verb under Proximity Concord: 'Neither the teacher nor the students _____ the ball.'",
    options: [
      { text: "kick", isCorrect: true },
      { text: "kicks", isCorrect: false },
      { text: "kicking", isCorrect: false },
      { text: "is kick", isCorrect: false }
    ],
    explanation: "'the students' is plural and closest to the verb, so plural verb 'kick' is correct."
  },
  {
    text: "What type of concord operates when collective nouns (e.g. army, committee, class) dictate verb agreement based on meaning?",
    options: [
      { text: "Notional Concord", isCorrect: true },
      { text: "Proximity Concord", isCorrect: false },
      { text: "Grammatical Concord", isCorrect: false },
      { text: "Structural Concord", isCorrect: false }
    ],
    explanation: "Notional Concord bases agreement on the idea/meaning (notion) rather than strict grammatical form."
  },
  {
    text: "All of the following are recognized types of concord in GNS 302 EXCEPT _____.",
    options: [
      { text: "Dialectal Concord", isCorrect: true },
      { text: "Grammatical Concord", isCorrect: false },
      { text: "Proximity Concord", isCorrect: false },
      { text: "Notional Concord", isCorrect: false }
    ],
    explanation: "The three main types taught in GNS 302 are Grammatical, Proximity, and Notional Concord."
  },
  {
    text: "In Notional Concord, collective nouns include examples such as _____.",
    options: [
      { text: "army, committee, class", isCorrect: true },
      { text: "teacher, student, boy", isCorrect: false },
      { text: "either, neither, or", isCorrect: false },
      { text: "because, since, although", isCorrect: false }
    ],
    explanation: "Army, committee, and class are standard collective nouns."
  },
  {
    text: "Choose the correct sentence following Proximity Concord:",
    options: [
      { text: "Neither John nor his brothers were present.", isCorrect: true },
      { text: "Neither John nor his brothers was present.", isCorrect: false },
      { text: "Neither John nor his brothers is present.", isCorrect: false },
      { text: "Neither John nor his brothers has present.", isCorrect: false }
    ],
    explanation: "The verb is closest to 'his brothers' (plural), requiring plural verb 'were'."
  },
  {
    text: "Which statement best describes Grammatical Concord?",
    options: [
      { text: "Singular subject takes singular verb, and plural subject takes plural verb.", isCorrect: true },
      { text: "The verb agrees strictly with the nearest subject regardless of main subject.", isCorrect: false },
      { text: "The verb agrees with the speaker's emotional state.", isCorrect: false },
      { text: "The subject is omitted in favor of an imperative verb.", isCorrect: false }
    ],
    explanation: "Grammatical Concord is the basic rule: singular subject -> singular verb, plural subject -> plural verb."
  },
  {
    text: "Identify the correct usage: 'The committee _____ divided in their decisions.'",
    options: [
      { text: "are", isCorrect: true },
      { text: "is", isCorrect: false },
      { text: "was", isCorrect: false },
      { text: "has", isCorrect: false }
    ],
    explanation: "When members of a collective noun act individually (divided), Notional Concord takes a plural verb."
  },
  {
    text: "Identify the correct usage: 'The committee _____ agreed on a single proposal.'",
    options: [
      { text: "has", isCorrect: true },
      { text: "have", isCorrect: false },
      { text: "were", isCorrect: false },
      { text: "are", isCorrect: false }
    ],
    explanation: "When a collective noun acts as a unified body, Notional Concord takes a singular verb ('has')."
  },
  {
    text: "Logic is defined in philosophy as the branch that deals with _____.",
    options: [
      { text: "analyzing, codifying, and systematizing principles used in evaluating evidence in a given argument", isCorrect: true },
      { text: "studying the biological development of the human brain", isCorrect: false },
      { text: "writing fictional stories about ancient heroes", isCorrect: false },
      { text: "composing rhymed poetry for public performance", isCorrect: false }
    ],
    explanation: "This is the precise formal definition of Logic in philosophy from GNS 302 notes."
  },
  {
    text: "Why is logic referred to as the science of the principles of correct reasoning?",
    options: [
      { text: "It is systematic, follows laid down rules, and classifies arguments into valid or invalid", isCorrect: true },
      { text: "It relies exclusively on emotional feelings and subjective personal tastes", isCorrect: false },
      { text: "It only applies to mathematical calculations", isCorrect: false },
      { text: "It is an unwritten oral tradition without fixed rules", isCorrect: false }
    ],
    explanation: "Logic is a science because it is systematic, rule-based, data-driven, and distinguishes valid from invalid reasoning."
  },
  {
    text: "In logic, inferences are drawn from established statements known as _____.",
    options: [
      { text: "premises", isCorrect: true },
      { text: "fallacies", isCorrect: false },
      { text: "stanzas", isCorrect: false },
      { text: "meters", isCorrect: false }
    ],
    explanation: "Premises are the foundational statements or evidence from which conclusions/inferences are drawn."
  },
  {
    text: "What is a 'Fact'?",
    options: [
      { text: "A statement that portrays reality and can be tested and verified", isCorrect: true },
      { text: "A subjective belief based on personal bias", isCorrect: false },
      { text: "An unproven assumption about the future", isCorrect: false },
      { text: "A literary device used in dramatic plays", isCorrect: false }
    ],
    explanation: "A fact is a statement depicting reality that is known/believed true and verifiable."
  },
  {
    text: "Through which three methods can a statement of fact be tested and verified?",
    options: [
      { text: "Experiment, Calculation, and Observation", isCorrect: true },
      { text: "Brainstorming, Drafting, and Revision", isCorrect: false },
      { text: "Prose, Drama, and Poetry", isCorrect: false },
      { text: "Diction, Imagery, and Sound", isCorrect: false }
    ],
    explanation: "Facts are tested and verified via Experiment, Calculation, and Observation."
  },
  {
    text: "Qualities that a statement must possess to be accepted as a fact include all of the following EXCEPT _____.",
    options: [
      { text: "Subjective personal bias", isCorrect: true },
      { text: "Relevance", isCorrect: false },
      { text: "Truth and Proof", isCorrect: false },
      { text: "Universal acceptability", isCorrect: false }
    ],
    explanation: "Bias belongs to opinions, not objective facts."
  },
  {
    text: "Which Principle of Logic asserts that every statement should have a truth value (a statement is identical to itself)?",
    options: [
      { text: "Principle of Identity", isCorrect: true },
      { text: "Principle of Contradiction", isCorrect: false },
      { text: "Principle of Excluded Middle", isCorrect: false },
      { text: "Principle of Syllogism", isCorrect: false }
    ],
    explanation: "The Principle of Identity asserts that every statement or proposition is identical to itself and holds a truth value."
  },
  {
    text: "Which Principle of Logic ensures that there is no contradiction because the acceptance of truth is the denial of falsehood?",
    options: [
      { text: "Principle of Contradiction", isCorrect: true },
      { text: "Principle of Identity", isCorrect: false },
      { text: "Principle of Excluded Middle", isCorrect: false },
      { text: "Principle of Proximity", isCorrect: false }
    ],
    explanation: "The Principle of Contradiction states that a proposition cannot be both true and false at the same time."
  },
  {
    text: "Which Principle of Logic asserts that a proposition is either true or false with no middle ground?",
    options: [
      { text: "Principle of Excluded Middle", isCorrect: true },
      { text: "Principle of Identity", isCorrect: false },
      { text: "Principle of Contradiction", isCorrect: false },
      { text: "Principle of Diction", isCorrect: false }
    ],
    explanation: "The Principle of Excluded Middle states there is no third or middle option between true and false."
  },
  {
    text: "How is an 'Opinion' defined according to Hornby (1996)?",
    options: [
      { text: "A belief or judgement not founded on proof or complete knowledge", isCorrect: true },
      { text: "A statement verified through scientific calculation", isCorrect: false },
      { text: "A universal truth accepted by all humans", isCorrect: false },
      { text: "A 14-line poem written in iambic pentameter", isCorrect: false }
    ],
    explanation: "Hornby (1996) defines opinion as a belief or judgement not founded on proof or complete knowledge."
  },
  {
    text: "Why are opinions described as subjective rather than objective?",
    options: [
      { text: "They reflect personal taste, social background, cultural differences, and bias", isCorrect: true },
      { text: "They can be calculated using mathematical formulas", isCorrect: false },
      { text: "They are universally accepted by all scientific bodies", isCorrect: false },
      { text: "They strictly adhere to the Principle of Contradiction", isCorrect: false }
    ],
    explanation: "Opinions stem from personal nurture, background, and perspective, making them subjective."
  },
  {
    text: "Which of the following statements is a FACT?",
    options: [
      { text: "Water consists of hydrogen and oxygen molecules.", isCorrect: true },
      { text: "Software Development is the most enjoyable course in the world.", isCorrect: false },
      { text: "Blue is the prettiest color for a classroom wall.", isCorrect: false },
      { text: "Rainy days are depressing.", isCorrect: false }
    ],
    explanation: "This is a scientifically verifiable statement of fact."
  },
  {
    text: "Which of the following statements is an OPINION?",
    options: [
      { text: "Pizza is the most delicious food ever created.", isCorrect: true },
      { text: "The polytechnic is an educational institution.", isCorrect: false },
      { text: "GNS 302 covers logic and communication skills.", isCorrect: false },
      { text: "Human beings require oxygen to survive.", isCorrect: false }
    ],
    explanation: "Deliciousness is a subjective personal taste (opinion)."
  },
  {
    text: "The three core principles of logic taught in GNS 302 are _____.",
    options: [
      { text: "Principle of Identity, Principle of Contradiction, and Principle of Excluded Middle", isCorrect: true },
      { text: "Principle of Simple, Compound, and Complex", isCorrect: false },
      { text: "Principle of Prose, Drama, and Poetry", isCorrect: false },
      { text: "Principle of Subject, Predicate, and Concord", isCorrect: false }
    ],
    explanation: "These are the three fundamental laws of thought/logic."
  },
  {
    text: "Can an opinion be verified by objective scientific standards?",
    options: [
      { text: "No, because it reflects personal taste and bias rather than objective proof", isCorrect: true },
      { text: "Yes, always through laboratory experimentation", isCorrect: false },
      { text: "Yes, using mathematical calculations", isCorrect: false },
      { text: "Only if written in an essay conclusion", isCorrect: false }
    ],
    explanation: "Opinions cannot be verified by objective standards because they lack objective proof."
  },
  {
    text: "A statement that complies with the three principles of logic and is proven true universally possesses which quality?",
    options: [
      { text: "Factuality / Truth", isCorrect: true },
      { text: "Poetic Diction", isCorrect: false },
      { text: "Subordinate Clause", isCorrect: false },
      { text: "Grammatical Concord", isCorrect: false }
    ],
    explanation: "Possessing universal acceptability and logical proof makes a statement a fact."
  },
  {
    text: "Which method of verifying facts involves performing controlled scientific tests?",
    options: [
      { text: "Experimentation", isCorrect: true },
      { text: "Observation", isCorrect: false },
      { text: "Calculation", isCorrect: false },
      { text: "Opinion", isCorrect: false }
    ],
    explanation: "Controlled laboratory testing is experimentation."
  },
  {
    text: "An argument that moves from specific observations to a general conclusion is called _____.",
    options: [
      { text: "Inductive Argument", isCorrect: true },
      { text: "Deductive Argument", isCorrect: false },
      { text: "Syllogistic Argument", isCorrect: false },
      { text: "Declarative Argument", isCorrect: false }
    ],
    explanation: "Inductive arguments generalize from specific observations."
  },
  {
    text: "An argument that moves from general premises to a specific conclusion is called _____.",
    options: [
      { text: "Deductive Argument", isCorrect: true },
      { text: "Inductive Argument", isCorrect: false },
      { text: "Exclamatory Argument", isCorrect: false },
      { text: "Imperative Argument", isCorrect: false }
    ],
    explanation: "Deductive arguments derive specific conclusions guaranteed by premises."
  },
  {
    text: "What structure in deductive reasoning contains a Major Premise, a Minor Premise, and a Conclusion?",
    options: [
      { text: "Syllogism", isCorrect: true },
      { text: "Sonnet", isCorrect: false },
      { text: "Concord", isCorrect: false },
      { text: "Memorandum", isCorrect: false }
    ],
    explanation: "A Syllogism is a formal 3-part deductive reasoning argument."
  },
  {
    text: "Inductive arguments can sometimes be defective because of _____.",
    options: [
      { text: "insufficient data or a biased sample", isCorrect: true },
      { text: "too many valid facts", isCorrect: false },
      { text: "excessive mathematical accuracy", isCorrect: false },
      { text: "following the Principle of Identity", isCorrect: false }
    ],
    explanation: "Flawed or unrepresentative observations weaken inductive generalizations."
  },
  {
    text: "Which essay type tells a story from personal experience and is normally written in the past tense?",
    options: [
      { text: "Narrative Essay", isCorrect: true },
      { text: "Descriptive Essay", isCorrect: false },
      { text: "Expository Essay", isCorrect: false },
      { text: "Argumentative Essay", isCorrect: false }
    ],
    explanation: "Narrative essays recount events or personal experiences, usually in chronological past tense."
  },
  {
    text: "Which type of essay gives a vivid mental picture of a person, place, or event?",
    options: [
      { text: "Descriptive Essay", isCorrect: true },
      { text: "Narrative Essay", isCorrect: false },
      { text: "Expository Essay", isCorrect: false },
      { text: "Argumentative Essay", isCorrect: false }
    ],
    explanation: "Descriptive essays paint a detailed mental picture using sensory details."
  },
  {
    text: "Which type of essay explains a concept, process, or topic objectively?",
    options: [
      { text: "Expository Essay", isCorrect: true },
      { text: "Argumentative Essay", isCorrect: false },
      { text: "Narrative Essay", isCorrect: false },
      { text: "Descriptive Essay", isCorrect: false }
    ],
    explanation: "Expository essays expose, explain, or inform about a topic clearly and objectively."
  },
  {
    text: "Which type of essay takes a definite stand and uses facts and logical points to convince or persuade the reader?",
    options: [
      { text: "Argumentative Essay", isCorrect: true },
      { text: "Narrative Essay", isCorrect: false },
      { text: "Descriptive Essay", isCorrect: false },
      { text: "Expository Essay", isCorrect: false }
    ],
    explanation: "Argumentative essays present a clear stance and persuade readers using evidence."
  },
  {
    text: "Literature is distinguished from other forms of printed writing (such as computer science or history text) primarily by its _____.",
    options: [
      { text: "literary value, imagination, and artistic methods attached to it", isCorrect: true },
      { text: "use of mathematical calculations", isCorrect: false },
      { text: "exclusive reliance on true facts", isCorrect: false },
      { text: "lack of sentence structure", isCorrect: false }
    ],
    explanation: "Literature creates its own world through imaginative interpretation and aesthetic literary value."
  },
  {
    text: "What are the three main genres or branches of Literature in English?",
    options: [
      { text: "Prose, Drama, and Poetry", isCorrect: true },
      { text: "Narrative, Descriptive, and Expository", isCorrect: false },
      { text: "Simple, Complex, and Compound", isCorrect: false },
      { text: "Diction, Imagery, and Rhythm", isCorrect: false }
    ],
    explanation: "The three primary genres of literature are Prose, Drama, and Poetry."
  },
  {
    text: "A writer of dramatic plays is called a _____, while a writer of poems is called a _____.",
    options: [
      { text: "Dramatist / Playwright; Poet", isCorrect: true },
      { text: "Prose writer; Novelist", isCorrect: false },
      { text: "Essayist; Biographer", isCorrect: false },
      { text: "Philosopher; Logician", isCorrect: false }
    ],
    explanation: "Drama is written by a Dramatist/Playwright; Poetry is written by a Poet."
  },
  {
    text: "How did William Wordsworth define Poetry?",
    options: [
      { text: "The spontaneous overflow of powerful feelings recollected in tranquility", isCorrect: true },
      { text: "A piece of writing arranged in sequential order to convince an audience", isCorrect: false },
      { text: "A strict mathematical calculation of human emotion", isCorrect: false },
      { text: "A 3-part syllogism composed of major and minor premises", isCorrect: false }
    ],
    explanation: "Wordsworth famous definition states poetry is 'the spontaneous overflow of powerful feelings recollected in tranquility'."
  },
  {
    text: "Match the poetic type: A 14-line poem that often ends with rhyming couplets is a _____.",
    options: [
      { text: "Sonnet", isCorrect: true },
      { text: "Lyric", isCorrect: false },
      { text: "Ballad", isCorrect: false },
      { text: "Epic", isCorrect: false }
    ],
    explanation: "A Sonnet is strictly a 14-line poem."
  },
  {
    text: "A dignified poem written to mourn the death of someone is called an _____.",
    options: [
      { text: "Elegy", isCorrect: true },
      { text: "Ode", isCorrect: false },
      { text: "Epic", isCorrect: false },
      { text: "Lyric", isCorrect: false }
    ],
    explanation: "An Elegy is a mournful, meditative poem lamenting a death."
  },
  {
    text: "In poetry terminologies, what is 'Diction'?",
    options: [
      { text: "The choice and use of words by the poet", isCorrect: true },
      { text: "The regular beat or pulse of a poem", isCorrect: false },
      { text: "The 14-line structure of a sonnet", isCorrect: false },
      { text: "The figurative picture beyond literal meaning", isCorrect: false }
    ],
    explanation: "Diction refers specifically to word choice and vocabulary selection in literature."
  },
  {
    text: "What is the primary function of a Paragraph in essay writing?",
    options: [
      { text: "To develop a single central idea or topic sentence", isCorrect: true },
      { text: "To list all references used in the essay", isCorrect: false },
      { text: "To end the entire essay", isCorrect: false },
      { text: "To write a rhymed poem", isCorrect: false }
    ],
    explanation: "Each paragraph focuses on developing one clear central topic sentence."
  },
  {
    text: "What are the three main stages of Essay Writing?",
    options: [
      { text: "Preparation, Drafting, and Revision", isCorrect: true },
      { text: "Introduction, Body, and Conclusion", isCorrect: false },
      { text: "Prose, Drama, and Poetry", isCorrect: false },
      { text: "Simple, Compound, and Complex", isCorrect: false }
    ],
    explanation: "The writing process spans Preparation (Planning), Drafting, and Revision (Editing)."
  },
  {
    text: "What are the three essential structural sections of an Essay?",
    options: [
      { text: "Introduction, Body, and Conclusion", isCorrect: true },
      { text: "Preparation, Drafting, and Revision", isCorrect: false },
      { text: "Major Premise, Minor Premise, and Conclusion", isCorrect: false },
      { text: "Heading, Salutation, and Signature", isCorrect: false }
    ],
    explanation: "An essay comprises an Introduction, Body paragraphs, and a Conclusion."
  },
  {
    text: "How did Samuel Taylor Coleridge describe Poetry?",
    options: [
      { text: "The communication of pleasure through the medium of rhythm and beauty", isCorrect: true },
      { text: "A strict scientific report based on empirical evidence", isCorrect: false },
      { text: "The spontaneous overflow of powerful feelings", isCorrect: false },
      { text: "A memo circulating within an organization", isCorrect: false }
    ],
    explanation: "Coleridge defined poetry as communicating pleasure via rhythm, emotion, and aesthetic beauty."
  },
  {
    text: "A poem that narrates a story, usually arranged in short stanzas and sung orally, is a _____.",
    options: [
      { text: "Ballad", isCorrect: true },
      { text: "Sonnet", isCorrect: false },
      { text: "Elegy", isCorrect: false },
      { text: "Ode", isCorrect: false }
    ],
    explanation: "A Ballad is a narrative poem intended to be sung or recited."
  },
  {
    text: "An extensive, grand poem celebrating heroic deeds and historical adventures is an _____.",
    options: [
      { text: "Epic", isCorrect: true },
      { text: "Elegy", isCorrect: false },
      { text: "Sonnet", isCorrect: false },
      { text: "Lyric", isCorrect: false }
    ],
    explanation: "An Epic is a long narrative poem recounting monumental heroic acts (e.g. *The Iliad*)."
  },
  {
    text: "In poetry, language that creates sensory pictures in the reader's mind is known as _____.",
    options: [
      { text: "Imagery", isCorrect: true },
      { text: "Meter", isCorrect: false },
      { text: "Rhyme", isCorrect: false },
      { text: "Rhythm", isCorrect: false }
    ],
    explanation: "Imagery appeals to sensory perception to build mental images."
  },
  {
    text: "What term describes the musical pattern or recurrence of stressed and unstressed beats in a poem?",
    options: [
      { text: "Rhythm and Meter", isCorrect: true },
      { text: "Diction", isCorrect: false },
      { text: "Imagery", isCorrect: false },
      { text: "Syntax", isCorrect: false }
    ],
    explanation: "Rhythm/Meter governs the acoustic flow and beat in poetry."
  },
  {
    text: "In J.P. Clark's poem 'Ibadan', what imagery does the poet use to describe the city seen from seven hills?",
    options: [
      { text: "A running splash of rust and gold, flung and scattered among seven hills", isCorrect: true },
      { text: "A peaceful green forest under a calm blue sky", isCorrect: false },
      { text: "A towering industrial metropolis made of glass and steel", isCorrect: false },
      { text: "A solitary ship sailing on a stormy sea", isCorrect: false }
    ],
    explanation: "J.P. Clark famously depicts Ibadan as 'running splash of rust and gold...'."
  }
];

// PART 2: 150 Exam Questions
const questions150 = [
  {
    text: "Communication is best defined as the:",
    options: [
      { text: "Exchange of goods", isCorrect: false },
      { text: "Process of sending and receiving information", isCorrect: true },
      { text: "Ability to write letters", isCorrect: false },
      { text: "Use of computers", isCorrect: false }
    ],
    explanation: "Communication is fundamental to exchanging information and establishing mutual understanding."
  },
  {
    text: "Which of the following is NOT an element of communication?",
    options: [
      { text: "Sender", isCorrect: false },
      { text: "Receiver", isCorrect: false },
      { text: "Feedback", isCorrect: false },
      { text: "Examination", isCorrect: true }
    ],
    explanation: "Examination is an evaluation method, not a core component of the communication model."
  },
  {
    text: "The response given by the receiver is known as:",
    options: [
      { text: "Noise", isCorrect: false },
      { text: "Feedback", isCorrect: true },
      { text: "Encoding", isCorrect: false },
      { text: "Medium", isCorrect: false }
    ],
    explanation: "Feedback confirms whether the message was understood as intended."
  },
  {
    text: "Which type of communication uses body language?",
    options: [
      { text: "Written", isCorrect: false },
      { text: "Oral", isCorrect: false },
      { text: "Non-verbal", isCorrect: true },
      { text: "Visual", isCorrect: false }
    ],
    explanation: "Non-verbal communication includes gestures, postures, and body movements."
  },
  {
    text: "The process of putting ideas into words or symbols is called:",
    options: [
      { text: "Decoding", isCorrect: false },
      { text: "Encoding", isCorrect: true },
      { text: "Feedback", isCorrect: false },
      { text: "Listening", isCorrect: false }
    ],
    explanation: "Encoding is converting thoughts into transferable signs, symbols, or words."
  },
  {
    text: "Which of the following is a barrier to effective communication?",
    options: [
      { text: "Feedback", isCorrect: false },
      { text: "Noise", isCorrect: true },
      { text: "Clarity", isCorrect: false },
      { text: "Accuracy", isCorrect: false }
    ],
    explanation: "Noise is anything that distorts, interrupts, or impedes signal transmission."
  },
  {
    text: "A memorandum is used mainly for:",
    options: [
      { text: "International communication", isCorrect: false },
      { text: "Internal communication", isCorrect: true },
      { text: "Personal letters", isCorrect: false },
      { text: "Newspaper publication", isCorrect: false }
    ],
    explanation: "Memos circulate within an organization among colleagues and departments."
  },
  {
    text: "The heading of a memorandum usually contains:",
    options: [
      { text: "From, To, Date and Subject", isCorrect: true },
      { text: "Introduction and Conclusion", isCorrect: false },
      { text: "References only", isCorrect: false },
      { text: "Signature only", isCorrect: false }
    ],
    explanation: "Standard memo format includes TO, FROM, DATE, and SUBJECT lines."
  },
  {
    text: "Which of these is an example of upward communication?",
    options: [
      { text: "Principal to teacher", isCorrect: false },
      { text: "Manager to staff", isCorrect: false },
      { text: "Student to Head of Department", isCorrect: true },
      { text: "Government to citizens", isCorrect: false }
    ],
    explanation: "Upward communication flows from lower to higher levels in a hierarchy."
  },
  {
    text: "The official record of a meeting is called:",
    options: [
      { text: "Agenda", isCorrect: false },
      { text: "Minutes", isCorrect: true },
      { text: "Circular", isCorrect: false },
      { text: "Memo", isCorrect: false }
    ],
    explanation: "Minutes document decisions, actions, and discussions held during a meeting."
  },
  {
    text: "The person responsible for writing the minutes is the:",
    options: [
      { text: "Chairman", isCorrect: false },
      { text: "Secretary", isCorrect: true },
      { text: "Treasurer", isCorrect: false },
      { text: "Auditor", isCorrect: false }
    ],
    explanation: "The secretary records official proceedings and drafts meeting minutes."
  },
  {
    text: "A business letter should be:",
    options: [
      { text: "Informal", isCorrect: false },
      { text: "Clear and concise", isCorrect: true },
      { text: "Emotional", isCorrect: false },
      { text: "Humorous", isCorrect: false }
    ],
    explanation: "Business correspondence demands brevity, clarity, and professionalism."
  },
  {
    text: "Which of these is NOT a type of report?",
    options: [
      { text: "Progress report", isCorrect: false },
      { text: "Incident report", isCorrect: false },
      { text: "Laboratory report", isCorrect: false },
      { text: "Love letter", isCorrect: true }
    ],
    explanation: "Personal notes like love letters are not formal objective business reports."
  },
  {
    text: "The purpose of a report is to:",
    options: [
      { text: "Entertain readers", isCorrect: false },
      { text: "Present factual information", isCorrect: true },
      { text: "Advertise products", isCorrect: false },
      { text: "Tell stories", isCorrect: false }
    ],
    explanation: "Reports objectively present data, findings, and analysis."
  },
  {
    text: "Which of the following is NOT a feature of effective communication?",
    options: [
      { text: "Clarity", isCorrect: false },
      { text: "Completeness", isCorrect: false },
      { text: "Ambiguity", isCorrect: true },
      { text: "Correctness", isCorrect: false }
    ],
    explanation: "Ambiguity leads to confusion and misinterpretation."
  },
  {
    text: "Which communication channel is written?",
    options: [
      { text: "Telephone", isCorrect: false },
      { text: "Face-to-face discussion", isCorrect: false },
      { text: "Email", isCorrect: true },
      { text: "Television", isCorrect: false }
    ],
    explanation: "Email is a digital written communication channel."
  },
  {
    text: "\"Yours faithfully\" is used when:",
    options: [
      { text: "You know the recipient's name", isCorrect: false },
      { text: "You do not know the recipient's name", isCorrect: true },
      { text: "Writing to a friend", isCorrect: false },
      { text: "Writing a memo", isCorrect: false }
    ],
    explanation: "Use 'Yours faithfully' when opening with 'Dear Sir/Madam'."
  },
  {
    text: "Which of the following is a formal means of communication?",
    options: [
      { text: "WhatsApp chat with a friend", isCorrect: false },
      { text: "Business letter", isCorrect: true },
      { text: "Gossip", isCorrect: false },
      { text: "Casual conversation", isCorrect: false }
    ],
    explanation: "Business letters follow established organizational standards and records."
  },
  {
    text: "A circular letter is intended for:",
    options: [
      { text: "One person", isCorrect: false },
      { text: "A selected few", isCorrect: false },
      { text: "Many people at the same time", isCorrect: true },
      { text: "Family members only", isCorrect: false }
    ],
    explanation: "Circulars distribute mass notifications to large target groups."
  },
  {
    text: "The first stage of communication is:",
    options: [
      { text: "Feedback", isCorrect: false },
      { text: "Encoding the message", isCorrect: true },
      { text: "Receiving the message", isCorrect: false },
      { text: "Decoding", isCorrect: false }
    ],
    explanation: "Communication starts when the sender encodes an idea into a message."
  },
  {
    text: "Which of the following is NOT a form of non-verbal communication?",
    options: [
      { text: "Eye contact", isCorrect: false },
      { text: "Gestures", isCorrect: false },
      { text: "Letter writing", isCorrect: true },
      { text: "Facial expressions", isCorrect: false }
    ],
    explanation: "Letter writing uses written words, making it verbal communication."
  },
  {
    text: "Which of these is the best definition of listening?",
    options: [
      { text: "Hearing sounds only", isCorrect: false },
      { text: "Paying attention to understand a message", isCorrect: true },
      { text: "Speaking loudly", isCorrect: false },
      { text: "Reading silently", isCorrect: false }
    ],
    explanation: "Listening is an active cognitive process of interpreting sound."
  },
  {
    text: "Which of the following is NOT part of a formal report?",
    options: [
      { text: "Title", isCorrect: false },
      { text: "Findings", isCorrect: false },
      { text: "Recommendations", isCorrect: false },
      { text: "Birthday wishes", isCorrect: true }
    ],
    explanation: "Personal greetings are excluded from formal business report structures."
  },
  {
    text: "Communication between colleagues of the same rank is called:",
    options: [
      { text: "Upward communication", isCorrect: false },
      { text: "Downward communication", isCorrect: false },
      { text: "Horizontal communication", isCorrect: true },
      { text: "External communication", isCorrect: false }
    ],
    explanation: "Horizontal (lateral) communication takes place between peers of equal status."
  },
  {
    text: "Which of the following is an example of external communication?",
    options: [
      { text: "Staff meeting", isCorrect: false },
      { text: "Memo to employees", isCorrect: false },
      { text: "Letter to a customer", isCorrect: true },
      { text: "Conversation between classmates", isCorrect: false }
    ],
    explanation: "External communication occurs between organization members and outside parties."
  },
  {
    text: "The communication process begins with the:",
    options: [
      { text: "Receiver", isCorrect: false },
      { text: "Sender", isCorrect: true },
      { text: "Feedback", isCorrect: false },
      { text: "Channel", isCorrect: false }
    ],
    explanation: "The sender conceptualizes and initiates the communication flow."
  },
  {
    text: "Which of the following is the most suitable channel for communicating urgent official information?",
    options: [
      { text: "Telephone call", isCorrect: true },
      { text: "Notice board", isCorrect: false },
      { text: "Newspaper", isCorrect: false },
      { text: "Circular", isCorrect: false }
    ],
    explanation: "Telephone calls deliver immediate real-time feedback for urgent matters."
  },
  {
    text: "A message that is not clearly understood due to ambiguous words suffers from:",
    options: [
      { text: "Physical barrier", isCorrect: false },
      { text: "Semantic barrier", isCorrect: true },
      { text: "Psychological barrier", isCorrect: false },
      { text: "Cultural barrier", isCorrect: false }
    ],
    explanation: "Semantic barriers involve confusion over word meanings, jargon, or vague phrasing."
  },
  {
    text: "Which of the following is an example of horizontal communication?",
    options: [
      { text: "Lecturer to HOD", isCorrect: false },
      { text: "Student to Lecturer", isCorrect: false },
      { text: "Staff to Staff of the same rank", isCorrect: true },
      { text: "Registrar to Students", isCorrect: false }
    ],
    explanation: "Peer-to-peer discussions within the same organizational tier are horizontal."
  },
  {
    text: "The major purpose of feedback is to:",
    options: [
      { text: "Delay communication", isCorrect: false },
      { text: "Confirm understanding", isCorrect: true },
      { text: "Create noise", isCorrect: false },
      { text: "End communication", isCorrect: false }
    ],
    explanation: "Feedback tells the sender whether the receiver correctly understood the message."
  },
  {
    text: "Which of the following is NOT a feature of a good report?",
    options: [
      { text: "Accuracy", isCorrect: false },
      { text: "Objectivity", isCorrect: false },
      { text: "Bias", isCorrect: true },
      { text: "Clarity", isCorrect: false }
    ],
    explanation: "Good reports avoid subjective personal bias and present factual analysis."
  },
  {
    text: "The agenda of a meeting is prepared before the meeting in order to:",
    options: [
      { text: "Record attendance", isCorrect: false },
      { text: "Guide the discussion", isCorrect: true },
      { text: "Elect officers", isCorrect: false },
      { text: "Take minutes", isCorrect: false }
    ],
    explanation: "An agenda outlines topics in advance to direct orderly proceedings."
  },
  {
    text: "The officer responsible for calling a meeting is usually the:",
    options: [
      { text: "Secretary", isCorrect: false },
      { text: "Chairman", isCorrect: true },
      { text: "Auditor", isCorrect: false },
      { text: "Treasurer", isCorrect: false }
    ],
    explanation: "The Chairman holds authority to convene and direct formal meetings."
  },
  {
    text: "Which of the following is NOT a component of a business letter?",
    options: [
      { text: "Salutation", isCorrect: false },
      { text: "Complimentary close", isCorrect: false },
      { text: "Abstract", isCorrect: true },
      { text: "Date", isCorrect: false }
    ],
    explanation: "Abstracts belong in academic papers, not business letters."
  },
  {
    text: "\"Dear Sir/Madam\" is an example of:",
    options: [
      { text: "Complimentary close", isCorrect: false },
      { text: "Salutation", isCorrect: true },
      { text: "Heading", isCorrect: false },
      { text: "Subscription", isCorrect: false }
    ],
    explanation: "Salutation is the formal opening greeting of a letter."
  },
  {
    text: "Which of the following is the most formal closing?",
    options: [
      { text: "Cheers", isCorrect: false },
      { text: "Yours faithfully", isCorrect: true },
      { text: "Best wishes", isCorrect: false },
      { text: "Thanks", isCorrect: false }
    ],
    explanation: "'Yours faithfully' is standard formal convention when name is unknown."
  },
  {
    text: "A memorandum is usually addressed to:",
    options: [
      { text: "Members of the public", isCorrect: false },
      { text: "Staff within an organization", isCorrect: true },
      { text: "Newspaper readers", isCorrect: false },
      { text: "Customers only", isCorrect: false }
    ],
    explanation: "Memos facilitate internal administrative exchange within an entity."
  },
  {
    text: "Which communication barrier is caused by faulty equipment?",
    options: [
      { text: "Semantic", isCorrect: false },
      { text: "Mechanical", isCorrect: true },
      { text: "Psychological", isCorrect: false },
      { text: "Cultural", isCorrect: false }
    ],
    explanation: "Mechanical barriers stem from technical breakdowns like static phone lines."
  },
  {
    text: "Which of the following is NOT a type of report?",
    options: [
      { text: "Progress report", isCorrect: false },
      { text: "Feasibility report", isCorrect: false },
      { text: "Accident report", isCorrect: false },
      { text: "Greeting report", isCorrect: true }
    ],
    explanation: "Greeting is a social exchange, not a functional business report."
  },
  {
    text: "The primary purpose of minutes is to:",
    options: [
      { text: "Advertise an event", isCorrect: false },
      { text: "Keep an official record of proceedings", isCorrect: true },
      { text: "Entertain participants", isCorrect: false },
      { text: "Punish absent members", isCorrect: false }
    ],
    explanation: "Minutes act as legal and historical records of meeting actions."
  },
  {
    text: "Effective communication should be:",
    options: [
      { text: "Vague", isCorrect: false },
      { text: "Accurate", isCorrect: true },
      { text: "Confusing", isCorrect: false },
      { text: "Emotional", isCorrect: false }
    ],
    explanation: "Accuracy ensures factual reliability and trust in messages."
  },
  {
    text: "Which of the following is an example of non-verbal communication?",
    options: [
      { text: "Email", isCorrect: false },
      { text: "Telephone", isCorrect: false },
      { text: "Facial expression", isCorrect: true },
      { text: "Business letter", isCorrect: false }
    ],
    explanation: "Facial expressions transmit emotional signals without spoken/written words."
  },
  {
    text: "A communication network that flows from management to employees is:",
    options: [
      { text: "Upward communication", isCorrect: false },
      { text: "Downward communication", isCorrect: true },
      { text: "Horizontal communication", isCorrect: false },
      { text: "External communication", isCorrect: false }
    ],
    explanation: "Downward communication originates at superior levels down to subordinates."
  },
  {
    text: "Which of the following best describes formal communication?",
    options: [
      { text: "It follows official channels", isCorrect: true },
      { text: "It is based on rumours", isCorrect: false },
      { text: "It is always verbal", isCorrect: false },
      { text: "It has no structure", isCorrect: false }
    ],
    explanation: "Formal communication follows designated hierarchical paths and rules."
  },
  {
    text: "Which of the following should be avoided in report writing?",
    options: [
      { text: "Facts", isCorrect: false },
      { text: "Logical arrangement", isCorrect: false },
      { text: "Personal bias", isCorrect: true },
      { text: "Recommendations", isCorrect: false }
    ],
    explanation: "Reports must remain neutral, factual, and free from personal prejudice."
  },
  {
    text: "In communication, \"noise\" refers to:",
    options: [
      { text: "Loud music only", isCorrect: false },
      { text: "Any factor that distorts a message", isCorrect: true },
      { text: "A microphone", isCorrect: false },
      { text: "Speaking loudly", isCorrect: false }
    ],
    explanation: "Noise encompasses any psychological, physical, or semantic disturbance."
  },
  {
    text: "Which document is most suitable for informing all staff about a public holiday?",
    options: [
      { text: "Love letter", isCorrect: false },
      { text: "Circular", isCorrect: true },
      { text: "Receipt", isCorrect: false },
      { text: "Invoice", isCorrect: false }
    ],
    explanation: "A circular notice effectively broadcasts general administrative notices."
  },
  {
    text: "Which of the following is a quality of an effective speaker?",
    options: [
      { text: "Speaking without preparation", isCorrect: false },
      { text: "Speaking clearly and confidently", isCorrect: true },
      { text: "Interrupting listeners", isCorrect: false },
      { text: "Using offensive language", isCorrect: false }
    ],
    explanation: "Clear articulation and confidence enhance audience engagement and comprehension."
  },
  {
    text: "Which of these is NOT one of the 7 Cs of effective communication?",
    options: [
      { text: "Clarity", isCorrect: false },
      { text: "Completeness", isCorrect: false },
      { text: "Courtesy", isCorrect: false },
      { text: "Carelessness", isCorrect: true }
    ],
    explanation: "The 7 Cs are Clarity, Conciseness, Completeness, Concrete, Courtesy, Correctness, Consideration."
  },
  {
    text: "The receiver interprets a message through the process known as:",
    options: [
      { text: "Encoding", isCorrect: false },
      { text: "Decoding", isCorrect: true },
      { text: "Feedback", isCorrect: false },
      { text: "Transmission", isCorrect: false }
    ],
    explanation: "Decoding is converting received symbols into understandable thoughts."
  },
  {
    text: "Which of the following is the most appropriate opening for a formal letter?",
    options: [
      { text: "Hello Sir", isCorrect: false },
      { text: "Dear Sir,", isCorrect: true },
      { text: "Hi Boss", isCorrect: false },
      { text: "My Dear Friend", isCorrect: false }
    ],
    explanation: "'Dear Sir,' is a traditional formal salutation."
  },
  {
    text: "The purpose of proofreading is to:",
    options: [
      { text: "Add more pages", isCorrect: false },
      { text: "Correct errors before submission", isCorrect: true },
      { text: "Increase the font size", isCorrect: false },
      { text: "Rewrite the document completely", isCorrect: false }
    ],
    explanation: "Proofreading catches typos, grammar glitches, and formatting mistakes."
  },
  {
    text: "Which of the following is an example of verbal communication?",
    options: [
      { text: "A handshake", isCorrect: false },
      { text: "A telephone conversation", isCorrect: true },
      { text: "A smile", isCorrect: false },
      { text: "A traffic sign", isCorrect: false }
    ],
    explanation: "Telephone conversations rely on spoken words (verbal communication)."
  },
  {
    text: "The best communication is one that is:",
    options: [
      { text: "Long", isCorrect: false },
      { text: "Brief and clear", isCorrect: true },
      { text: "Emotional", isCorrect: false },
      { text: "Difficult to understand", isCorrect: false }
    ],
    explanation: "Concise and unambiguous communication saves time and prevents confusion."
  },
  {
    text: "Which punctuation mark ends a direct question?",
    options: [
      { text: "Full stop (.)", isCorrect: false },
      { text: "Comma (,)", isCorrect: false },
      { text: "Question mark (?)", isCorrect: true },
      { text: "Colon (:)", isCorrect: false }
    ],
    explanation: "Direct interrogative sentences end with a question mark."
  },
  {
    text: "Choose the correctly spelt word.",
    options: [
      { text: "Accomodation", isCorrect: false },
      { text: "Accommodation", isCorrect: true },
      { text: "Acommodation", isCorrect: false },
      { text: "Accommondation", isCorrect: false }
    ],
    explanation: "Accommodation has double 'c' and double 'm'."
  },
  {
    text: "Which sentence is grammatically correct?",
    options: [
      { text: "He don't know the answer.", isCorrect: false },
      { text: "He doesn't knows the answer.", isCorrect: false },
      { text: "He doesn't know the answer.", isCorrect: true },
      { text: "He don't knows the answer.", isCorrect: false }
    ],
    explanation: "Third-person singular 'He' takes auxiliary 'does not' + base verb 'know'."
  },
  {
    text: "The plural of \"Curriculum\" is:",
    options: [
      { text: "Curriculums", isCorrect: false },
      { text: "Curricula", isCorrect: true },
      { text: "Curriculums", isCorrect: false },
      { text: "Curriculae", isCorrect: false }
    ],
    explanation: "Latin-derived noun ending in '-um' becomes '-a' in plural form."
  },
  {
    text: "Which word is opposite in meaning to \"Scarcity\"?",
    options: [
      { text: "Poverty", isCorrect: false },
      { text: "Abundance", isCorrect: true },
      { text: "Famine", isCorrect: false },
      { text: "Shortage", isCorrect: false }
    ],
    explanation: "Abundance means plentiful supply, the antonym of scarcity."
  },
  {
    text: "A good speaker should:",
    options: [
      { text: "Ignore the audience", isCorrect: false },
      { text: "Maintain eye contact", isCorrect: true },
      { text: "Speak as fast as possible", isCorrect: false },
      { text: "Avoid preparation", isCorrect: false }
    ],
    explanation: "Eye contact builds rapport and maintains audience engagement."
  },
  {
    text: "Which of these is a formal source of information?",
    options: [
      { text: "Rumour", isCorrect: false },
      { text: "Gossip", isCorrect: false },
      { text: "Official memo", isCorrect: true },
      { text: "Hearsay", isCorrect: false }
    ],
    explanation: "Official memos are authoritative written organizational communications."
  },
  {
    text: "Which is the correct passive form of \"The lecturer marked the scripts\"?",
    options: [
      { text: "The scripts marked the lecturer.", isCorrect: false },
      { text: "The scripts were marked by the lecturer.", isCorrect: true },
      { text: "The lecturer was marked by the scripts.", isCorrect: false },
      { text: "The scripts are marking the lecturer.", isCorrect: false }
    ],
    explanation: "Past passive voice takes object 'scripts' + 'were' + past participle 'marked'."
  },
  {
    text: "Which word is a synonym of \"Accurate\"?",
    options: [
      { text: "Correct", isCorrect: true },
      { text: "False", isCorrect: false },
      { text: "Wrong", isCorrect: false },
      { text: "Careless", isCorrect: false }
    ],
    explanation: "Accurate means exact and free from error."
  },
  {
    text: "Which sentence is correctly punctuated?",
    options: [
      { text: "Where are you going.", isCorrect: false },
      { text: "Where are you going?", isCorrect: true },
      { text: "Where are you going!", isCorrect: false },
      { text: "Where are you going,", isCorrect: false }
    ],
    explanation: "Direct questions require a question mark."
  },
  {
    text: "The abbreviation \"e.g.\" means:",
    options: [
      { text: "That is", isCorrect: false },
      { text: "For example", isCorrect: true },
      { text: "And others", isCorrect: false },
      { text: "Before Christ", isCorrect: false }
    ],
    explanation: "'e.g.' stands for Latin 'exempli gratia' meaning 'for example'."
  },
  {
    text: "Which of the following is NOT a communication skill?",
    options: [
      { text: "Listening", isCorrect: false },
      { text: "Speaking", isCorrect: false },
      { text: "Reading", isCorrect: false },
      { text: "Sleeping", isCorrect: true }
    ],
    explanation: "Sleeping is a biological rest state, not a linguistic/communication skill."
  },
  {
    text: "The secretary of a meeting is expected to:",
    options: [
      { text: "Preside over the meeting", isCorrect: false },
      { text: "Record the proceedings", isCorrect: true },
      { text: "Approve the budget", isCorrect: false },
      { text: "Discipline members", isCorrect: false }
    ],
    explanation: "Secretaries record actions, attendance, and decisions."
  },
  {
    text: "Which of these is an advantage of written communication?",
    options: [
      { text: "It leaves no record", isCorrect: false },
      { text: "It provides permanent evidence", isCorrect: true },
      { text: "It cannot be referred to", isCorrect: false },
      { text: "It is always faster than speech", isCorrect: false }
    ],
    explanation: "Written text provides an enduring legal and administrative reference."
  },
  {
    text: "Which of the following is a barrier to listening?",
    options: [
      { text: "Attention", isCorrect: false },
      { text: "Noise", isCorrect: true },
      { text: "Interest", isCorrect: false },
      { text: "Feedback", isCorrect: false }
    ],
    explanation: "Environmental or internal noise distracts listeners from concentrating."
  },
  {
    text: "Which of the following should be avoided during oral presentations?",
    options: [
      { text: "Confidence", isCorrect: false },
      { text: "Clear pronunciation", isCorrect: false },
      { text: "Reading every word without eye contact", isCorrect: true },
      { text: "Good preparation", isCorrect: false }
    ],
    explanation: "Monotone reading alienates listeners and breaks rapport."
  },
  {
    text: "A report should be:",
    options: [
      { text: "Emotional", isCorrect: false },
      { text: "Objective", isCorrect: true },
      { text: "Biased", isCorrect: false },
      { text: "Informal", isCorrect: false }
    ],
    explanation: "Objectivity ensures report findings stem from factual evidence."
  },
  {
    text: "Which of the following is an example of downward communication?",
    options: [
      { text: "Student to Lecturer", isCorrect: false },
      { text: "Staff to Manager", isCorrect: false },
      { text: "Manager to Employees", isCorrect: true },
      { text: "Customer to Company", isCorrect: false }
    ],
    explanation: "Managers instructing employees is a downward organizational flow."
  },
  {
    text: "Which of these is NOT a feature of an effective meeting?",
    options: [
      { text: "Clear agenda", isCorrect: false },
      { text: "Good time management", isCorrect: false },
      { text: "Disorder", isCorrect: true },
      { text: "Accurate minutes", isCorrect: false }
    ],
    explanation: "Effective meetings maintain order, discipline, and direction."
  },
  {
    text: "Which word is correctly spelt?",
    options: [
      { text: "Recieve", isCorrect: false },
      { text: "Receive", isCorrect: true },
      { text: "Receeve", isCorrect: false },
      { text: "Receve", isCorrect: false }
    ],
    explanation: "'i before e except after c' applies to receive."
  },
  {
    text: "Which of the following is the best definition of communication?",
    options: [
      { text: "Writing letters only", isCorrect: false },
      { text: "The exchange of information to achieve understanding", isCorrect: true },
      { text: "Speaking loudly", isCorrect: false },
      { text: "Sending emails only", isCorrect: false }
    ],
    explanation: "Mutual understanding is the core objective of communication."
  },
  {
    text: "Which of the following is the most important purpose of communication?",
    options: [
      { text: "To confuse people", isCorrect: false },
      { text: "To exchange ideas and information effectively", isCorrect: true },
      { text: "To criticize others", isCorrect: false },
      { text: "To waste time", isCorrect: false }
    ],
    explanation: "Effective exchange of ideas facilitates cooperation and decision-making."
  },
  {
    text: "Which communication skill involves paying close attention to a speaker?",
    options: [
      { text: "Reading", isCorrect: false },
      { text: "Listening", isCorrect: true },
      { text: "Writing", isCorrect: false },
      { text: "Typing", isCorrect: false }
    ],
    explanation: "Listening demands active focus on auditory and non-verbal cues."
  },
  {
    text: "The communication process is complete when:",
    options: [
      { text: "The sender finishes speaking", isCorrect: false },
      { text: "The receiver gives feedback", isCorrect: true },
      { text: "The message is written", isCorrect: false },
      { text: "The channel is selected", isCorrect: false }
    ],
    explanation: "Feedback closes the loop by confirming transmission success."
  },
  {
    text: "Which of the following is NOT a form of written communication?",
    options: [
      { text: "Email", isCorrect: false },
      { text: "Report", isCorrect: false },
      { text: "Telephone call", isCorrect: true },
      { text: "Memo", isCorrect: false }
    ],
    explanation: "Telephone calls are oral communication."
  },
  {
    text: "A report should be based mainly on:",
    options: [
      { text: "Assumptions", isCorrect: false },
      { text: "Personal opinions", isCorrect: false },
      { text: "Facts and evidence", isCorrect: true },
      { text: "Rumours", isCorrect: false }
    ],
    explanation: "Facts and evidence lend authority and reliability to reports."
  },
  {
    text: "Which of the following is a feature of a good business letter?",
    options: [
      { text: "Clarity", isCorrect: true },
      { text: "Slang", isCorrect: false },
      { text: "Informal language", isCorrect: false },
      { text: "Emojis", isCorrect: false }
    ],
    explanation: "Clarity ensures the reader grasps the purpose without ambiguity."
  },
  {
    text: "Which communication barrier results from different meanings attached to words?",
    options: [
      { text: "Physical barrier", isCorrect: false },
      { text: "Semantic barrier", isCorrect: true },
      { text: "Mechanical barrier", isCorrect: false },
      { text: "Environmental barrier", isCorrect: false }
    ],
    explanation: "Semantic barriers occur when words hold different meanings for sender and receiver."
  },
  {
    text: "Which of the following is NOT one of the 7 Cs of communication?",
    options: [
      { text: "Clarity", isCorrect: false },
      { text: "Courtesy", isCorrect: false },
      { text: "Completeness", isCorrect: false },
      { text: "Confusion", isCorrect: true }
    ],
    explanation: "Confusion is a barrier, not a principle of effective communication."
  },
  {
    text: "In a meeting, the person who directs discussions is the:",
    options: [
      { text: "Secretary", isCorrect: false },
      { text: "Chairman", isCorrect: true },
      { text: "Treasurer", isCorrect: false },
      { text: "Member", isCorrect: false }
    ],
    explanation: "The Chairman guides agenda topics and manages speaking order."
  },
  {
    text: "Which document informs members about issues to be discussed before a meeting?",
    options: [
      { text: "Agenda", isCorrect: true },
      { text: "Minutes", isCorrect: false },
      { text: "Memo", isCorrect: false },
      { text: "Report", isCorrect: false }
    ],
    explanation: "Agendas list itemized topics prior to a session."
  },
  {
    text: "The official record of decisions taken during a meeting is known as:",
    options: [
      { text: "Circular", isCorrect: false },
      { text: "Agenda", isCorrect: false },
      { text: "Minutes", isCorrect: true },
      { text: "Notice", isCorrect: false }
    ],
    explanation: "Minutes serve as official records of meeting outcomes."
  },
  {
    text: "Which of these should be avoided in formal communication?",
    options: [
      { text: "Correct grammar", isCorrect: false },
      { text: "Clear language", isCorrect: false },
      { text: "Slang and offensive words", isCorrect: true },
      { text: "Polite expressions", isCorrect: false }
    ],
    explanation: "Slang diminishes professional tone and clarity."
  },
  {
    text: "Which of the following is the best synonym for \"concise\"?",
    options: [
      { text: "Wordy", isCorrect: false },
      { text: "Brief", isCorrect: true },
      { text: "Confusing", isCorrect: false },
      { text: "Difficult", isCorrect: false }
    ],
    explanation: "Concise means expressing much in few words."
  },
  {
    text: "Choose the correctly spelt word.",
    options: [
      { text: "Priviledge", isCorrect: false },
      { text: "Privilege", isCorrect: true },
      { text: "Privelage", isCorrect: false },
      { text: "Privlege", isCorrect: false }
    ],
    explanation: "Privilege has no 'd'."
  },
  {
    text: "Which sentence is grammatically correct?",
    options: [
      { text: "The students has arrived.", isCorrect: false },
      { text: "The students have arrived.", isCorrect: true },
      { text: "The students was arrived.", isCorrect: false },
      { text: "The students is arriving.", isCorrect: false }
    ],
    explanation: "Plural subject 'students' requires plural auxiliary 'have'."
  },
  {
    text: "Which punctuation mark is used after a salutation in a formal letter?",
    options: [
      { text: "Full stop (.)", isCorrect: false },
      { text: "Colon (:) or Comma (,)", isCorrect: true },
      { text: "Question mark (?)", isCorrect: false },
      { text: "Exclamation mark (!)", isCorrect: false }
    ],
    explanation: "Formal salutations take a comma (British) or colon (American)."
  },
  {
    text: "Which of the following is an example of upward communication?",
    options: [
      { text: "Managing Director to Staff", isCorrect: false },
      { text: "HOD to Lecturer", isCorrect: false },
      { text: "Student Representative to Dean", isCorrect: true },
      { text: "Government to Citizens", isCorrect: false }
    ],
    explanation: "Student rep to Dean flows upward from student body to administration."
  },
  {
    text: "Which of the following is NOT a characteristic of an effective report?",
    options: [
      { text: "Accuracy", isCorrect: false },
      { text: "Objectivity", isCorrect: false },
      { text: "Bias", isCorrect: true },
      { text: "Clarity", isCorrect: false }
    ],
    explanation: "Bias undermines reporting credibility."
  },
  {
    text: "Which of the following is the best medium for preserving official records?",
    options: [
      { text: "Verbal discussion", isCorrect: false },
      { text: "Written communication", isCorrect: true },
      { text: "Telephone conversation", isCorrect: false },
      { text: "Body language", isCorrect: false }
    ],
    explanation: "Written formats create searchable permanent archives."
  },
  {
    text: "Which of the following encourages effective communication?",
    options: [
      { text: "Active listening", isCorrect: true },
      { text: "Interrupting the speaker", isCorrect: false },
      { text: "Using ambiguous words", isCorrect: false },
      { text: "Ignoring feedback", isCorrect: false }
    ],
    explanation: "Active listening fosters understanding and constructive exchange."
  },
  {
    text: "The plural of \"analysis\" is:",
    options: [
      { text: "Analysises", isCorrect: false },
      { text: "Analyses", isCorrect: true },
      { text: "Analysises", isCorrect: false },
      { text: "Analyseses", isCorrect: false }
    ],
    explanation: "Nouns ending in '-is' change to '-es' in plural."
  },
  {
    text: "The word opposite in meaning to \"expand\" is:",
    options: [
      { text: "Increase", isCorrect: false },
      { text: "Develop", isCorrect: false },
      { text: "Reduce", isCorrect: true },
      { text: "Enlarge", isCorrect: false }
    ],
    explanation: "Reduce means contract or decrease in size."
  },
  {
    text: "Which of the following best describes formal communication?",
    options: [
      { text: "It follows official channels", isCorrect: true },
      { text: "It is based on rumours", isCorrect: false },
      { text: "It has no structure", isCorrect: false },
      { text: "It is always spoken", isCorrect: false }
    ],
    explanation: "Formal communication follows established administrative paths."
  },
  {
    text: "A good speaker should always:",
    options: [
      { text: "Speak without preparation", isCorrect: false },
      { text: "Use abusive language", isCorrect: false },
      { text: "Consider the audience", isCorrect: true },
      { text: "Ignore time limits", isCorrect: false }
    ],
    explanation: "Audience awareness dictates tone, speed, and content depth."
  },
  {
    text: "Which of the following is the most important quality of effective communication?",
    options: [
      { text: "Ambiguity", isCorrect: false },
      { text: "Clarity", isCorrect: true },
      { text: "Length", isCorrect: false },
      { text: "Complexity", isCorrect: false }
    ],
    explanation: "Clarity prevents misinterpretation and saves time."
  },
  {
    text: "Which of the following comes immediately before the salutation in a business letter?",
    options: [
      { text: "Complimentary close", isCorrect: false },
      { text: "Recipient's address / Date", isCorrect: true },
      { text: "Signature", isCorrect: false },
      { text: "Body paragraph", isCorrect: false }
    ],
    explanation: "The date and inside address precede the formal salutation."
  },
  {
    text: "Which type of sentence expresses a strong emotion?",
    options: [
      { text: "Declarative", isCorrect: false },
      { text: "Imperative", isCorrect: false },
      { text: "Exclamatory", isCorrect: true },
      { text: "Interrogative", isCorrect: false }
    ],
    explanation: "Exclamatory sentences express strong feelings and end with an exclamation mark."
  },
  {
    text: "Which principle of logic states that a proposition is either true or false with no middle ground?",
    options: [
      { text: "Principle of Identity", isCorrect: false },
      { text: "Principle of Contradiction", isCorrect: false },
      { text: "Principle of Excluded Middle", isCorrect: true },
      { text: "Principle of Deduction", isCorrect: false }
    ],
    explanation: "The Principle of Excluded Middle asserts that every statement is either true or false."
  },
  {
    text: "In grammatical concord, which sentence follows the rule of proximity?",
    options: [
      { text: "Neither the principal nor the teachers were present.", isCorrect: true },
      { text: "Neither the principal nor the teachers was present.", isCorrect: false },
      { text: "Neither the teachers nor the principal were present.", isCorrect: false },
      { text: "Both A and B", isCorrect: false }
    ],
    explanation: "With 'neither...nor', the verb agrees in number with the subject closer to it."
  },
  {
    text: "Which sentence displays the Present Perfect Progressive tense?",
    options: [
      { text: "He sings a song.", isCorrect: false },
      { text: "He has sung a song.", isCorrect: false },
      { text: "He has been singing a song.", isCorrect: true },
      { text: "He sang a song.", isCorrect: false }
    ],
    explanation: "'Has/have been + verb-ing' forms the present perfect progressive."
  },
  {
    text: "A 14-line poem with a specific rhyme scheme is called a:",
    options: [
      { text: "Ballad", isCorrect: false },
      { text: "Elegy", isCorrect: false },
      { text: "Sonnet", isCorrect: true },
      { text: "Epic", isCorrect: false }
    ],
    explanation: "A sonnet is a classic poetic form consisting of 14 lines."
  },
  {
    text: "Who defined poetry as 'the spontaneous overflow of powerful feelings recollected in tranquility'?",
    options: [
      { text: "Samuel Taylor Coleridge", isCorrect: false },
      { text: "William Wordsworth", isCorrect: true },
      { text: "J.P. Clark", isCorrect: false },
      { text: "Hornby", isCorrect: false }
    ],
    explanation: "William Wordsworth provided this famous definition of romantic poetry."
  },
  {
    text: "An argument that reasoning moves from general premises to a specific conclusion is called:",
    options: [
      { text: "Inductive reasoning", isCorrect: false },
      { text: "Deductive reasoning", isCorrect: true },
      { text: "Semantic reasoning", isCorrect: false },
      { text: "Analogical reasoning", isCorrect: false }
    ],
    explanation: "Deductive logic draws specific conclusions guaranteed by general premises."
  },
  {
    text: "Which essay type paints a vivid mental picture of a person, place, or event?",
    options: [
      { text: "Narrative essay", isCorrect: false },
      { text: "Descriptive essay", isCorrect: true },
      { text: "Expository essay", isCorrect: false },
      { text: "Argumentative essay", isCorrect: false }
    ],
    explanation: "Descriptive writing relies on sensory details to portray subjects vividly."
  },
  {
    text: "Which genre of literature is written in prose and split into chapters?",
    options: [
      { text: "Poetry", isCorrect: false },
      { text: "Drama", isCorrect: false },
      { text: "Novel / Fiction", isCorrect: true },
      { text: "Play", isCorrect: false }
    ],
    explanation: "Prose fiction such as novels are organized into paragraphs and chapters."
  },
  {
    text: "The term 'Diction' in literature refers to:",
    options: [
      { text: "Choice of words", isCorrect: true },
      { text: "Stage directions", isCorrect: false },
      { text: "Rhyme scheme", isCorrect: false },
      { text: "Plot twist", isCorrect: false }
    ],
    explanation: "Diction is an author's intentional selection and use of words."
  },
  {
    text: "A poem written to lament or mourn the death of someone is known as an:",
    options: [
      { text: "Ode", isCorrect: false },
      { text: "Elegy", isCorrect: true },
      { text: "Epic", isCorrect: false },
      { text: "Ballad", isCorrect: false }
    ],
    explanation: "An elegy is a poem of serious reflection, typically a lament for the dead."
  },
  {
    text: "Which of the following is a key feature of an expository essay?",
    options: [
      { text: "Telling a personal story", isCorrect: false },
      { text: "Explaining and clarifying a topic neutrally", isCorrect: true },
      { text: "Debating two opposing views aggressively", isCorrect: false },
      { text: "Using rhyme schemes", isCorrect: false }
    ],
    explanation: "Expository writing explains, informs, or describes a topic neutrally."
  },
  {
    text: "A syllogism consists of how many proposition statements?",
    options: [
      { text: "Two", isCorrect: false },
      { text: "Three (Major premise, Minor premise, Conclusion)", isCorrect: true },
      { text: "Four", isCorrect: false },
      { text: "Five", isCorrect: false }
    ],
    explanation: "Classical syllogisms comprise a major premise, minor premise, and conclusion."
  },
  {
    text: "Facts can be verified through which three main methods?",
    options: [
      { text: "Rumour, Guesswork, Intuition", isCorrect: false },
      { text: "Experiment, Calculation, Observation", isCorrect: true },
      { text: "Debate, Opinion, Feeling", isCorrect: false },
      { text: "Gossip, Speech, Writing", isCorrect: false }
    ],
    explanation: "Empirical facts are established via experiment, mathematical calculation, or direct observation."
  },
  {
    text: "Which type of sentence gives a direct command or request?",
    options: [
      { text: "Declarative sentence", isCorrect: false },
      { text: "Imperative sentence", isCorrect: true },
      { text: "Optative sentence", isCorrect: false },
      { text: "Interrogative sentence", isCorrect: false }
    ],
    explanation: "Imperative sentences issue orders, instructions, or polite requests (e.g. 'Close the door')."
  },
  {
    text: "The sentence 'Jesus wept' is structurally classified as a:",
    options: [
      { text: "Simple sentence", isCorrect: true },
      { text: "Compound sentence", isCorrect: false },
      { text: "Complex sentence", isCorrect: false },
      { text: "Compound-complex sentence", isCorrect: false }
    ],
    explanation: "It contains a single independent clause with one subject and verb."
  },
  {
    text: "Which sentence is a compound sentence?",
    options: [
      { text: "To err is human; to forgive is divine.", isCorrect: true },
      { text: "When the bell rang, the students ran out.", isCorrect: false },
      { text: "Jesus wept.", isCorrect: false },
      { text: "Although he worked hard, he failed because he was ill.", isCorrect: false }
    ],
    explanation: "Compound sentences connect two independent clauses with a semicolon or coordinating conjunction."
  },
  {
    text: "The 7 Cs principle of 'Courtesy' in communication implies:",
    options: [
      { text: "Being polite, respectful, and considerate of the receiver", isCorrect: true },
      { text: "Writing as quickly as possible", isCorrect: false },
      { text: "Using complex vocabulary", isCorrect: false },
      { text: "Including extra unnecessary details", isCorrect: false }
    ],
    explanation: "Courtesy requires a polite, respectful, and audience-friendly tone."
  },
  {
    text: "In logic, a fallacy is defined as:",
    options: [
      { text: "A valid deduction", isCorrect: false },
      { text: "An error or flaw in reasoning", isCorrect: true },
      { text: "A proven scientific fact", isCorrect: false },
      { text: "A grammatical mistake", isCorrect: false }
    ],
    explanation: "A logical fallacy is a flaw in argument structure that renders it invalid."
  },
  {
    text: "Which aspect of tenses indicates an ongoing or continuous action?",
    options: [
      { text: "Simple aspect", isCorrect: false },
      { text: "Perfect aspect", isCorrect: false },
      { text: "Progressive aspect", isCorrect: true },
      { text: "Future aspect", isCorrect: false }
    ],
    explanation: "Progressive (continuous) aspect shows action currently underway."
  },
  {
    text: "In essay writing, the stage where you plan, conduct research, and create an outline is:",
    options: [
      { text: "Drafting stage", isCorrect: false },
      { text: "Preparation stage", isCorrect: true },
      { text: "Revision stage", isCorrect: false },
      { text: "Publishing stage", isCorrect: false }
    ],
    explanation: "Preparation involves brainstorming, gathering data, and structuring your outline before writing."
  },
  {
    text: "The thesis statement of an essay is typically located in the:",
    options: [
      { text: "Introduction paragraph", isCorrect: true },
      { text: "Body paragraph 2", isCorrect: false },
      { text: "Conclusion paragraph", isCorrect: false },
      { text: "Appendix", isCorrect: false }
    ],
    explanation: "The thesis statement summarizes the main argument in the introduction."
  },
  {
    text: "Which literary term describes descriptive language that appeals to the physical senses?",
    options: [
      { text: "Imagery", isCorrect: true },
      { text: "Alliteration", isCorrect: false },
      { text: "Rhyme", isCorrect: false },
      { text: "Plot", isCorrect: false }
    ],
    explanation: "Imagery creates vivid mental impressions through sensory descriptions."
  },
  {
    text: "J.P. Clark's poem 'Ibadan' is a famous example of:",
    options: [
      { text: "A descriptive short lyric poem", isCorrect: true },
      { text: "An epic narrative", isCorrect: false },
      { text: "A play script", isCorrect: false },
      { text: "A formal memo", isCorrect: false }
    ],
    explanation: "'Ibadan' ('running splash of rust and gold...') is a celebrated Nigerian lyric poem."
  },
  {
    text: "Which component of an email or letter specifies what the message is about in one line?",
    options: [
      { text: "Salutation", isCorrect: false },
      { text: "Subject Line", isCorrect: true },
      { text: "Signature", isCorrect: false },
      { text: "Enclosure", isCorrect: false }
    ],
    explanation: "The Subject line gives a concise summary of the letter or email purpose."
  },
  {
    text: "In an official meeting, an 'Adjournment' means:",
    options: [
      { text: "Starting the meeting late", isCorrect: false },
      { text: "Ending or postponing the meeting session", isCorrect: true },
      { text: "Voting on a motion", isCorrect: false },
      { text: "Reading the previous minutes", isCorrect: false }
    ],
    explanation: "Adjournment officially closes or suspends the meeting."
  },
  {
    text: "Which term describes communication that takes place between different organizations?",
    options: [
      { text: "Internal communication", isCorrect: false },
      { text: "External communication", isCorrect: true },
      { text: "Horizontal communication", isCorrect: false },
      { text: "Upward communication", isCorrect: false }
    ],
    explanation: "Inter-organizational exchange is external communication."
  },
  {
    text: "The principle of logic stating that 'A is A' (a thing is what it is) is the:",
    options: [
      { text: "Principle of Identity", isCorrect: true },
      { text: "Principle of Contradiction", isCorrect: false },
      { text: "Principle of Excluded Middle", isCorrect: false },
      { text: "Principle of Syllogism", isCorrect: false }
    ],
    explanation: "The Principle of Identity asserts that everything is identical to itself."
  },
  {
    text: "An informal communication network based on unofficial social channels in an organization is called:",
    options: [
      { text: "The Grapevine", isCorrect: true },
      { text: "Downward channel", isCorrect: false },
      { text: "Upward channel", isCorrect: false },
      { text: "Formal pipeline", isCorrect: false }
    ],
    explanation: "The grapevine is the informal social network of employee rumours and gossip."
  },
  {
    text: "Which of the following sentence structures contains two independent clauses and at least one dependent clause?",
    options: [
      { text: "Simple sentence", isCorrect: false },
      { text: "Compound sentence", isCorrect: false },
      { text: "Complex sentence", isCorrect: false },
      { text: "Compound-Complex sentence", isCorrect: true }
    ],
    explanation: "Compound-complex sentences combine multiple main clauses with subordinate clauses."
  },
  {
    text: "What is the primary role of a 'Thesis Statement' in essay writing?",
    options: [
      { text: "To list references used", isCorrect: false },
      { text: "To state the central claim or main point of the essay", isCorrect: true },
      { text: "To define difficult vocabulary words", isCorrect: false },
      { text: "To thank the lecturer", isCorrect: false }
    ],
    explanation: "The thesis statement anchors the entire argument or topic of an essay."
  },
  {
    text: "Which of the following is a characteristic of active listening?",
    options: [
      { text: "Formulating a reply while the speaker is talking", isCorrect: false },
      { text: "Asking clarifying questions and providing constructive feedback", isCorrect: true },
      { text: "Looking at your smartphone continuously", isCorrect: false },
      { text: "Interrupting whenever you disagree", isCorrect: false }
    ],
    explanation: "Active listening involves engagement, clarification, and thoughtful feedback."
  },
  {
    text: "Which punctuation mark is used to indicate a pause or separate items in a list?",
    options: [
      { text: "Full stop", isCorrect: false },
      { text: "Comma", isCorrect: true },
      { text: "Hyphen", isCorrect: false },
      { text: "Semicolon", isCorrect: false }
    ],
    explanation: "Commas separate listed elements and signal slight pauses in sentence flow."
  },
  {
    text: "Which type of reasoning moves from specific observed cases to a general conclusion?",
    options: [
      { text: "Inductive reasoning", isCorrect: true },
      { text: "Deductive reasoning", isCorrect: false },
      { text: "Syllogistic reasoning", isCorrect: false },
      { text: "Categorical reasoning", isCorrect: false }
    ],
    explanation: "Inductive logic generalizes broad rules from specific observational data."
  },
  {
    text: "In a formal report, the 'Terms of Reference' section specifies:",
    options: [
      { text: "The scope, purpose, and authority under which the report was commissioned", isCorrect: true },
      { text: "The price of the report paper", isCorrect: false },
      { text: "The writer's personal hobbies", isCorrect: false },
      { text: "The table of contents", isCorrect: false }
    ],
    explanation: "Terms of Reference outline the mandate, objectives, and boundaries of a report project."
  },
  {
    text: "Which category of tenses expresses actions completed in the past before another past action?",
    options: [
      { text: "Simple Past", isCorrect: false },
      { text: "Past Perfect", isCorrect: true },
      { text: "Present Perfect", isCorrect: false },
      { text: "Past Progressive", isCorrect: false }
    ],
    explanation: "Past perfect ('had + past participle') marks actions completed prior to another past event."
  },
  {
    text: "What does the 7 Cs principle of 'Concrete' mean?",
    options: [
      { text: "Using clear, specific facts and figures rather than vague statements", isCorrect: true },
      { text: "Making the letter heavy", isCorrect: false },
      { text: "Using cement jargon", isCorrect: false },
      { text: "Writing long paragraphs", isCorrect: false }
    ],
    explanation: "Concrete communication relies on solid facts, exact data, and clear specifics."
  },
  {
    text: "Which of the following is an example of an Optative sentence?",
    options: [
      { text: "Long live the President!", isCorrect: true },
      { text: "Where is the hall?", isCorrect: false },
      { text: "The sun rises in the east.", isCorrect: false },
      { text: "Submit your assignment.", isCorrect: false }
    ],
    explanation: "Optative sentences express a wish, prayer, or desire (e.g., 'May God bless you!')."
  },
  {
    text: "What is the primary function of a Narrative essay?",
    options: [
      { text: "To tell a story or account of events in chronological order", isCorrect: true },
      { text: "To analyze a mathematical problem", isCorrect: false },
      { text: "To describe a picture without action", isCorrect: false },
      { text: "To convince the reader to buy a product", isCorrect: false }
    ],
    explanation: "Narrative essays present a sequence of events as a story."
  },
  {
    text: "Which of the following is a physical barrier to communication?",
    options: [
      { text: "Loud machinery noise in a workshop", isCorrect: true },
      { text: "Grammatical errors", isCorrect: false },
      { text: "Prejudice", isCorrect: false },
      { text: "Jargon", isCorrect: false }
    ],
    explanation: "Physical barriers include environmental distance, walls, or loud ambient sounds."
  },
  {
    text: "Which section of a meeting's minutes lists the people who attended?",
    options: [
      { text: "Attendance / Present", isCorrect: true },
      { text: "Matters Arising", isCorrect: false },
      { text: "Any Other Business (A.O.B)", isCorrect: false },
      { text: "Adjournment", isCorrect: false }
    ],
    explanation: "The Attendance section records present, absent, and apologized members."
  },
  {
    text: "The term 'Concord' in English grammar refers to:",
    options: [
      { text: "Agreement between words in a sentence (e.g. subject and verb)", isCorrect: true },
      { text: "Writing fast", isCorrect: false },
      { text: "Rhyming words in poetry", isCorrect: false },
      { text: "Punctuation marks", isCorrect: false }
    ],
    explanation: "Concord is the grammatical harmony between related words in a sentence."
  },
  {
    text: "Which of the following is a feature of a 'Notice of Meeting'?",
    options: [
      { text: "It states the date, time, venue, and purpose of the upcoming meeting", isCorrect: true },
      { text: "It records the past decisions of a meeting", isCorrect: false },
      { text: "It serves as a personal letter", isCorrect: false },
      { text: "It contains financial audit reports", isCorrect: false }
    ],
    explanation: "A Notice of Meeting formally informs members of an impending meeting's logistical details."
  },
  {
    text: "Which principle of logic states that a statement cannot be both true and false at the same time in the same sense?",
    options: [
      { text: "Principle of Contradiction", isCorrect: true },
      { text: "Principle of Identity", isCorrect: false },
      { text: "Principle of Excluded Middle", isCorrect: false },
      { text: "Principle of Association", isCorrect: false }
    ],
    explanation: "The Principle of Contradiction holds that contradictory statements cannot both be true simultaneously."
  },
  {
    text: "The complimentary close 'Yours sincerely' is appropriate when:",
    options: [
      { text: "You know the recipient's name (e.g. Dear Mr. Johnson)", isCorrect: true },
      { text: "You open with 'Dear Sir/Madam'", isCorrect: false },
      { text: "Writing an internal memo", isCorrect: false },
      { text: "Writing to an unknown company", isCorrect: false }
    ],
    explanation: "'Yours sincerely' pairs with personalized salutations containing the recipient's name."
  },
  {
    text: "In communication theory, 'Decoding' is performed by the:",
    options: [
      { text: "Receiver", isCorrect: true },
      { text: "Sender", isCorrect: false },
      { text: "Channel", isCorrect: false },
      { text: "Encoder", isCorrect: false }
    ],
    explanation: "The receiver decodes signals into coherent mental concepts."
  },
  {
    text: "What is 'Kinesics' in non-verbal communication?",
    options: [
      { text: "The study of body movement, gestures, and facial expressions", isCorrect: true },
      { text: "The study of voice volume", isCorrect: false },
      { text: "The study of touch", isCorrect: false },
      { text: "The study of time management", isCorrect: false }
    ],
    explanation: "Kinesics analyzes body language, facial movement, and physical gestures."
  },
  {
    text: "Which of the following is a common cause of psychological communication barriers?",
    options: [
      { text: "Emotional state, fear, or anger", isCorrect: true },
      { text: "Faulty telephone wires", isCorrect: false },
      { text: "Unclear handwriting", isCorrect: false },
      { text: "Distance", isCorrect: false }
    ],
    explanation: "Psychological barriers arise from internal emotional states, stress, or bias."
  },
  {
    text: "Which document provides step-by-step instructions on how to perform a task or operation?",
    options: [
      { text: "User Manual / Standard Operating Procedure", isCorrect: true },
      { text: "Minutes of Meeting", isCorrect: false },
      { text: "Press Release", isCorrect: false },
      { text: "Circular", isCorrect: false }
    ],
    explanation: "Manuals and SOPs guide users through sequential operational procedures."
  },
  {
    text: "The final section of an essay or report that summarizes key findings and draws final thoughts is the:",
    options: [
      { text: "Conclusion", isCorrect: true },
      { text: "Introduction", isCorrect: false },
      { text: "Title page", isCorrect: false },
      { text: "Glossary", isCorrect: false }
    ],
    explanation: "Conclusions synthesize main arguments and provide closure."
  },
  {
    text: "Which of the following represents an active voice construction?",
    options: [
      { text: "The student solved the problem.", isCorrect: true },
      { text: "The problem was solved by the student.", isCorrect: false },
      { text: "The problem has been solved.", isCorrect: false },
      { text: "A solution was found.", isCorrect: false }
    ],
    explanation: "Active voice features the subject performing the verb directly ('The student solved...')."
  },
  {
    text: "What is 'Proxemics' in non-verbal communication?",
    options: [
      { text: "The use of personal space and physical distance in interaction", isCorrect: true },
      { text: "The speed of speaking", isCorrect: false },
      { text: "The choice of written words", isCorrect: false },
      { text: "Eye movement", isCorrect: false }
    ],
    explanation: "Proxemics explores how humans use spatial distance during communication."
  },
  {
    text: "In meeting procedure, a 'Quorum' refers to:",
    options: [
      { text: "The minimum number of members required to validly transact business", isCorrect: true },
      { text: "The total number of absent members", isCorrect: false },
      { text: "The refreshment break time", isCorrect: false },
      { text: "The list of speeches", isCorrect: false }
    ],
    explanation: "A quorum is the legal minimum attendance needed for a meeting to proceed."
  },
  {
    text: "Which of the following is the ultimate goal of effective communication?",
    options: [
      { text: "Mutual understanding and desired action", isCorrect: true },
      { text: "Winning an argument at all costs", isCorrect: false },
      { text: "Sending as many emails as possible", isCorrect: false },
      { text: "Showing off complex vocabulary", isCorrect: false }
    ],
    explanation: "Communication succeeds when mutual comprehension leads to the intended response."
  }
];

async function seed250GNS302() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for 250 GNS 302 Questions Seeding...");

    // Merge both arrays (100 + 150 = 250)
    const combined250 = [...noteQuestions100, ...questions150];
    console.log(`Total combined master pool: ${combined250.length} questions`);

    // Canonical School of ICT Faculty
    const canonicalFaculty = await Faculty.findOne({ name: /School of ICT/i });
    if (!canonicalFaculty) {
      throw new Error("Canonical 'School of ICT' faculty not found!");
    }

    const targetDepts = [
      "Software and Web Development",
      "Artificial Intelligence",
      "Networking and Cloud Computing",
      "Cyber Security"
    ];

    let updatedQuizzes = 0;

    for (const deptName of targetDepts) {
      const dept = await Department.findOne({
        faculty: canonicalFaculty._id,
        name: new RegExp(deptName, 'i')
      });

      if (!dept) {
        console.error(`Could not find department for ${deptName}`);
        continue;
      }

      // Find GNS 302 course
      let course = await Course.findOne({
        department: dept._id,
        $or: [
          { code: /GNS\s*302/i },
          { title: new RegExp(`COMMUNICATION SKILLS & LOGIC`, 'i') }
        ]
      });

      if (!course) {
        course = await Course.create({
          title: `Communication Skills & Logic - ${deptName}`,
          code: "GNS 302",
          description: "Comprehensive HND1 Communication Skills, Grammar, Concord, Tenses, Logic, Argumentation, Essay Writing, and Literary Genres.",
          department: dept._id,
          faculty: canonicalFaculty._id,
          level: "HND1",
          semester: "Second Semester",
          path: "polytechnic",
          price: 1000,
          isPaid: true
        });
        console.log(`Created GNS 302 course for ${deptName}`);
      }

      // Update Quiz with all 250 questions
      let quiz = await Quiz.findOne({ course: course._id });
      if (!quiz) {
        quiz = await Quiz.create({
          title: `GNS 302 CBT Practice Test - ${deptName}`,
          description: "Comprehensive 250-question master pool for GNS 302 (Communication Skills & Logic). 60 questions shuffled per 30-minute attempt.",
          course: course._id,
          questions: combined250,
          timeLimit: 30,
          isActive: true
        });
        console.log(`Created Quiz for ${deptName} with 250 questions!`);
      } else {
        quiz.questions = combined250;
        quiz.title = `GNS 302 CBT Practice Test - ${deptName}`;
        quiz.description = "Comprehensive 250-question master pool for GNS 302 (Communication Skills & Logic). 60 questions shuffled per 30-minute attempt.";
        await quiz.save();
        console.log(`Updated Quiz for ${deptName} with all 250 questions!`);
      }

      updatedQuizzes++;
    }

    console.log("\n=======================================================");
    console.log(`✅ Success! Updated ${updatedQuizzes} GNS 302 quizzes with 250 master questions.`);
    console.log("✅ Departments covered: SWD, AI, NCC, CYS.");
    console.log("=======================================================\n");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed250GNS302();
