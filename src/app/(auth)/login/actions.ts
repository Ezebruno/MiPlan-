'use server'

import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function loginAction(state: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Faltan campos por completar.' }
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { profile: true }
  })

  if (!user || !user.password) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  const passwordsMatch = await bcrypt.compare(password, user.password)
  if (!passwordsMatch) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  await createSession(user.id)
  
  if (user.profile) {
    redirect('/dashboard')
  } else {
    redirect('/onboarding')
  }
}
