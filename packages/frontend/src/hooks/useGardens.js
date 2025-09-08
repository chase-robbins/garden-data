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
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

export const useGardens = () => {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGardens([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const gardensRef = collection(db, 'gardens');
    const userQuery = query(
      gardensRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      userQuery,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setGardens(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Gardens Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addGarden = async (name) => {
    if (!user) throw new Error('User not authenticated');
    if (!name.trim()) throw new Error('Garden name is required');
    
    try {
      const docRef = await addDoc(collection(db, 'gardens'), {
        name: name.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding garden:', error);
      throw error;
    }
  };

  const updateGarden = async (id, name) => {
    if (!name.trim()) throw new Error('Garden name is required');
    
    try {
      const docRef = doc(db, 'gardens', id);
      await updateDoc(docRef, {
        name: name.trim(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating garden:', error);
      throw error;
    }
  };

  const deleteGarden = async (id) => {
    try {
      const docRef = doc(db, 'gardens', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting garden:', error);
      throw error;
    }
  };

  return {
    gardens,
    loading,
    error,
    addGarden,
    updateGarden,
    deleteGarden
  };
};