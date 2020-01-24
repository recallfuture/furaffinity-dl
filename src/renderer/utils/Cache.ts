function get(key: string) {
  return JSON.parse(localStorage.getItem(key) ?? "null");
}

function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default {
  get,
  set
};
