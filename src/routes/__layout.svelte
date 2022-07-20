<script>
  import Header from "$lib/header/Header.svelte";
  import "../app.css";
</script>

<Header></Header>
<div class="container mx-auto">
  <slot />
</div>
