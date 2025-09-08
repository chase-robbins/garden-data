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

export const useLines = (gardenId) => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !gardenId) {
      setLines([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const linesRef = collection(db, 'lines');
    const linesQuery = query(
      linesRef,
      where('userId', '==', user.uid),
      where('gardenId', '==', gardenId)
    );

    const unsubscribe = onSnapshot(
      linesQuery,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setLines(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Lines Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, gardenId]);

  const addLine = async (lineData) => {
    if (!user || !gardenId) throw new Error('User or garden not selected');
    
    try {
      const docRef = await addDoc(collection(db, 'lines'), {
        ...lineData,
        userId: user.uid,
        gardenId: gardenId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding line:', error);
      throw error;
    }
  };

  const updateLine = async (id, lineData) => {
    try {
      const docRef = doc(db, 'lines', id);
      await updateDoc(docRef, {
        ...lineData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating line:', error);
      throw error;
    }
  };

  const deleteLine = async (id) => {
    try {
      const docRef = doc(db, 'lines', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting line:', error);
      throw error;
    }
  };

  return {
    lines,
    loading,
    error,
    addLine,
    updateLine,
    deleteLine
  };
};