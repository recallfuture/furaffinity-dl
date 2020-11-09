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
        <v-btn color="blue darken-1" text @click="dialog = false">
          关闭
        </v-btn>
        <v-btn color="blue darken-1" text @click="dialog = false">
          确定
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "@vue/composition-api";

export default defineComponent({
  name: "CookieLogin",
  setup: () => {
    const dialog = ref(false);

    const valid = ref(false);
    const form = reactive({
      a: "",
      b: "",
      requiredRules: [(v: string) => !!v || "该字段不能为空"]
    });

    return {
      dialog,

      valid,
      form
    };
  }
});
</script>
