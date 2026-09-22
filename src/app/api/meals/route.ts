import { NextRequest, NextResponse } from 'next/server'
import { deleteMealItemDirect, deleteMealDirect } from '@/app/dashboard/deleteActions'

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const mealItemId = url.searchParams.get('mealItemId')
  const mealId = url.searchParams.get('mealId')
  if (mealItemId) {
    await deleteMealItemDirect(mealItemId)
    return NextResponse.json({ ok: true, deleted: 'mealItem', id: mealItemId })
  }
  if (mealId) {
    await deleteMealDirect(mealId)
    return NextResponse.json({ ok: true, deleted: 'meal', id: mealId })
  }
  return NextResponse.json({ ok: false, error: 'Falta mealItemId o mealId' }, { status: 400 })
}
