<template lang="pug">
v-dialog( v-model="model" persistent width="800" )
  v-card( color="primary" )
    v-card-title 初次使用向导
    v-stepper( v-model="step" vertical )
      guide-step-login( :complete="step > 1" step="1" :user="user" @next="finishLogin" )
      guide-step-config( :complete="step > 2" step="2" :config="config" @next="finishConfig" )
</template>

<script>
import GuideStepLogin from "./GuideStepLogin";
import GuideStepConfig from "./GuideStepConfig";

export default {
  model: {
    prop: "dialog",
    event: "change"
  },

  props: {
    dialog: {
      type: Boolean,
      default: false
    },

    user: {
      type: Object,
      default: null
    },

    config: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      model: this.dialog,
      step: 1
    };
  },

  components: {
    GuideStepLogin,
    GuideStepConfig
  },

  methods: {
    finishLogin(user) {
      if (user) {
        this.$emit("user:login", user);
      }
      this.step++;
    },

    finishConfig(config) {
      this.$emit("config:update", config);
      this.finishGuide();
    },

    finishGuide() {
      localStorage.setItem("first_time", JSON.stringify(false));
      this.model = false;
    }
  },

  watch: {
    model(value) {
      this.$emit("change", value);
    },

    dialog(value) {
      this.model = value;
    }
  }
};
</script>
