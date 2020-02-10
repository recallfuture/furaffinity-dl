import Vue from "vue";
import {
  Loading,
  MessageBox,
  Message,
  Notification,
  Button,
  Container,
  Header,
  Main,
  Footer,
  Table,
  TableColumn,
  Avatar,
  Tag,
  ButtonGroup,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Dialog,
  Tabs,
  TabPane,
  Form,
  FormItem,
  Input,
  Switch,
  Select,
  Option,
  Row,
  Col,
  Card,
  Progress,
  Tooltip,
  Checkbox
} from "element-ui";
// @ts-ignore
import Scrollbar from "element-ui/lib/scrollbar";
import "element-ui/lib/theme-chalk/index.css";

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;

Vue.use(Button);
Vue.use(Container);
Vue.use(Header);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Avatar);
Vue.use(Tag);
Vue.use(ButtonGroup);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Dialog);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);
Vue.use(Row);
Vue.use(Col);
Vue.use(Card);
Vue.use(Progress);
Vue.use(Tooltip);
Vue.use(Checkbox);
Vue.use(Scrollbar);
