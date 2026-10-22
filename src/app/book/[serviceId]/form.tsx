"use client";

import { useEffect, useState } from "react";

export default function Form({ serviceId }: { serviceId: string }) {
  const [date, setDate] = useState("");
  const [hours, setHours] = useState<number[]>([]);
  const [hour, setHour] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!date) return;
    fetch(`/api/slots?serviceId=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setHours(Array.isArray(d) ? d : []));
  }, [date, serviceId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hour === null) return setError("Pilih jam dulu");

    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        date,
        hour,
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
      }),
    });
    const data = await res.json();

    if (res.ok) {
      window.location.href = data.payUrl;
      return;
    }
    setError(data.error);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="date"
        required
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setHour(null);
          setHours([]);
        }}
        className="w-full rounded border p-2"
      />

      <div className="flex flex-wrap gap-2">
        {hours.map((h) => (
          <button
            type="button"
            key={h}
            onClick={() => setHour(h)}
            className={`rounded border px-3 py-1 ${
              hour === h ? "bg-black text-white" : ""
            }`}
          >
            {String(h).padStart(2, "0")}:00
          </button>
        ))}
        {date && hours.length === 0 && <p>Slot penuh</p>}
      </div>

      <input
        name="name"
        required
        placeholder="Nama"
        className="w-full rounded border p-2"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded border p-2"
      />
      <input
        name="phone"
        type="tel"
        required
        placeholder="08xxxxxxxxxx"
        className="w-full rounded border p-2"
      />

      {error && <p className="text-red-600">{error}</p>}

      <button
        disabled={busy}
        className="w-full rounded bg-black p-2 text-white disabled:opacity-50"
      >
        Bayar
      </button>
    </form>
  );
}
