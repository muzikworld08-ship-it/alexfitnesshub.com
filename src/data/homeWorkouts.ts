export interface HomeExercise {
  id: string;
  name: string;
  duration: number; // in seconds
  instructions: string[];
  muscles: string[];
  beginnerMod: string;
  advancedVar: string;
  caloriesEst: string; // e.g. "10-15 kcal"
  safetyTips: string[];
  mediaName: string; // name to match in UnifiedExerciseMedia / exercises library
}

export interface HomeWorkoutCircuit {
  id: string;
  title: string;
  category: string;
  level: string;
  workoutType: string;
  equipment: string;
  duration: number; // total in minutes
  targetAreas: string[];
  estimatedCalories: string;
  exercises: HomeExercise[];
}

export const bellyFatCardioCircuit: HomeWorkoutCircuit = {
  id: "belly_fat_cardio_circuit_12",
  title: "12 Minute Belly Fat Cardio Circuit",
  category: "Home Workout",
  level: "Beginner to Intermediate",
  workoutType: "HIIT Cardio",
  equipment: "No Equipment",
  duration: 12,
  targetAreas: ["Full Body", "Core", "Legs", "Glutes", "Shoulders"],
  estimatedCalories: "120 to 220 kcal",
  exercises: [
    {
      id: "hw-jumping-jacks",
      name: "Jumping Jacks",
      duration: 30,
      instructions: [
        "Stand with your feet together and your arms resting at your sides.",
        "Jump your feet out to the sides while sweeping your arms up overhead.",
        "Immediately jump back to the starting position, lowering your arms smoothly."
      ],
      muscles: ["Full Body", "Calves", "Shoulders"],
      beginnerMod: "Step-out Jacks (step one foot out at a time without jumping)",
      advancedVar: "Star Jumps (squat low and explode into the air spreading arms and legs)",
      caloriesEst: "10 - 15 kcal",
      safetyTips: [
        "Land softly on the balls of your feet to absorb the impact.",
        "Maintain a slight bend in your knees throughout the entire movement."
      ],
      mediaName: "Jumping Jacks"
    },
    {
      id: "hw-high-knees",
      name: "High Knees",
      duration: 30,
      instructions: [
        "Stand upright with your feet hip-width apart.",
        "Run in place, driving your knees up toward your chest as high as possible.",
        "Pump your arms in rhythm with your legs to maintain high cardiovascular output."
      ],
      muscles: ["Hip Flexors", "Quads", "Core", "Calves"],
      beginnerMod: "Marching in place with high knee drives and core compression",
      advancedVar: "Power High Knees (maximum speed double-tap tempo)",
      caloriesEst: "12 - 18 kcal",
      safetyTips: [
        "Keep your torso upright and engage your abs; do not lean backward.",
        "Ensure your shoulders remain relaxed and do not tense up near your ears."
      ],
      mediaName: "High Knees"
    },
    {
      id: "hw-butt-kicks",
      name: "Butt Kicks",
      duration: 30,
      instructions: [
        "Stand with your feet close together and hands resting at your sides.",
        "Run in place, actively kicking your heels up toward your glutes on every stride.",
        "Keep your thighs relatively vertical and focus on the hamstring contraction."
      ],
      muscles: ["Hamstrings", "Quads", "Glutes"],
      beginnerMod: "Slow paced butt-kick steps in place with active arm sweeps",
      advancedVar: "High-tempo sprinting butt kicks (maximum cadence)",
      caloriesEst: "10 - 14 kcal",
      safetyTips: [
        "Keep your knees pointing down toward the floor; avoid flaring thighs forward.",
        "Keep your abdominal muscles braced to support a neutral spine."
      ],
      mediaName: "Butt Kicks"
    },
    {
      id: "hw-squat-pulses",
      name: "Squat Pulses",
      duration: 30,
      instructions: [
        "Stand with feet shoulder-width apart, chest up, and hands in front of you.",
        "Lower your hips back and down into a deep squat, keeping weight in your heels.",
        "Instead of standing back up, rise only 2 inches and pulse up and down in this range."
      ],
      muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
      beginnerMod: "Standard bodyweight squat without the pulsing hold",
      advancedVar: "Jump Squat Pulses (perform 3 pulses at the bottom, then explode into a jump)",
      caloriesEst: "8 - 12 kcal",
      safetyTips: [
        "Keep your chest proud and do not let your knees cave inward.",
        "Ensure your knees remain aligned behind your toes throughout the pulses."
      ],
      mediaName: "Squat Pulses"
    },
    {
      id: "hw-standing-knee-crunches",
      name: "Standing Knee Crunches",
      duration: 30,
      instructions: [
        "Stand tall with your feet hip-width apart and hands placed lightly behind your head.",
        "Drive your right knee up diagonally across your body toward your chest.",
        "Rotate your left elbow to meet the rising knee, crunching your obliques.",
        "Return to starting position and immediately repeat on the alternate side."
      ],
      muscles: ["Rectus Abdominis", "Obliques", "Hip Flexors"],
      beginnerMod: "Hands on hips, performing a smaller knee lift without the elbow rotation",
      advancedVar: "Weighted Standing Crunches (hold a moderate dumbbell at your chest)",
      caloriesEst: "7 - 10 kcal",
      safetyTips: [
        "Focus on abdominal compression rather than trying to yank your elbow to knee.",
        "Do not pull on the back of your head; keep your hands light on your ears."
      ],
      mediaName: "Standing Knee Crunches"
    },
    {
      id: "hw-pushup-plank-tap",
      name: "Push-Up to Plank Tap",
      duration: 30,
      instructions: [
        "Start in a high plank position with your hands stacked directly under your shoulders.",
        "Lower your chest to the floor keeping your elbows tucked at a 45-degree angle.",
        "Push back up to the top, then tap your left shoulder with your right hand.",
        "Place hand down, repeat the push-up, and tap your right shoulder with your left hand."
      ],
      muscles: ["Chest", "Shoulders", "Triceps", "Anterior Core"],
      beginnerMod: "Incline push-up (hands on a elevated surface) or knee push-up, omitting taps",
      advancedVar: "Plyometric Push-Up (explode off the ground, tap shoulders in mid-air)",
      caloriesEst: "9 - 13 kcal",
      safetyTips: [
        "Keep your hips perfectly level during shoulder taps; avoid swaying or rotating.",
        "Maintain a solid head-to-heel straight line; do not let your lower back sag."
      ],
      mediaName: "Push-ups"
    },
    {
      id: "hw-mountain-climbers",
      name: "Mountain Climbers",
      duration: 30,
      instructions: [
        "Assume a solid high plank position with your core tightly engaged.",
        "Drive your right knee toward your chest as far as comfortable.",
        "As you return the right leg, immediately drive your left knee toward your chest.",
        "Alternate legs in a rapid, continuous running motion while keeping your posture low."
      ],
      muscles: ["Rectus Abdominis", "Obliques", "Shoulders", "Hip Flexors"],
      beginnerMod: "Slow-paced mountain climbers (stepping one leg at a time instead of running)",
      advancedVar: "Cross-body sliding climbers (drive knee to the opposite elbow at maximum speed)",
      caloriesEst: "11 - 16 kcal",
      safetyTips: [
        "Keep your shoulders directly over your wrists; do not push your hips into the air.",
        "Engage your upper back muscles to avoid collapsing between your shoulder blades."
      ],
      mediaName: "Mountain Climbers"
    },
    {
      id: "hw-bicycle-crunches",
      name: "Bicycle Crunches",
      duration: 30,
      instructions: [
        "Lie flat on your back with your lower spine pressed firmly into the floor.",
        "Place hands behind your ears and lift your feet, bending knees at 90 degrees.",
        "Extend your right leg straight out while crunching and rotating left knee to meet right elbow.",
        "Reverse the movement in a smooth, continuous pedaling pattern on alternate sides."
      ],
      muscles: ["Obliques", "Upper Abs", "Lower Abs"],
      beginnerMod: "Keep feet flat on the floor, marching one knee up at a time to crunch",
      advancedVar: "Leg-Straight Bicycle Crunches (scissors-style twist at low elevation)",
      caloriesEst: "7 - 11 kcal",
      safetyTips: [
        "Lead with your chest and shoulder blades; do not lead with your elbows to protect neck.",
        "Maintain a slow, deliberate cadence to maximize muscular tension over momentum."
      ],
      mediaName: "Bicycle Crunches"
    },
    {
      id: "hw-plank-jack-tuck",
      name: "Plank Jack to Tuck",
      duration: 30,
      instructions: [
        "Start in a high plank position with your feet close together and core braced.",
        "Jump your feet out wide (plank jack), then immediately jump them back together.",
        "From this plank, jump both feet forward in toward your hands (tuck jump).",
        "Jump your feet straight back to the starting plank position to repeat the loop."
      ],
      muscles: ["Anterior Core", "Shoulders", "Hip Flexors", "Glutes"],
      beginnerMod: "Step-out plank jacks (stepping one foot out at a time, omitting the tuck)",
      advancedVar: "Continuous high-tempo double plank jacks into explosive knee tuck",
      caloriesEst: "12 - 17 kcal",
      safetyTips: [
        "Do not allow your lower back to sag or arch during the jack or tuck jumps.",
        "Brace your core on landing to support your lumbar spine."
      ],
      mediaName: "Plank Hold"
    },
    {
      id: "hw-russian-twists",
      name: "Russian Twists",
      duration: 30,
      instructions: [
        "Sit on the floor with knees bent and feet resting lightly on the ground.",
        "Hinge backward from your hips slightly, keeping your spine straight and proud chest.",
        "Lift your feet 2-3 inches off the ground to balance on your sit bones.",
        "Interlock your hands and twist your torso fully from side to side, tapping the floor."
      ],
      muscles: ["Obliques", "Transverse Abdominis", "Hip Flexors"],
      beginnerMod: "Keep your heels resting lightly on the floor to reduce balance tension",
      advancedVar: "Weighted Russian Twists (hold a medicine ball or dumbbell while rotating)",
      caloriesEst: "6 - 10 kcal",
      safetyTips: [
        "Keep your spine tall and neutral; do not round your shoulders or lower back.",
        "Ensure your head follows the rotation of your shoulders to protect cervical spine."
      ],
      mediaName: "Russian Twist"
    },
    {
      id: "hw-burpees",
      name: "Burpees (Beginner Friendly)",
      duration: 30,
      instructions: [
        "Stand tall, then squat down and place your hands flat on the floor in front of you.",
        "Step or jump your feet back to land in a strong, stable high plank.",
        "Optionally perform a light push-up, then step or jump your feet forward under your chest.",
        "Stand up quickly and perform a small overhead arm reach or explosive jump."
      ],
      muscles: ["Pectorals", "Quadriceps", "Hamstrings", "Shoulders", "Core"],
      beginnerMod: "Step-back Burpees (stepping back and standing up without jumps or push-ups)",
      advancedVar: "Chest-to-Floor Burpee (full push-up and explosive high tuck jump at the top)",
      caloriesEst: "14 - 20 kcal",
      safetyTips: [
        "Keep your core fully active when in plank to protect your lower back from sagging.",
        "Land with soft, slightly bent knees on the vertical jump."
      ],
      mediaName: "Burpees"
    },
    {
      id: "hw-flutter-kicks",
      name: "Flutter Kicks",
      duration: 30,
      instructions: [
        "Lie on your back, placing hands under your glutes for lumbar support.",
        "Raise your legs about 6 inches off the floor, keeping them straight and toes pointed.",
        "Perform rapid, alternating flutter movements up and down with your legs in a small range."
      ],
      muscles: ["Lower Abdominis", "Hip Flexors"],
      beginnerMod: "Bend knees slightly or raise legs higher (to 45 degrees) to reduce strain",
      advancedVar: "Hollow Body Flutter Kicks (shoulder blades and head lifted off the floor, arms extended)",
      caloriesEst: "6 - 9 kcal",
      safetyTips: [
        "Ensure your lower back stays pressed firmly into the floor; stop if it arches.",
        "Keep your legs fully straight and flex your quads to isolate the lower core."
      ],
      mediaName: "Flutter Kicks"
    }
  ]
};
