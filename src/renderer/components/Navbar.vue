<template>
  <nav class="navbar navbar-dark">
    <!-- control -->
    <div class="navbar-left">
      <div class="navbar-item">
        <span class="fas fa-user-plus fa-lg"></span>
      </div>
      <div class="navbar-item">
        <span class="fas fa-play fa-lg"></span>
      </div>
      <div class="navbar-item">
        <span class="fas fa-trash fa-lg"></span>
      </div>
    </div>

    <!-- menu -->
    <div class="navbar-right">
      <div class="navbar-item">
        <span class="fas fa-bars fa-lg"></span>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar"
};
</script>

<style lang="stylus">
.navbar {
  width 100%;
  display flex;
  padding 20px 0;

  &.navbar-dark {
    color #ddd;
    background-color #1d1d1d;
  }

  .navbar-left {
    display flex;
    flex-direction row;
    align-items center;
    margin-right auto;
  }

  .navbar-center {
    display flex;
    flex-direction row;
    align-items center;
    justify-content center;
    margin auto;
  }

  .navbar-right {
    display flex;
    flex-direction row;
    align-items center;
    margin-left auto;
  }

  .navbar-item {
    padding 5px 25px;
    cursor pointer;
    border-right 1px #444 solid;

    &:hover {
      color white;
    }
  }
}
</style>
