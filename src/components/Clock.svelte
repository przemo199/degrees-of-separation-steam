<script lang="ts">
  import {onMount} from "svelte";

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

<p class="clock">{time.toLocaleTimeString()}</p>

<style>
  .clock {
    margin: 0;
  }
</style>
