import {
    update
} from './update.mjs';
console.log("[vite] connecting...");

function debounce(fn, delay = 500) {
    let timer = null
    return function () {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments)
            timer = null //释放空间                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        }, delay)
    }
}


const socket = new WebSocket(`ws://localhost:23456`, "vite-hmr");


async function handleMessage(payload) {
    switch (payload.type) {
        case "connected":
            console.log(`[vite] connected.`);
            setInterval(() => socket.send("ping"), 1000);
            break;

        case "update":
            const {
                file,
                root
            } = payload;
            try {
                debounce(update(root), 2000);
            } catch (e) {
                throw new Error(e);
            }
            break;
    }
}

socket.addEventListener("message", async ({
    data
}) => {
    handleMessage(JSON.parse(data)).catch(console.error);
});