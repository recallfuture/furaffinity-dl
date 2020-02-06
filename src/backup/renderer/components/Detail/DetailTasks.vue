<template lang="pug">
  v-card
    v-card-title {{ title }}
    
    v-divider( light)

    v-container( fluid )
      v-row
        div(
          v-for="task in tasks"
          :key="task.id"
          :class="statusToColor(task.status)"
          class="ma-1 card"
        )
          div( class="tip" )
            div( class="text-no-wrap" ) 作品地址：{{ task.url }}
            div( v-if="task.status === 'complete'" class="text-no-wrap" ) 作品路径：{{ task.path }}
</template>

<script>
export default {
  name: "DetailTasks",

  props: {
    title: {
      type: String,
      default: ""
    },

    tasks: {
      type: Array,
      required: true
    }
  },

  methods: {
    statusToColor(status) {
      switch (status) {
        case "active": {
          return "accent";
        }
        case "complete": {
          return "primary";
        }
        case "paused": {
          return "info";
        }
        case "error": {
          return "error";
        }
        default: {
          return "white";
        }
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.card {
  width: 20px;
  height: 20px;
  position: relative;
}

.card .tip {
  position: absolute;
  bottom: 100%;
  padding: 4px;
  background-color: #444;
  border: 1px #999 solid;
  z-index: 100;
  opacity: 0;
  transition: opacity 0.4s;
  transform: translateX(-50%);
  visibility: hidden;
}

.card:hover .tip {
  opacity: 1;
  visibility: visible;
}
</style>
