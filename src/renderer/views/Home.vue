<template>
  <div class="home">
    <nav-bar></nav-bar>
  </div>
</template>

<script>
// @ is an alias to /src
import NavBar from "@/renderer/components/NavBar";

export default {
  name: "home",
  components: {
    NavBar
  }
};
</script>
