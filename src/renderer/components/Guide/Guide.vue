<template lang="pug">
v-dialog( v-model="$store.state.app.guideDialog" persistent )
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

  methods: {
    next() {
      this.index++;
    },

    finish() {
      this.$store.commit("app/TOGGLE_GUIDE_DIALOG", false);
    }
  }
};
</script>
