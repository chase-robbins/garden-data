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

export const usePlantNotes = (plantId) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !plantId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Reference to the notes subcollection
    const notesRef = collection(db, 'plants', plantId, 'notes');
    const notesQuery = query(
      notesRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setNotes(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Plant notes Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, plantId]);

  const addNote = async (noteText) => {
    if (!user || !plantId) throw new Error('User or plant not selected');
    if (!noteText.trim()) throw new Error('Note text is required');
    
    try {
      const notesRef = collection(db, 'plants', plantId, 'notes');
      const docRef = await addDoc(notesRef, {
        text: noteText.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding plant note:', error);
      throw error;
    }
  };

  const updateNote = async (noteId, noteText) => {
    if (!noteText.trim()) throw new Error('Note text is required');
    
    try {
      const noteRef = doc(db, 'plants', plantId, 'notes', noteId);
      await updateDoc(noteRef, {
        text: noteText.trim(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating plant note:', error);
      throw error;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const noteRef = doc(db, 'plants', plantId, 'notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Error deleting plant note:', error);
      throw error;
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote
  };
};