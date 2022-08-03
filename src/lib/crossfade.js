import { quintInOut } from 'svelte/easing';
import { flipToPage } from '$lib/flipToPage2.ts';

const [send, receive] = flipToPage({
    easing: quintInOut,
    duration: 1500,

    fallback(node, params) {
        const style = getComputedStyle(node);

        return {
            duration: params.duration,
            easing: quintInOut,
            css: t => `
                opacity: ${t}
            `
        };
    }
});


export {send, receive};
