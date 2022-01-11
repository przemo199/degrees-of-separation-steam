<script lang="ts">
  import ConnectionPathView from "./ConnectionPathView.svelte";
  import type {SearchResult} from "shared";

  export let data: SearchResult;
  export let apiKey;

  $: toDisplay = {
    degreeOfSeparation:
      data.degreeOfSeparation === null ? "not found" : numberToNumeral(data.degreeOfSeparation),
    path: data.path === null ? "not found" : data.path.join(", "),
    requestsDone: data.requestsDone,
    uniqueProfilesFetched: data.uniqueProfilesFetched,
    searchDuration: (data.searchDuration / 1000) + "s",
    tooManyRequests: data.tooManyRequests
  };

  function numberToNumeral(number: number): string {
    switch (number % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
      default:
        return number + "th";
    }
  }
</script>

<p class="message">
  {"Degree of separation: " + toDisplay.degreeOfSeparation}
</p>
<p class="message">
  {"Connection path discovered: " + toDisplay.path}
</p>
<p class="message">
  {"Requests done: " + toDisplay.requestsDone}
</p>
<p class="message">
  {"Unique profiles fetched: " + toDisplay.uniqueProfilesFetched}
</p>
<p class="message">
  {"Search duration: " + toDisplay.searchDuration}
</p>
{#if toDisplay.tooManyRequests === true}
  <p class="message">
    Daily requests limit have been exhausted
  </p>
{/if}
{#if Array.isArray(data.path)}
  <ConnectionPathView {apiKey} steamIds={data.path} />
{/if}

<style>
  .message {
    margin: 5px;
  }
</style>
