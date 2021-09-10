<script lang="ts">
  import {onMount} from "svelte";
  export let ref;

  let time = new Date();

  onMount(() => {
    const interval = setInterval(() => {
      time = new Date();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

<p {ref}>{time.toLocaleTimeString()}</p>

