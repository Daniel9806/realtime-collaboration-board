import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import UserList from "@/components/UserList.vue";
import { useUsersStore } from "@/stores/users";

describe("UserList", () => {
  it("renders online users from the store", () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const usersStore = useUsersStore();
    usersStore.setOnlineUsers(["Ana", "Carlos"]);

    const wrapper = mount(UserList, {
      global: {
        plugins: [pinia]
      }
    });

    expect(wrapper.text()).toContain("Online:");
    expect(wrapper.text()).toContain("Ana");
    expect(wrapper.text()).toContain("Carlos");
  });
});
