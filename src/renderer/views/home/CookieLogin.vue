<template>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <template v-slot:activator="activator">
      <slot v-bind="activator" />
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Cookie 登录</span>
      </v-card-title>
      <v-card-text>
        <v-alert type="error" v-model="error.show" dismissible>
          {{ error.message }}
        </v-alert>
        <v-form v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.a"
                  label="a"
                  :rules="form.requiredRules"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="form.b"
                  label="b"
                  :rules="form.requiredRules"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="close">
          取消
        </v-btn>
        <v-btn
          color="blue darken-1"
          :loading="form.loading"
          text
          @click="submit"
        >
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "@vue/composition-api";
import { getUserByCookies } from "./getUserByCookies";

export default defineComponent({
  name: "CookieLogin",
  setup: (_, ctx) => {
    const dialog = ref(false);

    const valid = ref(false);
    const form = reactive({
      a: "",
      b: "",
      loading: false,
      requiredRules: [(v: string) => !!v || "该字段不能为空"]
    });
    const error = reactive({
      show: false,
      message: ""
    });

    const close = () => {
      dialog.value = false;
      form.a = form.b = "";
    };

    const trySubmit = async () => {
      const user = await getUserByCookies(form.a, form.b);
      if (!user) {
        error.show = true;
        error.message = "Cookie 无效";
        return;
      }

      dialog.value = false;
      ctx.emit("success", user);
      console.log("login success", user);
    };

    const submit = async () => {
      try {
        form.loading = true;
        await trySubmit();
      } catch (e) {
        error.show = true;
        error.message = e.message;
      } finally {
        form.loading = false;
      }
    };

    return {
      dialog,

      valid,
      form,
      submit,
      close,

      error
    };
  }
});
</script>
