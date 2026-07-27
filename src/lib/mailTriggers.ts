import { collection, addDoc } from "firebase/firestore";
import { db, isMockFirebase } from "./firebase";

// High-end CSS styled template wrappers for beautiful brand rendering
const emailHeader = `
  <div style="background-color: #090d16; padding: 32px 24px; text-align: center; border-radius: 16px 16px 0 0; border-bottom: 3px solid #C0392B;">
    <h1 style="color: #ffffff; font-family: 'Space Grotesk', 'Inter', Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; text-transform: uppercase;">
      ALEX<span style="color: #C0392B;">FITNESSHUB</span>
    </h1>
    <p style="color: #94A3B8; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 10px; font-weight: bold; margin: 6px 0 0 0; letter-spacing: 2px; uppercase">
      ATHLETE CALIBRATION ENGINE
    </p>
  </div>
`;

const emailFooter = `
  <div style="background-color: #090d16; padding: 24px; text-align: center; border-radius: 0 0 16px 16px; margin-top: 32px; border-top: 1px solid #1E293B;">
    <p style="color: #64748B; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.6; margin: 0;">
      You are receiving this automated email because you are a registered athlete on the AlexFitnessHub platform.
    </p>
    <p style="color: #94A3B8; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 11px; margin: 12px 0 0 0; font-weight: bold;">
      Need live coaching assistance? Contact Coach Alex:
    </p>
    <div style="margin-top: 10px;">
      <a href="mailto:alexfitnesshub@gmail.com" style="color: #C0392B; text-decoration: none; font-weight: bold; font-family: 'JetBrains Mono', monospace; font-size: 11px; margin: 0 10px;">alexfitnesshub@gmail.com</a>
      <span style="color: #334155;">|</span>
      <a href="https://wa.me/2347073307875" style="color: #C0392B; text-decoration: none; font-weight: bold; font-family: 'JetBrains Mono', monospace; font-size: 11px; margin: 0 10px;">WhatsApp Support Desk</a>
    </div>
    <p style="color: #475569; font-family: 'JetBrains Mono', monospace; font-size: 9px; margin: 16px 0 0 0; letter-spacing: 1px;">
      &copy; 2026 ALEXFITNESSHUB. ALL RIGHTS RESERVED.
    </p>
  </div>
`;

const emailWrapper = (content: string) => `
  <div style="background-color: #F8FAFC; padding: 40px 16px; min-height: 100%; width: 100%; box-sizing: border-box;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025); overflow: hidden;">
      ${emailHeader}
      <div style="padding: 40px 32px; background-color: #ffffff; color: #1E293B;">
        ${content}
      </div>
      ${emailFooter}
    </div>
  </div>
`;

/**
 * Dispatch an email securely via our backend MailerSend proxy API, falling back to Firestore if needed.
 */
