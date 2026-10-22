import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await db.booking.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!b) notFound();

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">{b.service.name}</h1>
      <p>
        {b.startAt.toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          dateStyle: "full",
          timeStyle: "short",
        })}
      </p>
      <p className="my-2 font-semibold">Status: {b.status}</p>
      {b.status === "PENDING" && b.payUrl && (
        <a
          href={b.payUrl}
          className="inline-block rounded bg-black px-4 py-2 text-white"
        >
          Lanjut bayar
        </a>
      )}
    </main>
  );
}
