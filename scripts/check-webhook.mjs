import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const url = process.env.APP_URL + "/api/midtrans/webhook";
const key = process.env.MIDTRANS_SERVER_KEY;
const n = { order_id: "check-unknown", status_code: "200", gross_amount: "1000.00"};
const sig = createHash("sha512")
    .update(n.order_id + n.status_code + n.gross_amount + key)
    .digest("hex");

const post = (signature_key) =>
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ ...n, signature_key }),
    });

assert.equal((await post("bad")).status, 401);
assert.equal((await post(sig)).status, 200);
console.log("ok");