<script setup lang="ts">
import { mdiDownload } from '@mdi/js';
import dayjs from 'dayjs';

// define
const emits = defineEmits<{
  (e: 'on-updated'): void;
}>();

// uses
const i18n = useI18n();
const dialog = useDialog();
const database = useDatabase();

// states
const state = ref<'' | 'export'>('');

// functions
const startExports = async () => {
  try {
    state.value = 'export';

    // load libs
    const { mkConfig, generateCsv, download } = await import('export-to-csv');

    const db = await database.getInstance();
    const convenes = await db.convenes.find().exec();
    const convenesData = convenes.map((e) => {
      return {
        time: e.time,
        name: e.name,
        qualityLevel: e.qualityLevel,
        cardPoolType: e.cardPoolType
      };
    });

    if (convenesData.length === 0) {
      dialog.show({
        title: i18n.t('common.notice'),
        content: i18n.t('settings.data.export.empty')
      });
      return;
    }

    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      filename: `wutheringwaves.app-${dayjs().toISOString()}`
    });
    const csv = generateCsv(csvConfig)(convenesData);
    download(csvConfig)(csv);
  } catch (error) {
    alert(error);
    console.error(error);
  } finally {
    state.value = '';
  }
};

// lifecycle
onNuxtReady(() => emits('on-updated'));
</script>

<template>
  <v-card :title="$t('settings.data.export.title')">
    <v-card-text>
      {{ $t('settings.data.export.message') }}
    </v-card-text>
    <v-divider />

    <v-card-actions>
      <v-spacer />
      <v-btn
        :disabled="state != ''"
        :loading="state === 'export'"
        :prepend-icon="mdiDownload"
        :text="$t('settings.data.export.button')"
        variant="tonal"
        @click="startExports"
      />
    </v-card-actions>
  </v-card>
</template>
