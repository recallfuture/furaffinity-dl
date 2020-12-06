import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "@/renderer/views/home/index.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  }
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
});

export default router;
