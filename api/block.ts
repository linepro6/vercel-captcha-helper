import { Redis } from "@upstash/redis";
const kv = Redis.fromEnv();

export const config = {
    runtime: 'edge',
}

function sleep(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const user = String(url.searchParams.get("userid"))
    let data = await kv.get(user);
    const start = Date.now();
    while (!data && Date.now() - start < 24 * 1000) {
        await sleep(1000);
        data = await kv.get(user);
    }
    if (data) {
        await kv.del(user);
    }
    return new Response(
        data ? JSON.stringify(data) : null,
        {
            status: data ? 200 : 204,
            headers: {
                'content-type': 'application/json',
            },
        }
    )
}
