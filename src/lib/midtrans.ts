import { createHash, timingSafeEqual } from "node:crypto";

const key = () => process.env.MIDTRANS_SERVER_KEY!;

const base = () =>
    process.env.MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com"
        : "https://app.sandbox.midtrans.com";

export async function createSnap(p: {
    orderId: string;
    amount: number;
    name: string;
    email: string;
    phone: string;
    finishUrl: string;
    expiryMinutes: number;
}) {
    const res = await fetch(`${base()}/snap/v1/transactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${Buffer.from(key()).toString("base64")}`,
        },
        body: JSON.stringify({
            transaction_details: { order_id: p.orderId, gross_amount: p.amount },
            customer_details: { first_name: p.name, email: p.email, phone: p.phone },
            expiry: { unit: "minutes", duration: p.expiryMinutes },
            callbacks: { finish: p.finishUrl },
        }),
    });
    if (!res.ok) throw new Error(`midtrans ${res.status}`);
    return (await res.json()) as { token: string; redirect_url: string};
}

export function validSignature(n: Record<string, string>){
    const expected = createHash("sha512")
        .update(n.order_id + n.status_code + n.gross_amount + key())
        .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(String(n.signature_key));
    return a.length === b.length && timingSafeEqual(a, b);
}