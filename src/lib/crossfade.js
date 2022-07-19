import { quintOut } from 'svelte/easing';
import { crossfade } from '$lib/flipToPage.ts';
const [send, receive] = crossfade({
    easing: quintOut,
    duration: 15000,

    // fallback(node, params) {
    //     const style = getComputedStyle(node);

    //     return {
    //         duration: 400,
    //         easing: quintOut,
    //         css: t => `
    //             opacity: ${t}
    //         `
    //     };
    // }
});

function wrappedSend(node, params) {
    node.classList.add('moving');
    return send(node, params);
}
function wrappedReceive(node, params) {
    node.classList.add('moving');
    return receive(node, params);
    // node.classList.remove('moving');
}

export {wrappedSend as send, wrappedReceive as receive};
