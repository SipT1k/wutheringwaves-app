<script setup lang="ts">
const show = ref(true);
</script>

<template>
  <v-overlay
    v-model="show"
    :contained="true"
    :persistent="true"
    class="w-100 h-100 d-flex align-center justify-center"
  >
    <v-card :title="$t('common.signInRequired')">
      <v-card-text>
        {{ $t('common.signInRequiredMessage') }}
      </v-card-text>
    </v-card>
  </v-overlay>
</template>
