import type { Subscription } from "rxjs";
import { onBeforeUnmount, onMounted, ref } from "vue";

export function useSubscription(createSubscription: Function) {
  let subscription = ref(null as Subscription | null);
  const subscribe = async () => {
    if (!subscription.value) {
      subscription.value = await createSubscription();
    }
  };

  const unsubscribe = () => {
    if (subscription.value) {
      try {
        !subscription.value.closed && subscription.value.unsubscribe();
      } finally {
        subscription.value = null;
      }
    }
  };

  onBeforeUnmount(() => {
    unsubscribe();
  });

  onMounted(async () => {
    await subscribe();
  });

  return {
    subscribe,
    unsubscribe,
  };
}
