<script lang="ts">
  import Clock from "./Clock.svelte";
</script>

<nav>
  <p>Degrees of separation between Steam users</p>
  <div class="clock">
    <Clock/>
  </div>
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    vertical-align: middle;
    color: rgb(198, 212, 223);
    background-color: rgb(23, 26, 33);
    text-transform: uppercase;
    font-size: 1.4em;
    padding: 0.75em;
    margin-bottom: 1em;
  }

  p {
    justify-self: left;
  }

  .clock {
    justify-self: right;
  }
</style>
