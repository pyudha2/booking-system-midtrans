import { db } from "@/lib/db";
import { validSignature } from "@/lib/midtrans";

export async function POST(req: Request) {
    const n = await req.json();
    if (!n || !validSignature(n)) return new Response("invalid", { status: 401});

    const booking = await db.booking.findUnique({
        where: { id: n.order_id },
        include: { service: true },
    });
    if (!booking) return new Response("ok");

    if (Number(n.gross_amount) !== booking.service.price)
        return new Response("amount mismatch", { status: 400 });

    const s: string = n.transaction_status;
    let data: { status: "PAID" | "FAILED" | "EXPIRED"; slotKey?: null } | null = null;

    if (s === "settlement" || (s === "capture" && n.fraud_status === "accept"))
        data = { status: "PAID" };
    else if ( s === "expire" ) data = { status: "EXPIRED", slotKey: null};
    else if (["deny", "cancel", "failure"].includes(s))
        data = { status: "FAILED", slotKey: null };

    if(data)
        await db.booking.updateMany({
            where: { id: booking.id, status: "PENDING"},
            data,
        });

    return new Response("ok");
}