<script lang="ts">
  import PathShowcase from "./PathShowcase.svelte";
  import type {SearchResult} from "../interfaces";

  export let data: SearchResult;
  export let apiKey = "";

  $: processedData = {
    degreeOfSeparation:
      data.degreeOfSeparation === null ? "not found" : numberToNumeral(data.degreeOfSeparation),
    path: data.path === null ? "not found" : data.path,
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

<div class="background">
  <p class="message">
    {"Degree of separation: " + processedData.degreeOfSeparation}
  </p>
  <p class="message">
    {"Connection path discovered: " + processedData.path.join(", ")}
  </p>
  <p class="message">
    {"Requests done: " + processedData.requestsDone}
  </p>
  <p class="message">
    {"Unique profiles fetched: " + processedData.uniqueProfilesFetched}
  </p>
  <p class="message">
    {"Search duration: " + processedData.searchDuration}
  </p>
  {#if processedData.tooManyRequests === true}
    <p class="message">
      Daily requests limit have been exhausted
    </p>
  {/if}
  {#if Array.isArray(processedData.path)}
    <PathShowcase {apiKey} steamIds={processedData.path} />
  {/if}
</div>

<style>
  .message {
    margin: 5px;
  }
</style>
