'use server'

import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function logWeightForm(formData: FormData) {
  const session = await getSession()
  if (!session?.userId) redirect('/login')
  const weight = Number(formData.get('weight'))
  if (!weight || isNaN(weight) || weight <= 0 || weight > 500) redirect('/progress')
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  await db.weightLog.create({ data: { userId: session.userId, date, weight } })
  await db.profile.update({
    where: { userId: session.userId },
    data: { currentWeight: weight },
  })
  redirect('/progress')
}
