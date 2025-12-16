import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import JoinView from "@/views/JoinView.vue";
import { useSessionStore } from "@/stores/session";

vi.mock("@/services/realtime/realtimeController", () => {
  return {
    startRealtime: vi.fn()
  };
});

describe("JoinView", () => {
  it("shows an error if the name is empty", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const session = useSessionStore();
    session.setUserName("");

    const wrapper = mount(JoinView, {
      global: {
        plugins: [pinia]
      }
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.text()).toContain("Ingresa un nombre.");
  });

  it("stores trimmed name and starts realtime", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const session = useSessionStore();

    const { startRealtime } = await import("@/services/realtime/realtimeController");

    const wrapper = mount(JoinView, {
      global: {
        plugins: [pinia]
      }
    });

    const input = wrapper.find("input");
    await input.setValue("  Maria  ");
    await wrapper.find("button").trigger("click");

    expect(session.userName).toBe("Maria");
    expect(startRealtime).toHaveBeenCalledTimes(1);
  });
});
