import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await db.service.findMany();

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Booking</h1>
      <ul className="space-y-3">
        {services.map((s) => (
          <li key={s.id}>
            <Link
              href={`/book/${s.id}`}
              className="flex justify-between rounded border p-4 hover:bg-gray-50"
            >
              <span>{s.name}</span>
              <span>Rp {s.price.toLocaleString("id-ID")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
