import { db } from "@/lib/db";

export const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
export const HOLD_MINUTES = 15;
const OFFSET = "+07:00";

export function slotAt(date: string, hour: number){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !HOURS.includes(hour)) return null;
    const d = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00${OFFSET}`);
    return isNaN(d.getTime()) ? null : d;
}

export const slotKey = (serviceId: string, startAt: Date) => 
    `${serviceId}:${startAt.toISOString()}`;

export function releaseStale(){
    return db.booking.updateMany({
        where: {
            status: "PENDING",
            createdAt: { lt: new Date(Date.now() - (HOLD_MINUTES + 1) * 60_000)},
        },
        data: { status: "EXPIRED", slotKey: null},
    });
}