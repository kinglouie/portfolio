<script lang="ts">
    import { onMount } from 'svelte';
    import {send, receive} from '$lib/crossfade.js'
    import { fade, fly } from 'svelte/transition';


    export let item : any;
    export let show = 'page'; // alt is card
    let description = item.attributes.description;

    onMount(async () => {
        // Install the marked package first!
        // Run this command: npm i marked
        // We're using this style of importing because "marked" uses require, which won't work when we import it with SvelteKit.
        // Check the "How do I use a client-side only library" in the FAQ: https://kit.svelte.dev/faq
        
        const marked = (await import('marked')).marked;
        description = marked(item.attributes.description);
        
    });
</script>


<div 
    class="portfolio-item container {show === 'page' ? 'page' : 'card'}"
    in:receive="{{key: item.id}}"
    out:send="{{key: item.id}}"
>
    <div class="header rounded-md shadow-md hover:shadow-lg py-4 relative overflow-hidden" style="background-color:{item.attributes.backgroundColor}">
        <div class="logo absolute top-3 left-3 max-w-[30%] z-10">
            <img src="http://strapi.moon-toon.de{item.attributes.logoImage.data.attributes.url}" alt="{item.title}">
        </div>
        {#if show=='page'}
            <h1 class="title text-9xl absolute top-1/2 -translate-y-1/2 whitespace-nowrap" style="color:{item.attributes.foregroundColor}" in:fly="{{ x: 200, duration: 2000, delay: 600 }}" out:fly="{{ x: 5, duration: 500, delay: 200 }}">{item.attributes.title}</h1>
        {/if}
        <div class="background absolute inset-0">
            <img class="mx-auto h-full w-full object-cover" src="http://strapi.moon-toon.de{item.attributes.logoBackgroundImage.data.attributes.url}" alt="{item.title}">
        </div>
    </div>
    {#if show=='page'}
        <div class="content relative grid grid-cols-2" in:fly="{{ y: -100, duration: 1200, delay: 1200 }}" out:fly="{{ y: -20, duration: 600, delay: 200 }}">
            <div class="card rounded-md shadow-md">
                <p class="text-4xl mb-6" in:fly="{{ x: 200, duration: 2000, delay: 600 }}" out:fade="{{delay: 1200}}">{item.attributes.title}</p>
                <p>{item.attributes.subtitle}</p>
            </div> 
            <div class="longtext">
                {@html description}
            </div> 
        </div> 
    {/if}
</div>

<style>
    .portfolio-item .header {
        min-height:350px;
    }
    .portfolio-item .logo img {
        width: 40%;
        max-width: 350px;
    }

    


    /* detail page */

    .portfolio-item.page {
        position: absolute;
        width: 100%;
        height: 100%;
        top: var(--header-height);
        left: 50%;
        transform: translateX(-50%);
        z-index: 5;
    }
    
    .portfolio-item.page .header {
        border-radius: 0 !important;
        box-shadow: none !important;
    }

    .portfolio-item.page .card {
        margin: 0 auto;
        max-width: 350px;
        min-width: 200px;
        padding: 20px;
        background: var(--card-color);
        color: var(--card-text-color);
        position: relative;
        top:-100px;
    }
    
    
</style>