<script setup lang="ts">
// uses
const analytics = useAnalytics();

// states
</script>

<template>
  <div>
    <v-card :title="$t('settings.analytics.title')">
      <v-list>
        <v-list-item
          :title="$t('settings.analytics.optOut')"
          :subtitle="$t('settings.analytics.optOutSubtitle')"
        >
          <template #append>
            <v-switch v-model="analytics.optOut" :hide-details="true" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