async function queueEmail(to: string, subject: string, htmlContent: string, plainText: string) {
  if (isMockFirebase) {
    console.log(`[Mock Mail Queue] Simulating email delivery for: ${to} (Subject: "${subject}")`);
    return "mock-id";
  }

  try {
    console.log(`[Mail Dispatch Client] Sending email to ${to} via secure MailerSend proxy...`);
    const response = await fetch("/api/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: htmlContent,
        text: plainText
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[Mail Dispatch Success] Successfully sent email to ${to} via MailerSend.`, data);
      return data.result || "mailer-success-id";
    } else {
      const errText = await response.text();
      console.warn(`[Mail Dispatch Proxy Warning] Backend returned ${response.status}: ${errText}. Falling back to Firestore mail queue...`);
    }
  } catch (err) {
    console.warn(`[Mail Dispatch Proxy Error] Network error contacting MailerSend proxy. Falling back to Firestore mail queue...`, err);
  }

  // Durable fallback: Queue an email in Firestore's 'mail' collection if the proxy is unavailable
  try {
    const mailDoc = {
      to: to,
      message: {
        subject: subject,
        text: plainText,
        html: htmlContent
      },
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "mail"), mailDoc);
    console.log(`[Mail Fallback Queue] Successfully queued email trigger doc ${docRef.id} in 'mail' collection for recipient ${to}`);
    return docRef.id;
  } catch (fallbackErr) {
    console.error(`[Mail Fallback Queue Error] Failed to queue email to ${to} in Firestore:`, fallbackErr);
  }
}

/**
 * 1. TRIGGER WELCOME EMAIL AFTER REGISTRATION
 */
export async function queueWelcomeEmail(email: string, displayName: string) {
  const athleteName = displayName || email.split("@")[0] || "Athlete";
  const subject = `Welcome to AlexFitnessHub, ${athleteName}! 🚀 Your Athlete Credentials inside.`;
  
  const plainText = `
Welcome to AlexFitnessHub, ${athleteName}!

You have successfully registered on the elite athletic calibration portal. Your premium workspace is now active.

Get started by exploring:
- Pre-made professional exercise libraries
- Personalized high-intensity training schedules
- AI Coaching Assistant with customized mechanical feedback
- 5-Month Belly Fat Shred program

Train hard and keep pushing!
- Coach Alex, Sports Scientist & AI Head Coach
  `;

  const htmlContent = emailWrapper(`
    <h2 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: bold; color: #0F172A; margin: 0 0 16px 0; letter-spacing: -0.5px;">
      Welcome to the Athlete Feed, ${athleteName}! 🚀
    </h2>
    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      Your profile has been created and registered successfully on the <strong style="color: #0F172A;">AlexFitnessHub</strong> dashboard. You are now officially cleared to begin calorie tracking, workout logging, and sports-science biomechanics training.
    </p>

    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #C0392B; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #0F172A; margin: 0 0 8px 0; text-transform: uppercase; tracking: 0.5px;">
        🚀 Immediate Training Actions Needed:
      </h3>
      <ul style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #475569; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 6px;"><strong style="color: #0F172A;">Onboard Your Biometrics</strong>: Log your initial weight, height, and target physical metrics on your Dashboard.</li>
        <li style="margin-bottom: 6px;"><strong style="color: #0F172A;">Select Your Program</strong>: Browse the Workout Library to queue pre-made regimens curated for Hypertrophy, Endurance, or Weight Reduction.</li>
        <li style="margin-bottom: 6px;"><strong style="color: #0F172A;">Start the Belly Fat Shred</strong>: Explore our famous 5-Month program designed to melt abdominal adipose tissue using high-density intervals.</li>
      </ul>
    </div>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      If you require deep nutritional plans or customized mechanical exercises, log in and engage with your virtual <strong style="color: #C0392B;">AI Coach Console</strong> inside the portal.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://alexfitnesshub.com" style="background-color: #C0392B; color: #ffffff; text-decoration: none; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; padding: 14px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(192, 57, 43, 0.3);">
        ENTER ATHLETIC PORTAL
      </a>
    </div>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; margin: 24px 0 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
      In health and strength,<br />
      <strong>Coach Alex</strong><br />
      <span style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #94A3B8;">Lead Sports Scientist & AI Head Coach</span>
    </p>
  `);

  return queueEmail(email, subject, htmlContent, plainText);
}

/**
 * 2. TRIGGER WEEKLY WORKOUT SUMMARY EMAIL
 */
export async function queueWorkoutSummaryEmail(
  email: string, 
  displayName: string, 
  totalWorkouts: number, 
  totalWorkoutTimeMinutes: number, 
  milestones: string[], 
  adviceMarkdown: string
) {
  const athleteName = displayName || email.split("@")[0] || "Athlete";
  const subject = `AlexFitnessHub Weekly Performance Summary: Calibration Complete! 📊`;

  const plainText = `
Weekly Calibration Summary for ${athleteName}:

- Total Workouts Logged: ${totalWorkouts} sessions
- Training Duration: ${totalWorkoutTimeMinutes} active minutes
- Milestones: ${milestones.join(", ")}

Read the full report, sports science insights, and nutrition advice inside your premium portal dashboard!
  `;

  // Format milestones as HTML bullet items
  const milestonesHtml = milestones.map(m => `
    <li style="margin-bottom: 8px; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #475569; line-height: 1.5;">
      🏆 <strong>${m}</strong>
    </li>
  `).join("");

  const htmlContent = emailWrapper(`
    <h2 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: bold; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Weekly Performance Calibrated! 📊
    </h2>
    <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #C0392B; margin: 0 0 24px 0; font-weight: bold; letter-spacing: 1px; uppercase">
      WEEKLY SUMMARY REPORT
    </p>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      Hello <strong>${athleteName}</strong>, your metrics have been successfully processed through our sports science engine. Here is your weekly diagnostic overview:
    </p>

    <!-- METRICS GRID -->
    <div style="display: table; width: 100%; border-collapse: separate; border-spacing: 12px; margin: 0 -12px 24px -12px;">
      <div style="display: table-row;">
        <div style="display: table-cell; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; width: 50%; text-align: center;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #64748B; font-weight: bold; display: block; text-transform: uppercase;">WORKOUTS LOGGED</span>
          <span style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 800; color: #C0392B; display: block; margin: 8px 0 0 0;">${totalWorkouts}</span>
          <span style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #64748B; display: block; margin-top: 4px;">active sessions</span>
        </div>
        <div style="display: table-cell; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; width: 50%; text-align: center;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #64748B; font-weight: bold; display: block; text-transform: uppercase;">TRAINING VOLUME</span>
          <span style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 800; color: #0F172A; display: block; margin: 8px 0 0 0;">${totalWorkoutTimeMinutes}</span>
          <span style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #64748B; display: block; margin-top: 4px;">active minutes</span>
        </div>
      </div>
    </div>

    <!-- MILESTONES -->
    <div style="background-color: #FFFDFD; border: 1px solid #FADBD8; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
      <h3 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; color: #C0392B; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        🎯 Milestones Completed This Week
      </h3>
      <ul style="margin: 0; padding-left: 0; list-style: none;">
        ${milestonesHtml}
      </ul>
    </div>

    <!-- ADVICE EXCERPT -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: bold; color: #0F172A; margin: 0 0 10px 0;">
        💡 Sports Science Biomechanical Tips
      </h3>
      <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #475569; margin: 0;">
        1. <strong>Controlled Eccentrics:</strong> Standardize a slow, deliberate negative phase during lift cycles to maximize mechanical tension. <br/>
        2. <strong>Adaptive Hydration:</strong> Hydrate aggressively with ambient cucumber-lemon rounds to regulate cellular water volume. <br/>
        3. <strong>Protein Synthesizing:</strong> Load 1.6g to 2.2g of biological protein per kilogram of weight for myofibrillar healing.
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://alexfitnesshub.com" style="background-color: #0F172A; color: #ffffff; text-decoration: none; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; padding: 12px 24px; border-radius: 8px; display: inline-block;">
        VIEW ACCLAIMED REPORT ON PORTAL
      </a>
    </div>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; margin: 24px 0 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
      Keep holding the standard,<br />
      <strong>Coach Alex</strong>
    </p>
  `);

  return queueEmail(email, subject, htmlContent, plainText);
}

/**
 * 3. TRIGGER BELLY FAT SHRED REMINDER EMAIL
 */
export async function queueBellyFatShredReminderEmail(
  email: string, 
  displayName: string, 
  currentWeek?: number, 
  currentDay?: number
) {
  const athleteName = displayName || email.split("@")[0] || "Athlete";
  const weekInfoStr = currentWeek && currentDay ? ` (Week ${currentWeek} Day ${currentDay})` : "";
  const subject = `🔥 Action Required: Keep Your Belly Fat Shred Streak Alive!${weekInfoStr}`;

  const plainText = `
Hello ${athleteName},

This is Coach Alex. It is time to complete your daily check-in and workout for the 5-Month Belly Fat Shred program${weekInfoStr}.

- Keep your hydration streak alive (Lemon-Cucumber Water rounds).
- Complete your target daily walking or HIIT session.
- Log your biometrics.

Consistency is key!
- Coach Alex, Sports Scientist & AI Head Coach
  `;

  const htmlContent = emailWrapper(`
    <h2 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: bold; color: #C0392B; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Abdominal Adipose Calibration Active! 🔥
    </h2>
    <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #0F172A; margin: 0 0 24px 0; font-weight: bold; letter-spacing: 1px; uppercase">
      5-MONTH BELLY FAT SHRED RECALL ${currentWeek && currentDay ? `• WEEK ${currentWeek} DAY ${currentDay}` : ""}
    </p>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      Hello <strong>${athleteName}</strong>, Coach Alex here. We are actively calibrated to shrink belly fat, but the primary catalyst for metabolic transformation is <strong style="color: #C0392B;">extreme weekly consistency</strong>.
    </p>

    <div style="background-color: #FEF9E7; border: 1px solid #F9E79F; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #7D6608; margin: 0 0 8px 0; text-transform: uppercase;">
        ⚡ Daily Shred Checklist Checkpoint:
      </h3>
      <ul style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #5D6D7E; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 6px;"><strong>Lemon-Cucumber Water rounds</strong>: Keep cellular volume flushed and detoxify the liver (highly critical for metabolizing visceral fat).</li>
        <li style="margin-bottom: 6px;"><strong>Walking Target (10,000 steps)</strong>: Maintain active thermogenesis and lipid-burning metabolic adaptation.</li>
        <li style="margin-bottom: 6px;"><strong>No Sugar & Intermittent Fasting</strong>: Keep insulin levels flat to allow lipid access.</li>
      </ul>
    </div>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      Unlock today's scheduled training program inside your secure portal dashboard. Let's make sure we log the biometrics accurately!
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://alexfitnesshub.com" style="background-color: #C0392B; color: #ffffff; text-decoration: none; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; padding: 14px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(192, 57, 43, 0.3);">
        RESUME BELLY FAT SHRED
      </a>
    </div>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; margin: 24px 0 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
      No excuses. Only action.<br />
      <strong>Coach Alex</strong>
    </p>
  `);

  return queueEmail(email, subject, htmlContent, plainText);
}

/**
 * 4. TRIGGER LIFESTYLE FITNESS ACADEMY REMINDER EMAIL
 */
export async function queueLifestyleAcademyReminderEmail(
  email: string,
  displayName: string,
  challengeTitle: string,
  completedTasksCount: number,
  experienceLevel: string,
  trainingLocation: string
) {
  const athleteName = displayName || email.split("@")[0] || "Athlete";
  const subject = `🎓 Lifestyle Academy Protocol: Your Action Plan for ${challengeTitle}!`;

  const plainText = `
Hello ${athleteName},

Congratulations on taking charge of your health inside the AlexFitnessHub Lifestyle Fitness Academy! 

We are tracking your progress on: ${challengeTitle}.
You have successfully completed ${completedTasksCount} corrective action milestones so far! Outstanding commitment.

Your Adaptive Plan Details:
- Level: ${experienceLevel}
- Location: ${trainingLocation}

Your Daily Priorities:
1. Complete your custom daily stretching routine.
2. Follow your 3-to-5 day adapted workout schedule.
3. Keep hydrated and walk 10-20 minutes after each major meal.

Keep up the incredible consistency!
- Coach Alex, Sports Scientist & AI Head Coach
  `;

  const htmlContent = emailWrapper(`
    <h2 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 22px; font-weight: bold; color: #C0392B; margin: 0 0 8px 0; letter-spacing: -0.5px;">
      Academy Calibration Active! 🎓
    </h2>
    <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #0F172A; margin: 0 0 24px 0; font-weight: bold; letter-spacing: 1px; uppercase">
      COURSE STATUS REPORT • ${challengeTitle}
    </p>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      Hello <strong>${athleteName}</strong>, Coach Alex here. I am incredibly proud of your active focus inside the <strong>Lifestyle Fitness Academy</strong>. Reversing modern physical imbalances requires consistent daily action.
    </p>

    <!-- PROGRESS PROGRESS REPORT CARD -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #64748B; font-weight: bold; display: block; text-transform: uppercase; letter-spacing: 0.5px;">ACADEMIC ACTION MILESTONES</span>
      <span style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 800; color: #C0392B; display: block; margin: 8px 0 4px 0;">${completedTasksCount} Completed</span>
      <span style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 12px; color: #475569; display: block; font-weight: 600;">You are executing beautifully! Keep pushing your scores higher.</span>
    </div>

    <!-- PROTOCOL DETAILS -->
    <div style="background-color: #FEF9E7; border: 1px solid #F9E79F; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #7D6608; margin: 0 0 10px 0; text-transform: uppercase;">
        ⚡ Your Custom Calibrated Blueprint:
      </h3>
      <ul style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #5D6D7E; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 6px;"><strong>Coaching Level:</strong> Adapted to your <strong>${experienceLevel}</strong> profile.</li>
        <li style="margin-bottom: 6px;"><strong>Workout Location:</strong> Optimized for your <strong>${trainingLocation}</strong> environment.</li>
        <li style="margin-bottom: 6px;"><strong>Core Routine:</strong> 15-minute daily thoracic & hip capsule mobility.</li>
        <li style="margin-bottom: 6px;"><strong>Habit Focus:</strong> 10 to 20-minute walking intervals immediately after each major meal.</li>
      </ul>
    </div>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
      Log back in to mark off your stretching, track hydration metrics, and check your adaptive training program exercises. Remember, tiny daily alignments yield compounding athletic physical structures over time.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://alexfitnesshub.com" style="background-color: #C0392B; color: #ffffff; text-decoration: none; font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; padding: 14px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(192, 57, 43, 0.3);">
        ACCESS MY ACADEMY PANEL
      </a>
    </div>

    <p style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #64748B; margin: 24px 0 0 0; border-top: 1px solid #E2E8F0; padding-top: 20px;">
      Stay consistent, stay resilient.<br />
      <strong>Coach Alex</strong>
    </p>
  `);

  return queueEmail(email, subject, htmlContent, plainText);
}

