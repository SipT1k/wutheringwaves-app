<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js';
import type { ISearchResult } from '~/interfaces/search';

const props = defineProps<{
  data: ISearchResult;
}>();

// uses
const localePath = useLocalePath();
</script>

<template>
  <v-list-item
    :to="localePath(props.data.slug)"
    target="_blank"
    :append-icon="mdiOpenInNew"
  >
    <template v-if="props.data.icon" #prepend>
      <v-avatar :image="props.data.icon" class="border" rounded />
    </template>

    <v-list-item-title>
      <span :class="props.data.rarity ? `text-rarity${props.data.rarity}` : ''">
        {{ $t(props.data.name) }}
      </span>
    </v-list-item-title>
  </v-list-item>
</template>
