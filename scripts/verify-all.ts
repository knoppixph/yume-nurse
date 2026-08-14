import { calculateSM2, isCardDue } from "../lib/spaced-repetition";
import { shuffleArray, buildQuizQuestions } from "../lib/quiz-engine";
import { quizQuestions } from "../lib/study-data";
import { getCurrentLevel } from "../lib/gamification";

function runAllTests() {
  console.log("=========================================");
  console.log("Running Yume Nurse Automated Verification Suite");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Spaced Repetition (SM-2)
  console.log("--- 1. Testing Spaced Repetition (SM-2) ---");
  const initCard = undefined;
  const gradeAgain = calculateSM2(initCard, "Again");
  assert(gradeAgain.repetitions === 0, "SM-2 'Again' resets repetition count to 0");
  assert(gradeAgain.intervalDays === 1, "SM-2 'Again' sets next interval to 1 day");

  const gradeGood1 = calculateSM2(initCard, "Good");
  assert(gradeGood1.repetitions === 1, "SM-2 'Good' first review sets repetition count to 1");
  const gradeGood2 = calculateSM2(gradeGood1, "Good");
  assert(gradeGood2.repetitions === 2, "SM-2 'Good' second review sets repetition count to 2");
  assert(gradeGood2.intervalDays === 6, "SM-2 'Good' second interval is 6 days");

  const isDueNow = isCardDue(undefined);
  assert(isDueNow === true, "Unreviewed card is flagged as due now");

  // 2. Test Question Randomization (Fisher-Yates)
  console.log("\n--- 2. Testing Randomization Algorithms ---");
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffled = shuffleArray(array);
  assert(shuffled.length === array.length, "Shuffled array preserves original length");
  assert(array.every((item) => shuffled.includes(item)), "Shuffled array contains all original elements");

  // 3. Test Quiz Engine Builder
  console.log("\n--- 3. Testing Quiz Engine Config & Filtration ---");
  const config = {
    subjectId: "all",
    topicId: "all",
    difficulty: "Mixed" as const,
    questionCount: 5,
    questionType: "all" as const,
    randomizeQuestions: true,
    randomizeAnswers: true,
    isTimed: false,
    timeLimitSeconds: 600,
  };
  const builtQuiz = buildQuizQuestions(quizQuestions, config);
  assert(builtQuiz.length === 5, "Quiz builder creates exactly 5 questions when requested");

  // 4. Test Gamification & Level Thresholds
  console.log("\n--- 4. Testing Gamification & Levels ---");
  const lvl1 = getCurrentLevel(100);
  assert(lvl1.current.level === 1 && lvl1.current.title === "Nursing Student", "100 XP is Level 1 (Nursing Student)");

  const lvl3 = getCurrentLevel(800);
  assert(lvl3.current.level === 3 && lvl3.current.title === "Future Nurse", "800 XP is Level 3 (Future Nurse)");

  const lvl5 = getCurrentLevel(4000);
  assert(lvl5.current.level === 5 && lvl5.current.title === "Nursing Pro", "4000 XP is Level 5 (Nursing Pro)");

  console.log("\n=========================================");
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
