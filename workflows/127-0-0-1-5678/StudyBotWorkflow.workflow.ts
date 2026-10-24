import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Study Bot Processing Workflow
// Nodes   : 12  |  Connections: 9
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// Webhook                            webhook
// TranscribeViaGroq                  httpRequest                [creds]
// GenerateDeepCourseUnderstanding    httpRequest                [creds]
// Wait2SecondsApiSafety              wait
// ExtractStudentIntelEvents          httpRequest                [creds]
// FormatFinalOutput                  code
// ScheduleWebhook                    webhook
// GeminiScheduleParser               httpRequest                [creds]
// FormatScheduleOutput               code
// PromptGeneratorWebhook             webhook
// GeminiMasterPromptCreator          httpRequest                [creds]
// FormatMasterPrompt                 code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// Webhook
//    → TranscribeViaGroq
//      → GenerateDeepCourseUnderstanding
//        → Wait2SecondsApiSafety
//          → ExtractStudentIntelEvents
//            → FormatFinalOutput
// ScheduleWebhook
//    → GeminiScheduleParser
//      → FormatScheduleOutput
// PromptGeneratorWebhook
//    → GeminiMasterPromptCreator
//      → FormatMasterPrompt
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '16qmnSpkAn9tQDEN',
    name: 'Study Bot Processing Workflow',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class StudyBotProcessingWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'e6f47702-8618-4221-a477-949f50e930f7',
        webhookId: 'process-study-session',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [200, 300],
    })
    Webhook = {
        httpMethod: 'POST',
        path: 'process-study-session',
        responseMode: 'lastNode',
        responseData: 'firstEntryJson',
        options: {},
    };

    @node({
        id: 'a1b2c3d4-e5f6-4789-b1c2-d3e4f5a6b7c8',
        name: 'Transcribe via Groq',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [500, 300],
        credentials: { groqApi: { id: 'PF1ZMT03O2E5waqU', name: 'Groq account 2' } },
    })
    TranscribeViaGroq = {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/audio/transcriptions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'groqApi',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'model',
                    value: 'whisper-large-v3-turbo',
                },
                {
                    name: 'prompt',
                    value: 'Algerian Darija (دزيرية / Arabizi), Modern Standard Arabic, French, English lecture discussion, coursework, homework, questions.',
                },
                {
                    name: 'temperature',
                    value: '0',
                },
                {
                    parameterType: 'formBinaryData',
                    name: 'file',
                    inputDataFieldName: 'file',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'b2c3d4e5-f6a7-4890-c2d3-e4f5a6b7c8d9',
        name: 'Generate Deep Course Understanding',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [800, 300],
        credentials: { googlePalmApi: { id: '9NtnnUmLQ5Ydiu6q', name: 'Google Gemini(PaLM) Api account 2' } },
    })
    GenerateDeepCourseUnderstanding = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={{ {
  contents: [
    {
      parts: [
        {
          text: "You are an elite academic professor in L3 Automatique & Electrical/Control Engineering.\\n\\nLANGUAGE CONTEXT: The speakers switch between Algerian Darija (دزيرية / Arabizi), French, and English technical terms.\\n\\nMISSION: Provide a deep, high-level structural understanding of WHAT was actually done in this course, WHY it was done (purpose, engineering utility, physical real-world meaning), and WHAT the student needs to master first. Do NOT hallucinate. Do NOT dump raw transcripts. Keep it clear, structured, and insightful as an executive study overview:\\n\\n1. 🎯 What Was Covered & Core Purpose (Why we studied this topic today, practical engineering objective).\\n2. 🔑 Key Concepts, Definitions & Physical Intuition (Explain each major theme the professor touched upon).\\n3. 📐 Formulas, Mathematical Derivations & Circuit Rules (Exhaustive list of mathematical models, time constants, transfer functions, components discussed).\\n4. 💡 Professor's Advice, Technical Traps & Pitfalls (Common exam mistakes, subtle details the professor stressed).\\n\\nCourse: " + ($('Webhook').item.json.body.meeting_name || "") + "\\nTranscript:\\n" + $json.text
        }
      ]
    }
  ]
} }}`,
        options: {},
    };

    @node({
        id: 'c2d3e4f5-a6b7-4890-b1c2-d3e4f5a6b7c8',
        name: 'Wait 2 Seconds (API Safety)',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [1020, 300],
    })
    Wait2SecondsApiSafety = {
        amount: 2,
        unit: 'seconds',
    };

    @node({
        id: 'd3e4f5a6-b7c8-4901-c2d3-e4f5a6b7c8d9',
        name: 'Extract Student Intel & Events',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [1240, 300],
        credentials: { googlePalmApi: { id: '9NtnnUmLQ5Ydiu6q', name: 'Google Gemini(PaLM) Api account 2' } },
    })
    ExtractStudentIntelEvents = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={{ {
  contents: [
    {
      parts: [
        {
          text: "You are a specialized student intelligence analyst for the L3 Automatique cohort.\\n\\nTARGET STUDENT: 'Malik Mehdid' / 'Mahdid Malik' / 'Mehdi' / 'Souhil'\\n\\nOFFICIAL COHORT CLASSMATES RECOGNITION LIST (Match any of these specific students if called by the professor or if they interacted):\\n- Wassim Azzoug, ishak nedjoua, Assala Metallaoui, Ghalia Layachi, Fady Messai, Bilal Bouchoucha, Farida Haouam, Ala Eddine Rebouh, Mary 01, Nihad Samoudi, chahd Dj, Khalil Djoulah, Abdoul kader Mahamadou Gambo, Det ox, yasser rouimel, Aya Chabou, Istabrek Mebarkia, Issam Mabed, Ali korichi, Noussa, Houria Rouibah, isra messai, Salah Zell, mohamed taib, Sami Hm, Aridj Bouden, Meryem Nouaouria, Mohamed ACHOURI, Sameh BAHLOUL, Tassadit HAMLA, William, Tina, Mr. President, Shabitra.\\n\\nEXTRACT STRICTLY IN THIS STRUCTURE:\\n- malik_called: true or false (Only true if professor directly addressed or mentioned Malik/Mehdid/Souhil)\\n- malik_called_details: Detailed context if true, or \\"No direct call-out for Malik in this session.\\"\\n- homework_assigned: true or false\\n- homework_details: Exact exercises, questions, problems, deadlines, or Google Classroom tasks.\\n- exam_or_quiz_announced: true or false\\n- exam_details: Dates, chapters covered, or continuous assessment evaluation rules.\\n- peers_called: List only recognized classmates from the list above who spoke or were acknowledged.\\n- teacher_announcements: Important operational notices (attendance warnings, telegram files, timetable changes, cancellation/reschedule of TD or pause between classes).\\n\\nTranscript:\\n" + $('Transcribe via Groq').item.json.text
        }
      ]
    }
  ]
} }}`,
        options: {},
    };

    @node({
        id: 'd8c2b1a3-f9e4-4172-a2b1-c0d1e8f9a6b5',
        name: 'Format Final Output',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1480, 300],
    })
    FormatFinalOutput = {
        mode: 'runOnceForAllItems',
        jsCode: `
for (let item of $input.all()) {
  const deepCourseUnderstanding = $('Generate Deep Course Understanding').item.json.candidates?.[0]?.content?.parts?.[0]?.text || "No course summary generated";
  const studentIntel = item.json.candidates?.[0]?.content?.parts?.[0]?.text || "No student intelligence generated";
  const rawTranscript = $('Transcribe via Groq').item.json.text || "";
  const courseName = $('Webhook').item.json.body.meeting_name || "L3 Automatique";
  
  const fullReport = '# 📚 Academic Course Understanding & Intelligence Report\\n\\n## 🧠 Course Mastery Overview\\n' + deepCourseUnderstanding + '\\n\\n---\\n\\n## 🎯 Student Intel, Homework, & Alerts\\n' + studentIntel + '\\n';
  
  const autoMasterPrompt = '# MASTER STUDY & TUTORING PROMPT: ' + courseName + ' (L3 AUTOMATIQUE)\\n\\n## 1. Persona & Mission\\nYou are an elite, world-class university professor in L3 Automatique & Electrical/Control Engineering. Your mission is to tutor the student through the concepts covered in this specific lecture.\\n\\n## 2. Ingested Lecture Knowledge & Formulations\\n' + deepCourseUnderstanding + '\\n\\n## 3. Professor\\'s Explicit Warnings, Traps & Student Alerts\\n' + studentIntel + '\\n\\n## 4. Full Transcribed Lecture Reference\\n' + rawTranscript + '\\n\\n## 5. Tutoring Protocol\\nAct as a personal 1-on-1 Socratic tutor. Test the student with step-by-step questions, verify their analytical calculations, and guide them through core engineering principles.\\n';

  item.json = { 
    report_markdown: fullReport,
    course_understanding: deepCourseUnderstanding,
    student_intel: studentIntel,
    transcript_text: rawTranscript,
    master_prompt: autoMasterPrompt
  };
}
return $input.all();
`,
    };

    @node({
        id: 'c3d4e5f6-a7b8-4901-d2e3-f4a5b6c7d8e9',
        webhookId: 'parse-schedule-update',
        name: 'Schedule Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [200, 600],
    })
    ScheduleWebhook = {
        httpMethod: 'POST',
        path: 'parse-schedule-update',
        responseMode: 'lastNode',
        responseData: 'firstEntryJson',
        options: {},
    };

    @node({
        id: 'd4e5f6a7-b8c9-4012-e3f4-a5b6c7d8e9f0',
        name: 'Gemini Schedule Parser',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [500, 600],
        credentials: { googlePalmApi: { id: '9NtnnUmLQ5Ydiu6q', name: 'Google Gemini(PaLM) Api account 2' } },
    })
    GeminiScheduleParser = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={{ {
  contents: [
    {
      parts: [
        {
          text: "You are an intelligent university class schedule tracker. Students in Algeria are posting announcements and chatting in French, Algerian Darija, and Arabic about their university courses (L3 Automatique).\\n\\nKnown Modules:\\n- Embedded Computer 1 (Calculateur Embarqué 1)\\n- Control system 2 (Système asservis 2)\\n- Capteurs et Instrumentation Industriels (Industrial Sensors and Instrumentation)\\n- Électronique de puissance (Power Electronics)\\n- Automates Programmable industriel 1 (Industrial Programmable Automation 1)\\n- Management de l'innovation (Innovation Management)\\n- English for Automation and Control\\n\\nMessage to analyze:\\n\\"" + ($json.body.message_text || "").replace(/"/g, '\\\\"') + "\\"\\n\\nDetermine if this message announces a rescheduled class, a time change, an exam/homework date, or a new Google Meet link for a course.\\nReturn ONLY valid JSON (no markdown formatting, no backticks):\\n{\\n  \\"is_schedule_update\\": true or false,\\n  \\"subject\\": \\"One of the known module names or unknown\\",\\n  \\"day_of_week\\": \\"Monday/Tuesday/Wednesday/Thursday/Friday/Saturday/Sunday or null\\",\\n  \\"time\\": \\"HH:MM or null\\",\\n  \\"meet_url\\": \\"https://meet.google.com/... or null\\",\\n  \\"notes\\": \\"short summary in French/English\\"\\n}"
        }
      ]
    }
  ]
} }}`,
        options: {},
    };

    @node({
        id: 'e5f6a7b8-c9d0-4123-f4a5-b6c7d8e9f0a1',
        name: 'Format Schedule Output',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [800, 600],
    })
    FormatScheduleOutput = {
        mode: 'runOnceForAllItems',
        jsCode: `
