<script>
  import { onMount } from 'svelte';
  import { createScene } from "$lib/scene";
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { afterNavigate } from '$app/navigation';
  import { browser } from '$app/env'; 
  import Header from "$lib/header/Header.svelte";
  import "../app.css";

  let canvasThreeScene;
  let showThreeScene,
      showHeader,
      showContent = false;

  if($page.url.pathname != '/') {
    showHeader = true;
    showContent = true;
  }

  onMount(() => {
    createScene(canvasThreeScene)
    if($page.url.pathname === '/') {
      if (!browser) {
        showHeader = true;
        showContent = true;
      } else {
        showContent = true;
        window.setTimeout((() => showHeader = true), 1000)
      }
    }
    
  });
</script>



<canvas class="fixed inset-0 -z-10" id="three-scene" bind:this={canvasThreeScene}></canvas>
{#if showHeader}
  <header
    in:fly="{{ y: -8, duration: 1500 }}" 
    out:fly="{{ y: -20, duration: 600, opacity: 0 }}"
  >
    <Header></Header>
  </header>
{/if}
{#if showContent}
  <main 
    in:fade="{{ duration: 1000 }}" 
    out:fade="{{ duration: 600 }}"
  >
    <slot />
  </main>
{/if}

<style>
  header {
		/* position: sticky; */
		top: 0;
		left: 0;
		width: 100%;
		z-index: 100;
		backdrop-filter: blur(5px);
		display: flex;
		justify-content: space-between;
		--background: rgba(255, 255, 255, 0.8);
		background: var(--background);
	}
  header {
    height: var(--header-height);
    position:fixed;
    top: 0;
  }
  main {
    margin-top: var(--header-height);
  }
</style>
