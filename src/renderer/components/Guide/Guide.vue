<template lang="pug">
v-dialog( v-model="model" persistent width="800" )
  h2 初次使用向导
  v-stepper( v-model="index" vertical )
    guide-step-login( :complete="index > 1" step="1" @success="next" @next="next" )
    guide-step-config( :complete="index > 2" step="2" @next="finish" )
</template>

<script>
import GuideStepLogin from "./GuideStepLogin";
import GuideStepConfig from "./GuideStepConfig";

export default {
  data() {
    return {
      index: 1
    };
  },

  components: {
    GuideStepLogin,
    GuideStepConfig
  },

  computed: {
    model: {
      get() {
        return this.$store.state.app.guideDialog;
      },
      set(value) {
        this.$store.commit("app/TOGGLE_GUIDE_DIALOG", value);
      }
    }
  },

  methods: {
    next() {
      this.index++;
    },

    finish() {
      this.model = false;
    }
  }
};
</script>
