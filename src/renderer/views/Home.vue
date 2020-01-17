<template>
  <div class="home">
    <navbar></navbar>
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from "@/renderer/components/Navbar";

export default {
  name: "home",
  components: {
    Navbar
  }
};
</script>
