import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { useUser } from '../context/AuthContext'

export function useTodos() {
  const user = useUser()
  const [todos, setTodos] = useState([])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'todos'), where('uid', '==', user.uid))
    return onSnapshot(q, snap => {
      setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  async function addTodo({ text, categoryId, date, memo = '', time = '', timeEnd = '' }) {
    if (!user || !text.trim()) return
    await addDoc(collection(db, 'todos'), {
      uid: user.uid,
      text: text.trim(),
      memo,
      done: false,
      categoryId: categoryId ?? null,
      date,
      ...(time ? { time } : {}),
      ...(timeEnd ? { timeEnd } : {}),
      createdAt: serverTimestamp(),
    })
  }

  async function updateTodo(id, updates) {
    await updateDoc(doc(db, 'todos', id), updates)
  }

  async function removeRoutineDate(parentId, date) {
    await updateDoc(doc(db, 'todos', parentId), {
      [`deletedDates.${date}`]: true,
    })
  }

  async function toggleTodo(todo) {
    if (todo._isRoutineInstance) {
      const completedDates = { ...(todo._completedDates ?? {}), [todo._routineDate]: !todo.done }
      await updateDoc(doc(db, 'todos', todo._routineId), { completedDates })
    } else {
      await updateDoc(doc(db, 'todos', todo.id), { done: !todo.done })
    }
  }

  async function removeTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id))
    try {
      await deleteDoc(doc(db, 'todos', id))
    } catch (err) {
      console.error('삭제 실패:', err)
      alert('삭제에 실패했습니다.\n' + err.message)
    }
  }

  return { todos, addTodo, updateTodo, toggleTodo, removeTodo, removeRoutineDate }
}
