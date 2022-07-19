<script lang="ts">
    import { onMount } from 'svelte';
    import {send, receive} from '$lib/crossfade.js'

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
    <div class="header rounded-md shadow-md hover:shadow-lg py-4" style="background-color:{item.attributes.backgroundColor}">
        <div class="logo">
            <img class="mx-auto" src="http://strapi.moon-toon.de{item.attributes.logoImage.data.attributes.url}" alt="{item.title}">
        </div>
        {#if show=='page'}
            <h1 class="title">{item.attributes.title}</h1>
        {/if}
        <div class="background">

        </div>
    </div>
    {#if show=='page'}
        <div class="content">
            {@html description}
        </div> 
    {/if}
</div>

<style>
    .portfolio-item.page {
        position: fixed;
        width: 100%;
        height: 100%;
        left: 50%;
        top: 0;
        transform: translateX(-50%);
    }
    .portfolio-item.page .header {
        border-radius: 0 !important;
        box-shadow: none !important;
    }
    .portfolio-item.card {
        /* max-height: 200px; */
    }
    .portfolio-item .logo img {
        width: 40%;
        max-width: 350px;
    }
</style>