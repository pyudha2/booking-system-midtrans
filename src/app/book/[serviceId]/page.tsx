import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Form from "./form";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) notFound();

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">{service.name}</h1>
      <p className="mb-4">Rp {service.price.toLocaleString("id-ID")}</p>
      <Form serviceId={service.id} />
    </main>
  );
}
