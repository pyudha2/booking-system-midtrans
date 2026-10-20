import { db } from "@/lib/db";
import { HOURS, releaseStale, slotAt} from "@/lib/slots";

export async function GET(req: Request) {
    const q = new URL(req.url).searchParams;
    const serviceId = q.get("serviceId") ?? "";
    const date = q.get("date") ?? "";

    if(!slotAt(date, HOURS[0]))
        return Response.json({ error: "Invalid date" }, { status: 400 });

    await releaseStale();

    const taken = await db.booking.findMany({
        where: {
            serviceId,
            startAt: {in: HOURS.map((h) => slotAt(date, h)!)},
            slotKey: {not: null},
        },
        select: { startAt: true },
    });

    const busy = new Set(taken.map((t) => t.startAt.getTime()));
    const free = HOURS.filter((h) => {
        const t = slotAt(date, h)!.getTime();
        return t > Date.now() && !busy.has(t);
    });
    return Response.json({ free });
}