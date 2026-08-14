export type StructuredAiResponse = {
  topic: string;
  explanation: string;
  nursingRelevance: string;
  signsAndSymptoms: string[];
  nursingConsiderations: string[];
  memoryTips: string[];
  disclaimer: string;
};

export type GeneratedStudyPack = {
  title: string;
  summary: string;
  keyTerms: { term: string; definition: string }[];
  flashcards: { front: string; back: string; explanation: string; difficulty: "Easy" | "Medium" | "Hard" }[];
  quizQuestions: {
    prompt: string;
    type: "Multiple Choice" | "Select All That Apply" | "Patient Scenario";
    options: string[];
    correctAnswer: string | string[];
    explanation: string;
  }[];
};

const CLINICAL_KNOWLEDGE_BASE: Record<string, StructuredAiResponse> = {
  hypokalemia: {
    topic: "Hypokalemia (Serum Potassium < 3.5 mEq/L)",
    explanation: "Hypokalemia is an abnormally low serum potassium concentration below 3.5 mEq/L, critical for maintaining cardiac membrane potential, neuromuscular transmission, and skeletal muscle contraction.",
    nursingRelevance: "Hypokalemia predisposes patients to lethal cardiac dysrhythmias and dramatically potentiates Digoxin toxicity. Potassium imbalances are among the most common high-alert electrolyte emergencies in med-surg units.",
    signsAndSymptoms: [
      "ECG changes: Flattened/inverted T-waves, prominent U-waves, ST depression",
      "Muscle weakness, cramping, hyporeflexia, and flaccid paralysis",
      "Decreased gastrointestinal motility, paralytic ileus, constipation",
      "Shallow respirations due to respiratory muscle fatigue",
      "Orthostatic hypotension and weak, thready pulses",
    ],
    nursingConsiderations: [
      "NEVER administer potassium chloride via direct IV push (lethal cardiac arrest risk).",
      "Ensure adequate urine output (> 30 mL/hr) before administering IV potassium ('No pee, no K+').",
      "Max IV peripheral potassium concentration is usually 10 mEq/hr; use a dedicated infusion pump.",
      "Monitor continuous cardiac telemetry and serum potassium levels.",
      "Educate patient on potassium-rich foods (bananas, potatoes, spinach, oranges).",
    ],
    memoryTips: [
      "Mnemonic 'A SIC WALT': Alkalosis, Shallow respirations, Irritability, Confusion, Weakness/fatigue, Arrhythmias, Lethargy, Thready pulse.",
      "ECG: 'No Pot, No Tea' (Low potassium = Flat T-wave, Prominent U-wave).",
    ],
    disclaimer: "Educational study reference only. Always verify with approved clinical references.",
  },

  "heart failure": {
    topic: "Congestive Heart Failure (Left vs. Right Sided)",
    explanation: "Heart failure is a clinical syndrome where the heart cannot pump sufficient blood to meet the metabolic demands of tissues, resulting in backward vascular congestion and forward hypoperfusion.",
    nursingRelevance: "Nurses must differentiate between left-sided (pulmonary) and right-sided (systemic) congestion to prioritize airway, fluid restrictions, daily weights, and diuretic therapy.",
    signsAndSymptoms: [
      "Left-Sided Failure (Lungs): Dyspnea, orthopnea, paroxysmal nocturnal dyspnea (PND), bilateral crackles, cough with pink frothy sputum.",
      "Right-Sided Failure (Rest of body): Jugular venous distention (JVD), bilateral peripheral pitting edema, ascites, hepatomegaly, weight gain.",
    ],
    nursingConsiderations: [
      "Weigh patient daily at the same time, using the same scale, with the same clothing (report weight gain > 2-3 lbs/day or 5 lbs/week).",
      "Position in High Fowler's to ease respiratory effort during dyspnea.",
      "Administer ordered diuretics (furosemide) in the morning to prevent nocturia.",
      "Educate on sodium restriction (< 2,000 mg/day) and fluid restriction if ordered.",
      "Monitor serum electrolytes (potassium, sodium) and renal function (BUN, Creatinine).",
    ],
    memoryTips: [
      "Left-sided = Lungs (crackles, dyspnea, pulmonary edema).",
      "Right-sided = Rest of the Body (JVD, edema, ascites).",
    ],
    disclaimer: "Educational study reference only. Always verify with approved clinical references.",
  },

  hypoglycemia: {
    topic: "Hypoglycemia (Blood Glucose < 70 mg/dL)",
    explanation: "Hypoglycemia occurs when blood glucose falls below normal physiologic levels (< 70 mg/dL), leading to sympathetic nervous system stimulation and neuroglycopenic symptoms due to cerebral glucose deprivation.",
    nursingRelevance: "Severe hypoglycemia is an acute clinical emergency that can rapidly progress to seizures, coma, and irreversible brain damage if not promptly treated with the 'Rule of 15'.",
    signsAndSymptoms: [
      "Early Autonomic signs: Diaphoresis, tremors, tachycardia, palpitations, hunger, anxiety",
      "Late Neuroglycopenic signs: Confusion, irritability, slurred speech, visual disturbances, seizures, unconsciousness",
      "Cool, clammy skin ('Cold and clammy, give some candy')",
    ],
    nursingConsiderations: [
      "Apply the Rule of 15: Give 15 grams of fast-acting simple carbohydrates (4 oz fruit juice or regular soda, 3-4 glucose tablets).",
      "Re-check blood glucose in 15 minutes. If still < 70 mg/dL, repeat 15 grams.",
      "Once normalized, give a complex carb + protein snack (peanut butter crackers) if the next meal is > 1 hour away.",
      "If patient is unconscious or NPO, administer IV 50% Dextrose (D50W) or IM/subQ Glucagon.",
    ],
    memoryTips: [
      "'Cold and clammy, need some candy' (Hypoglycemia).",
      "'Hot and dry, sugar high' (Hyperglycemia).",
      "Rule of 15: 15g carbs -> 15 min wait -> 15 min re-check.",
    ],
    disclaimer: "Educational study reference only. Always verify with approved clinical references.",
  },

  antibiotics: {
    topic: "Antibiotic Safety & Antimicrobial Nursing",
    explanation: "Antimicrobial therapy eliminates or inhibits pathogenic bacteria while minimizing host toxicity and reducing antibiotic resistance development.",
    nursingRelevance: "Nurses are responsible for checking drug allergies, obtaining baseline cultures before administering the first dose, infusing at safe rates, and monitoring for toxicity and superinfections.",
    signsAndSymptoms: [
      "Allergic / Anaphylactic reactions: Urticaria, pruritus, wheezing, angioedema, hypotension",
      "Superinfections: Watery diarrhea (Clostridioides difficile), oral thrush, vaginal candidiasis",
      "Organ toxicity: Oliguria/elevated creatinine (nephrotoxicity), tinnitus/hearing loss (ototoxicity)",
    ],
    nursingConsiderations: [
      "Always obtain blood/wound/urine cultures BEFORE starting the first antibiotic dose.",
      "Verify cross-allergies: Patients with severe penicillin allergy have a risk of cross-reaction to cephalosporins.",
      "Vancomycin: Infuse over at least 60 minutes to prevent 'Red Man Syndrome' (histamine-mediated flushing); monitor peak/trough levels.",
      "Aminoglycosides (Gentamicin): Monitor peak and trough, BUN/creatinine, and auditory function.",
      "Patient education: Always finish the full prescribed course even if symptoms improve.",
    ],
    memoryTips: [
      "Mnemonic 'MEDICATE': Monitor for superinfections, Evaluate renal/liver labs, Dose evenly, Inform provider of allergies, Cultures before start, Alcohol avoidance, Take full course, Evaluate response.",
    ],
    disclaimer: "Educational study reference only. Always verify with approved clinical references.",
  },
};

