import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { EXERCISES, Exercise } from "../data/exercises";

export function useCentralizedExercises() {
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to the centralized "exercises" collection in Firestore for real-time media/metadata updates
    const exercisesRef = collection(db, "exercises");
    
    const unsubscribe = onSnapshot(
      exercisesRef,
      (snapshot) => {
        const firestoreExercises: Record<string, any> = {};
        snapshot.forEach((doc) => {
          firestoreExercises[doc.id] = { id: doc.id, ...doc.data() };
        });

        // Merge Firestore metadata & assets with our static EXERCISES list
        const mergedList = EXERCISES.map((staticEx) => {
          const firestoreEx = firestoreExercises[staticEx.id];
          if (firestoreEx) {
            return {
              ...staticEx,
              ...firestoreEx,
              // Keep original ID to ensure compatibility
              id: staticEx.id
            };
          }
          return staticEx;
        });

        // Add any dynamic/new exercises from Firestore that don't exist in the static list
        const finalExercises = [...mergedList];
        Object.values(firestoreExercises).forEach((firestoreEx: any) => {
          if (!finalExercises.some((ex) => ex.id === firestoreEx.id)) {
            finalExercises.push(firestoreEx as Exercise);
          }
        });

        setExercises(finalExercises);
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore exercises fetch warning (falling back to local):", err);
        setError(err);
        setExercises(EXERCISES);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { exercises, loading, error };
}

export default useCentralizedExercises;