for (let item of $input.all()) {
  let raw = item.json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  raw = raw.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
  try {
    item.json = JSON.parse(raw);
  } catch(e) {
    item.json = { is_schedule_update: false, error: e.message, raw: raw };
  }
}
return $input.all();
`,
    };

    @node({
        id: 'f1a2b3c4-d5e6-4789-a0b1-c2d3e4f5a6b7',
        webhookId: 'generate-study-prompt',
        name: 'Prompt Generator Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [200, 900],
    })
    PromptGeneratorWebhook = {
        httpMethod: 'POST',
        path: 'generate-study-prompt',
        responseMode: 'lastNode',
        responseData: 'firstEntryJson',
        options: {},
    };

    @node({
        id: 'a2b3c4d5-e6f7-4890-b1c2-d3e4f5a6b7c8',
        name: 'Gemini Master Prompt Creator',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [550, 900],
        credentials: { googlePalmApi: { id: '9NtnnUmLQ5Ydiu6q', name: 'Google Gemini(PaLM) Api account 2' } },
    })
    GeminiMasterPromptCreator = {
        method: 'POST',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'googlePalmApi',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={{ {
  contents: [
    {
      parts: [
        {
          text: "You are an elite academic curriculum architect and prompt engineer. Your task is to transform a university lecture summary/transcript into a MASTER STUDY & TUTORING PROMPT designed for top-tier AI models (Gemini 1.5 Pro, Claude 3.5 Sonnet, GPT-4o).\\n\\nWhen the student pastes this prompt into their chat with Gemini, the AI should immediately become their personal, world-class professor and tutor for this exact session.\\n\\nINPUT DATA:\\n- Course Name: " + ($json.body.course_name || "L3 Automatique Lecture") + "\\n- Date: " + ($json.body.date || "N/A") + "\\n- Professor: " + ($json.body.professor || "N/A") + "\\n- Lecture Summary & Content: " + ($json.body.summary || "") + "\\n- Warnings & Advice: " + ($json.body.warnings || "") + "\\n- Homework & Tasks: " + ($json.body.homework || "") + "\\n- Concepts & Formulas: " + ($json.body.formulas || "") + "\\n\\nCREATE THE MASTER PROMPT WITH THIS EXACT STRUCTURE (Ready to copy-paste):\\n1. System Persona & Mission (Top university professor in L3 Automatique & Electrical/Control Engineering).\\n2. Complete Knowledge Base & Lecture Breakdown (incorporate every formula, time-constant, circuit behavior, diagram rule, and definition).\\n3. Professor's Explicit Warnings, Traps & Exam Advice (point out common mistakes the professor stressed).\\n4. Step-by-Step Pedagogical Walkthrough (from basic foundations to advanced problem solving).\\n5. Practice Problems & Numerical Exercises (with solutions, step-by-step derivations, and verification).\\n6. Recommended YouTube Search Queries & Technical Keywords (best search terms to watch animations and visual experiments).\\n7. Interactive Q&A Mode (invite the student to test their comprehension with progressive quizzes).\\n\\nReturn ONLY the polished Master Prompt markdown text without conversational wrapper."
        }
      ]
    }
  ]
} }}`,
        options: {},
    };

    @node({
        id: 'b3c4d5e6-f7a8-4901-c2d3-e4f5a6b7c8d9',
        name: 'Format Master Prompt',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [850, 900],
    })
    FormatMasterPrompt = {
        mode: 'runOnceForAllItems',
        jsCode: `
for (let item of $input.all()) {
  const generatedPrompt = item.json.candidates?.[0]?.content?.parts?.[0]?.text || "Prompt generation failed.";
  item.json = {
    success: true,
    master_prompt: generatedPrompt,
    timestamp: new Date().toISOString()
  };
}
return $input.all();
`,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.Webhook.out(0).to(this.TranscribeViaGroq.in(0));
        this.TranscribeViaGroq.out(0).to(this.GenerateDeepCourseUnderstanding.in(0));
        this.GenerateDeepCourseUnderstanding.out(0).to(this.Wait2SecondsApiSafety.in(0));
        this.Wait2SecondsApiSafety.out(0).to(this.ExtractStudentIntelEvents.in(0));
        this.ExtractStudentIntelEvents.out(0).to(this.FormatFinalOutput.in(0));
        this.ScheduleWebhook.out(0).to(this.GeminiScheduleParser.in(0));
        this.GeminiScheduleParser.out(0).to(this.FormatScheduleOutput.in(0));
        this.PromptGeneratorWebhook.out(0).to(this.GeminiMasterPromptCreator.in(0));
        this.GeminiMasterPromptCreator.out(0).to(this.FormatMasterPrompt.in(0));
    }
}
