<script setup lang="ts">
import { type ConveneDocument } from '@/collections/convene';
import urlSlug from 'url-slug';

// define
const emits = defineEmits<{
  (e: 'on-done'): void;
}>();

// uses
const account = useAccount();
const database = useDatabase();

// states
const items = ref<ConveneDocument[]>();

// functions
const initialize = () => {
  if (!account.active) {
    // items.value = [];
    return;
  }

  database.getInstance().then((db) => {
    db.convenes
      .find({
        selector: {
          playerId: account.active,
          qualityLevel: {
            $gte: 4
          }
        }
      })
      .sort({
        createdAt: 'desc'
      })
      .limit(5)
      .exec()
      .then((result) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items.value = result as any;
        setTimeout(() => emits('on-done'), 50);
      });
  });
};

// changes
watch(() => account.active, initialize);
watch(() => account.onConveneChanged, initialize);

// lifecycle
onMounted(initialize);
</script>

<template>
  <client-only>
    <template #fallback>
      <v-skeleton-loader
        v-for="index in 5"
        :key="index"
        :boilerplate="true"
        type="list-item-avatar-two-line"
      />
    </template>

    <div v-if="!items">
      <v-skeleton-loader
        v-for="index in 5"
        :key="index"
        :boilerplate="true"
        type="list-item-avatar-two-line"
      />
    </div>

    <v-card-text v-else-if="items.length === 0">
      {{ $t('common.noRecordsFound') }}
    </v-card-text>

    <v-list v-else>
      <v-list-item v-for="(element, index) in items" :key="index">
        <template #prepend>
          <v-badge
            :color="`hsl(${100 - (element.pity / (element.qualityLevel === 5 ? 80 : 10)) * 100}, 100%, 50%)`"
            :content="element.pity"
            location="bottom right"
          >
            <v-avatar
              class="border"
              :image="`/${element.resourceType.startsWith('R') ? 'characters' : 'weapons'}/icons/${urlSlug(element.name)}.webp`"
            />
          </v-badge>
        </template>

        <v-list-item-title :class="`text-rarity${element.qualityLevel}`">
          {{ $t(element.name) }}
        </v-list-item-title>

        <v-list-item-subtitle>
          {{ element.time }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </client-only>
</template>
