import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

export const usePlantMeasurements = (plantId) => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !plantId) {
      setMeasurements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Reference to the measurements subcollection
    const measurementsRef = collection(db, 'plants', plantId, 'measurements');
    const measurementsQuery = query(
      measurementsRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      measurementsQuery,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setMeasurements(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Plant measurements Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, plantId]);

  const addMeasurement = async (measurementData) => {
    if (!user || !plantId) throw new Error('User or plant not selected');
    
    // Validate that at least one measurement is provided
    const { light, moisture, soil_ph, temp, customDateTime } = measurementData;
    if (light === undefined && moisture === undefined && soil_ph === undefined && temp === undefined) {
      throw new Error('At least one measurement is required');
    }
    
    try {
      const measurementsRef = collection(db, 'plants', plantId, 'measurements');
      
      // Use custom date/time if provided, otherwise use server timestamp
      const timestamp = customDateTime ? new Date(customDateTime) : serverTimestamp();
      
      const docRef = await addDoc(measurementsRef, {
        light: light !== undefined ? Number(light) : null,
        moisture: moisture !== undefined ? Number(moisture) : null,
        soil_ph: soil_ph !== undefined ? Number(soil_ph) : null,
        temp: temp !== undefined ? Number(temp) : null,
        userId: user.uid,
        createdAt: timestamp,
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding plant measurement:', error);
      throw error;
    }
  };

  const updateMeasurement = async (measurementId, measurementData) => {
    const { light, moisture, soil_ph, temp } = measurementData;
    if (light === undefined && moisture === undefined && soil_ph === undefined && temp === undefined) {
      throw new Error('At least one measurement is required');
    }
    
    try {
      const measurementRef = doc(db, 'plants', plantId, 'measurements', measurementId);
      await updateDoc(measurementRef, {
        light: light !== undefined ? Number(light) : null,
        moisture: moisture !== undefined ? Number(moisture) : null,
        soil_ph: soil_ph !== undefined ? Number(soil_ph) : null,
        temp: temp !== undefined ? Number(temp) : null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating plant measurement:', error);
      throw error;
    }
  };

  const deleteMeasurement = async (measurementId) => {
    try {
      const measurementRef = doc(db, 'plants', plantId, 'measurements', measurementId);
      await deleteDoc(measurementRef);
    } catch (error) {
      console.error('Error deleting plant measurement:', error);
      throw error;
    }
  };

  return {
    measurements,
    loading,
    error,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement
  };
};