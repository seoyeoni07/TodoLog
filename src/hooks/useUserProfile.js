import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useUser } from '../context/AuthContext'

export function useUserProfile() {
  const user = useUser()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        setProfile(snap.data())
      } else {
        setProfile({
          uid: user.uid,
          displayName: user.displayName ?? '',
          bio: '',
          handle: '',
          photoURL: user.photoURL ?? '',
        })
      }
    })
  }, [user])

  async function saveProfile(updates) {
    if (!user) return
    const next = { ...profile, ...updates, uid: user.uid }
    await setDoc(doc(db, 'users', user.uid), next, { merge: true })
    setProfile(next)
  }

  return { profile, saveProfile }
}
