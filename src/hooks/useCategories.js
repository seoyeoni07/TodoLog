import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, updateDoc, doc
} from 'firebase/firestore'
import { db } from '../firebase'
import { useUser } from '../context/AuthContext'

export const CATEGORY_COLORS = [
  '#6366F1','#818CF8','#3B82F6','#60A5FA',
  '#22C55E','#4ADE80','#F59E0B','#FCD34D',
  '#EF4444','#F87171','#EC4899','#F472B6',
  '#8B5CF6','#A78BFA','#14B8A6','#2DD4BF',
  '#F97316','#FB923C','#84CC16','#A3E635',
]

export function useCategories() {
  const user = useUser()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'categories'), where('uid', '==', user.uid))
    return onSnapshot(q, snap => {
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setCategories(cats)
    })
  }, [user])

  async function addCategory(name, color) {
    if (!user || !name.trim()) return
    await addDoc(collection(db, 'categories'), {
      uid: user.uid,
      name: name.trim(),
      color,
      order: categories.length,
    })
  }

  async function updateCategory(id, updates) {
    await updateDoc(doc(db, 'categories', id), updates)
  }

  async function removeCategory(id) {
    await deleteDoc(doc(db, 'categories', id))
  }

  return { categories, addCategory, updateCategory, removeCategory }
}