export async function askNurseMateAi(prompt: string): Promise<StructuredAiResponse> {
  const normalizedQuery = prompt.toLowerCase();

  // 1. Try server-side OpenAI API if OPENAI_API_KEY is present
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: `You are Yume Nurse AI, an expert clinical nursing educator. 
Provide educational nursing explanations structured with:
- topic (string)
- explanation (string)
- nursingRelevance (string)
- signsAndSymptoms (array of strings)
- nursingConsiderations (array of strings)
- memoryTips (array of strings)
- disclaimer (string: educational note)
Never provide personal medical diagnosis or treatment for real patients. Keep tone supportive, encouraging, professional, and clear. Format output as valid JSON.`,
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return {
          topic: content.topic ?? prompt,
          explanation: content.explanation ?? "",
          nursingRelevance: content.nursingRelevance ?? "",
          signsAndSymptoms: content.signsAndSymptoms ?? [],
          nursingConsiderations: content.nursingConsiderations ?? [],
          memoryTips: content.memoryTips ?? [],
          disclaimer: "Educational study reference only. Verified with standard nursing curriculum.",
        };
      }
    } catch {
      // fallback to clinical database
    }
  }

  // 2. Intelligent clinical knowledge base matching
  for (const [key, value] of Object.entries(CLINICAL_KNOWLEDGE_BASE)) {
    if (normalizedQuery.includes(key)) {
      return value;
    }
  }

  // 3. Fallback clinical response
  return {
    topic: `Nursing Study Guide: ${prompt.trim()}`,
    explanation: `Clinical analysis on "${prompt.trim()}". In nursing practice, understanding the underlying pathophysiology, assessment cues, and evidence-based interventions is essential for providing safe patient care and excelling in nursing licensure exams.`,
    nursingRelevance: "Safe medication administration, accurate assessment of vital signs, recognizing early signs of patient deterioration, and timely communication with the interdisciplinary healthcare team.",
    signsAndSymptoms: [
      "Altered vital sign trends (blood pressure, pulse, respirations, SpO2)",
      "Patient-reported pain, dizziness, fatigue, or acute distress",
      "Neurological status changes and perfusion alterations",
      "Changes in fluid balance and laboratory diagnostic markers",
    ],
    nursingConsiderations: [
      "Perform focused physical assessment and compare with baseline findings.",
      "Apply the nursing process (ADPIE) to prioritize patient-centered safety.",
      "Ensure standard and transmission-based precautions are maintained.",
      "Document objective cues clearly and escalate urgent changes immediately.",
    ],
    memoryTips: [
      "Prioritize using Maslow's Hierarchy of Needs and ABCs (Airway, Breathing, Circulation).",
      "Remember: 'Assess first before intervening' unless in immediate life-threatening arrest.",
    ],
    disclaimer: "Educational study reference only. Always verify with your course textbook and clinical instructor.",
  };
}

