import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { createSnap } from "@/lib/midtrans";
import { HOLD_MINUTES, releaseStale, slotAt, slotKey } from "@/lib/slots";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? "").trim();
  const email = String(b?.email ?? "").trim();
  const phone = String(b?.phone ?? "").trim();
  const startAt = slotAt(String(b?.date), Number(b?.hour));

  if (
    !name ||
    name.length > 100 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !/^\+?\d{8,15}$/.test(phone) ||
    !startAt ||
    startAt.getTime() < Date.now()
  )
    return Response.json({ error: "invalid input" }, { status: 400 });

  const service = await db.service.findUnique({
    where: { id: String(b.serviceId) },
  });
  if (!service)
    return Response.json({ error: "service not found" }, { status: 404 });

  await releaseStale();

  let booking;
  try {
    booking = await db.booking.create({
      data: {
        serviceId: service.id,
        startAt,
        slotKey: slotKey(service.id, startAt),
        name,
        email,
        phone,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return Response.json({ error: "slot taken" }, { status: 409 });
    throw e;
  }

  try {
    const snap = await createSnap({
      orderId: booking.id,
      amount: service.price,
      name,
      email,
      phone,
      finishUrl: `${process.env.APP_URL}/booking/${booking.id}`,
      expiryMinutes: HOLD_MINUTES,
    });
    await db.booking.update({
      where: { id: booking.id },
      data: { payUrl: snap.redirect_url },
    });
    return Response.json({ id: booking.id, payUrl: snap.redirect_url });
  } catch {
    await db.booking.delete({ where: { id: booking.id } });
    return Response.json({ error: "payment failed" }, { status: 502 });
  }
}
