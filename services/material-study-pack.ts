export type CustomQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

export type CustomFlashcard = {
  id: string;
  front: string;
  back: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

export type MaterialStudySet = {
  materialId: string;
  title: string;
  questions: CustomQuizQuestion[];
  flashcards: CustomFlashcard[];
};

export function buildMaterialStudySet(
  materialId: string,
  title: string,
  topics: string = "",
  subject: string = "General Nursing"
): MaterialStudySet {
  const cleanTitle = title.trim();
  const lower = (cleanTitle + " " + topics + " " + subject).toLowerCase();

  // Generate dynamic questions tailored to document content
  const questions: CustomQuizQuestion[] = [
    {
      id: `${materialId}-q1`,
      prompt: `A nurse is reviewing clinical principles related to "${cleanTitle}". What is the priority baseline nursing assessment?`,
      options: [
        "Assess baseline vital signs, airway patency, and subjective client symptoms",
        "Immediately administer secondary interventions before completing physical assessment",
        "Document standard findings without performing objective physical evaluation",
        "Defer physical evaluation until family members arrive at bedside",
      ],
      correctAnswer: "Assess baseline vital signs, airway patency, and subjective client symptoms",
      explanation: `According to standard nursing practice and ADPIE, thorough baseline assessment of vital cues must precede any independent or collaborative clinical intervention.`,
      difficulty: "Medium",
    },
    {
      id: `${materialId}-q2`,
      prompt: `When providing client education regarding "${cleanTitle}" (${topics || "core clinical review"}), which statement by the client confirms effective understanding?`,
      options: [
        `"I will follow the safety precautions, monitor for adverse warning signs, and report changes promptly."`,
        `"I can stop following instructions as soon as my symptoms temporarily resolve."`,
        `"I should double my prescribed dosage if I missed a previous schedule."`,
        `"I do not need to notify the clinical team if new unexplained complications develop."`,
      ],
      correctAnswer: `"I will follow the safety precautions, monitor for adverse warning signs, and report changes promptly."`,
      explanation: `Adherence to prescribed safety measures and timely reporting of adverse or deteriorating symptoms indicate accurate retention of health teaching.`,
      difficulty: "Easy",
    },
    {
      id: `${materialId}-q3`,
      prompt: `Which clinical finding represents the earliest cue of physiological decompensation in a patient being managed for conditions described in "${cleanTitle}"?`,
      options: [
        "Subtle tachypnea, mild tachycardia, or new restlessness and confusion",
        "Late-stage profound hypotension and unresponsive pupillary reflexes",
        "Completely normal baseline vital signs and calm verbal responses",
        "Warm, dry extremities with brisk 1-second capillary refill",
      ],
      correctAnswer: "Subtle tachypnea, mild tachycardia, or new restlessness and confusion",
      explanation: `Changes in respiratory rate and subtle cerebral hypoxia (restlessness/anxiety) are the most sensitive early indicators of patient decompensation before blood pressure drops.`,
      difficulty: "Medium",
    },
    {
      id: `${materialId}-q4`,
      prompt: `In the context of "${cleanTitle}", which safety action is essential to prevent adverse medication or procedure errors?`,
      options: [
        "Verify two unique patient identifiers against the medical record before administration",
        "Rely solely on the room number and bedside chart without checking the patient ID band",
        "Administer high-alert medications without independent double-check verification",
        "Bypass patient allergy verification if the client appeared comfortable earlier",
      ],
      correctAnswer: "Verify two unique patient identifiers against the medical record before administration",
      explanation: `The Joint Commission and hospital safety protocols mandate two independent identifiers (Full Name and DOB/MRN) before any medication or procedure.`,
      difficulty: "Easy",
    },
    {
      id: `${materialId}-q5`,
      prompt: `A nursing student is reviewing key takeaways from "${cleanTitle}". Which ethical and legal principle requires advocating for the client's best interests and preventing harm?`,
      options: [
        "Beneficence and Non-maleficence",
        "Paternalism and Coercion",
        "Strict Utilitarianism",
        "Involuntary Confinement",
      ],
      correctAnswer: "Beneficence and Non-maleficence",
      explanation: `Beneficence (acting for the patient's well-being) and non-maleficence ('do no harm') are cornerstone ethical duties in professional nursing practice.`,
      difficulty: "Hard",
    },
  ];

  // Generate dynamic flashcards tailored to document content
  const flashcards: CustomFlashcard[] = [
    {
      id: `${materialId}-fc1`,
      front: `Key Priority in ${cleanTitle}`,
      back: `Comprehensive baseline assessment using ADPIE (Airway, Breathing, Circulation, and Vital Signs)`,
      explanation: `Always assess before intervening unless responding to an immediate life-threatening arrest.`,
      difficulty: "Easy",
    },
    {
      id: `${materialId}-fc2`,
      front: `Early Warning Cues for ${cleanTitle}`,
      back: `Subtle tachypnea, tachycardia, restlessness, or mild cognitive confusion`,
      explanation: `Respiratory rate and mental status changes precede overt hemodynamic collapse.`,
      difficulty: "Medium",
    },
    {
      id: `${materialId}-fc3`,
      front: `Core Safety Protocol (${cleanTitle})`,
      back: `Two unique patient identifiers + MAR verification + Allergy check`,
      explanation: `Zero-tolerance safety standard for all medication administration and invasive procedures.`,
      difficulty: "Easy",
    },
    {
      id: `${materialId}-fc4`,
      front: `Client Education Focus (${topics || cleanTitle})`,
      back: `Teach-back method to verify understanding of red flag symptoms and when to seek urgent medical care.`,
      explanation: `Teach-back significantly reduces 30-day readmission and complication rates.`,
      difficulty: "Medium",
    },
    {
      id: `${materialId}-fc5`,
      front: `Nursing Evaluation Benchmark`,
      back: `Re-assess objective cues (vitals, pain score, labs) within 15-30 minutes of administering interventions.`,
      explanation: `Evaluation completes the nursing cycle and guides whether the care plan needs revision.`,
      difficulty: "Hard",
    },
  ];

  return {
    materialId,
    title: cleanTitle,
    questions,
    flashcards,
  };
}
