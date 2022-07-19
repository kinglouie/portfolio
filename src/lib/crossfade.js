import { quintOut } from 'svelte/easing';
import { flipToPage } from '$lib/flipToPage.ts';
const [send, receive] = flipToPage({
    easing: quintOut,
    duration: 2000,

    fallback(node, params) {
        const style = getComputedStyle(node);

        return {
            duration: 2000,
            easing: quintOut,
            css: t => `
                opacity: ${t}
            `
        };
    }
});


export {send, receive};
