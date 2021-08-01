import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/renderer/assets/css/tailwind.css";
import "@/renderer/assets/css/base.css";

import {
  ConfigProvider,
  Button,
  Layout,
  Menu,
  message,
  Breadcrumb,
  Modal,
  Form,
  Input,
  PageHeader,
} from "ant-design-vue";

const app = createApp(App);

app.use(store);
app.use(router);
app.use(ConfigProvider);
app.use(Button);
app.use(Layout);
app.use(Menu);
app.use(Breadcrumb);
app.use(Modal);
app.use(Form);
app.use(Input);
app.use(PageHeader);

app.config.globalProperties.$message = message;

app.mount("#app");