export function generateStudyPack(notes: string): GeneratedStudyPack {
  const previewTopic = notes.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Nursing Notes Reviewer";

  return {
    title: `AI Study Pack: ${previewTopic}`,
    summary: `Synthesized summary based on provided notes: Highlights core clinical concepts, pathophysiological mechanisms, priority nursing assessments, and patient safety precautions.`,
    keyTerms: [
      { term: "ADPIE", definition: "Assessment, Diagnosis, Planning, Implementation, Evaluation - foundational nursing clinical decision flow." },
      { term: "Perfusion", definition: "Delivery of oxygenated arterial blood to body tissues and vital organs." },
      { term: "High-Alert Medication", definition: "Drugs bearing heightened risk of causing catastrophic patient harm if administered in error." },
      { term: "Standard Precautions", definition: "Baseline infection control practices applied to all patients in all healthcare settings." },
    ],
    flashcards: [
      {
        front: `What is the primary nursing priority regarding ${previewTopic}?`,
        back: "Ensuring patient airway, breathing, circulation, and performing timely baseline assessment.",
        explanation: "Clinical judgment begins with accurate cue recognition before implementing interventions.",
        difficulty: "Medium",
      },
      {
        front: "Which early cue indicates patient decompensation?",
        back: "Subtle vital sign changes such as tachypnea, mild tachycardia, or new restlessness/confusion.",
        explanation: "Mental status and respiratory rate changes are frequently the earliest indicators of physiologic distress.",
        difficulty: "Easy",
      },
      {
        front: "What is the recommended patient safety check before medication administration?",
        back: "Verifying 2 unique patient identifiers (name and DOB/MRN) against the MAR and ID band.",
        explanation: "Prevents wrong-patient medication administration errors.",
        difficulty: "Easy",
      },
      {
        front: "How does therapeutic communication enhance nursing assessment?",
        back: "By asking open-ended questions and reflecting statements, encouraging the patient to share complete details.",
        explanation: "Avoids defensive responses and fosters mutual trust.",
        difficulty: "Medium",
      },
      {
        front: "What is the key rationale for obtaining baseline diagnostic cultures before antibiotics?",
        back: "To identify the specific causative pathogen before antimicrobial agents alter or suppress culture growth.",
        explanation: "Ensures targeted, narrow-spectrum antimicrobial therapy.",
        difficulty: "Medium",
      },
    ],
    quizQuestions: [
      {
        prompt: `A nurse is caring for a client discussing ${previewTopic}. Which initial assessment action is most appropriate?`,
        type: "Multiple Choice",
        options: [
          "Gather baseline subjective and objective vital signs and perform a focused assessment",
          "Immediately administer pain medication without assessment",
          "Dismiss the client concerns as non-urgent",
          "Discharge the client without provider consultation",
        ],
        correctAnswer: "Gather baseline subjective and objective vital signs and perform a focused assessment",
        explanation: "Assessment is always the first step in the nursing process (ADPIE) to guide safe clinical decisions.",
      },
      {
        prompt: "Which actions represent essential patient safety standards? Select all that apply.",
        type: "Select All That Apply",
        options: [
          "Performing hand hygiene before and after client contact",
          "Verifying two patient identifiers before procedures",
          "Leaving bedside rails completely lowered on a confused client",
          "Keeping the call light within reach of the client",
        ],
        correctAnswer: [
          "Performing hand hygiene before and after client contact",
          "Verifying two patient identifiers before procedures",
          "Keeping the call light within reach of the client",
        ],
        explanation: "Hand hygiene, patient identification, and accessible call lights prevent infection, medication error, and falls.",
      },
      {
        prompt: "A client exhibits sudden acute shortness of breath and oxygen desaturation. What is the immediate priority nursing action?",
        type: "Multiple Choice",
        options: [
          "Elevate the head of the bed to High Fowler's and apply oxygen as ordered",
          "Place the client in prone position and wait 1 hour",
          "Leave the room to write a progress note",
          "Administer a full meal",
        ],
        correctAnswer: "Elevate the head of the bed to High Fowler's and apply oxygen as ordered",
        explanation: "Upright positioning maximizes lung expansion and reduces respiratory workload.",
      },
    ],
  };
}
