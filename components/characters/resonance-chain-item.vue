<script setup lang="ts">
import type { ICharacterRCData } from '~/interfaces/character';

const props = defineProps<{
  data: ICharacterRCData;
}>();

// uses
const i18n = useI18n();

// computed
const descriptionLocalized = computed(() => {
  if (
    props.data.descriptionLocalized &&
    props.data.descriptionLocalized[i18n.locale.value]
  ) {
    return props.data.descriptionLocalized[i18n.locale.value];
  }
  return props.data.description;
});
</script>

<template>
  <v-card class="fill-height">
    <v-sheet class="pt-2">
      <v-list-item :title="$t(props.data.name)" :subtitle="$t(props.data.idx)">
        <template #prepend>
          <v-avatar class="border rounded">
            <v-img
              :src="`/resonance_chain/icons/${props.data.slug}.webp`"
              :alt="props.data.name"
            />
          </v-avatar>
        </template>
      </v-list-item>
    </v-sheet>

    <v-card-text v-if="descriptionLocalized">
      <div
        :innerHTML="
          descriptionLocalized
            .replace(/\{(\d+)\}/g, (_, j) => props.data.params[j] || '')
            .replaceAll('\n', '<br/>')
        "
      />
    </v-card-text>
    <v-sheet v-else class="pb-2" />
  </v-card>
</template>
