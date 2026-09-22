'use server'

import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function registerAction(state: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password || !name) {
    return { error: 'Faltan completar campos.' }
  }

  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: 'El email ya está registrado.' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  })

  await createSession(user.id)
  redirect('/onboarding')
}
