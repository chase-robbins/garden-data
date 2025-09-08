import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

export const usePlants = (gardenId) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !gardenId) {
      setPlants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const plantsRef = collection(db, 'plants');
    const plantsQuery = query(
      plantsRef,
      where('userId', '==', user.uid),
      where('gardenId', '==', gardenId)
    );

    const unsubscribe = onSnapshot(
      plantsQuery,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setPlants(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Plants Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, gardenId]);

  const addPlant = async (plantData) => {
    if (!user || !gardenId) throw new Error('User or garden not selected');
    
    try {
      const docRef = await addDoc(collection(db, 'plants'), {
        ...plantData,
        userId: user.uid,
        gardenId: gardenId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  };

  const updatePlant = async (id, plantData) => {
    try {
      const docRef = doc(db, 'plants', id);
      await updateDoc(docRef, {
        ...plantData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  };

  const deletePlant = async (id) => {
    try {
      const docRef = doc(db, 'plants', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
  };

  return {
    plants,
    loading,
    error,
    addPlant,
    updatePlant,
    deletePlant
  };
};