<script lang="ts">
  import NavBar from "./components/NavBar.svelte";
  import MainPage from "./components/SearchPage.svelte";
</script>

<main>
  <NavBar />
  <MainPage />
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    text-align: center;
    min-width: 640px;
    color: rgb(184, 182, 180);
  }
</style>
