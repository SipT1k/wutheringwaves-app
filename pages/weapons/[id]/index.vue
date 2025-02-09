<script setup lang="ts">
import dayjs from 'dayjs';
import { mdiPlus } from '@mdi/js';
import type { IItem } from '~/interfaces/item';

const i18n = useI18n();
const route = useRoute();
const resources = useResources();
const localePath = useLocalePath();
const runtimeConfig = useRuntimeConfig();
const headers = useRequestHeaders(['If-Modified-Since']);
const event = useRequestEvent();

// states
const dictItems = ref<{ [key: number]: IItem }>({});

// fetch
const items = await resources.getItems();
const weapons = await resources.weapons();
const item = weapons.find((e) => e.slug == route.params.id)!;
if (!item) throw createError({ statusCode: 404 });

const data = await resources.getWeaponData(item.slug);
if (!data) throw createError({ statusCode: 404 });

// computed
const nameLocalized = computed(() => {
  return i18n.t(item.name);
});

const skillDescription = computed(() => {
  const lastIndex = data.skill.params.length - 1;
  return data.skill.description.replace(
    /\{(\d+)\}/g,
    (_, j) => data.skill.params[lastIndex][j] || ''
  );
});

// lifecycle
onMounted(() => {
  data.ascensions.forEach((e) => {
    e.cost.forEach((cost) => {
      const item = items.find((item) => item.id === cost.item);
      if (item) dictItems.value[cost.item] = item;
    });
  });
});

// seo meta
const title = `${i18n.t('Weapon')}: ${nameLocalized.value}`;
const description = i18n.t('meta.weapons.id.description', {
  name: nameLocalized.value,
  type: item.type
});
const ogImage = `${runtimeConfig.public.SITE_URL}/weapons/icons/${item.slug}.webp`;

useApp().title = i18n.t('weapons.title');
useHead({ title });
useSeoMeta({
  ogType: 'article',
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage,
  articlePublishedTime: item.publishedTime,
  articleModifiedTime: item.modifiedTime
});
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  thumbnailUrl: ogImage,
  dateCreated: item.publishedTime,
  datePublished: item.publishedTime,
  dateModified: item.modifiedTime
});
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'ImageObject',
  contentUrl: `${runtimeConfig.public.SITE_URL}/weapons/icons/${item.slug}.webp`,
  license: `${runtimeConfig.public.SITE_URL}/license`,
  acquireLicensePage: `${runtimeConfig.public.SITE_URL}/license/#how-to-use`,
  creditText: 'WutheringWaves.app',
  creator: {
    '@type': 'Organization',
    name: 'Wuthering Waves'
  },
  copyrightNotice: 'trongtindev'
});
useJsonld({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: useRuntimeConfig().public.SITE_URL
    },
    { '@type': 'ListItem', position: 2, name: i18n.t('weapons.title') }
  ]
});

// https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget#if-modified-since
if (headers['if-modified-since']) {
  const modifiedSince = new Date(headers['if-modified-since']);
  const modifiedTime = new Date(item.modifiedTime);
  if (modifiedSince.getTime() >= modifiedTime.getTime()) {
    setResponseStatus(event!, 304);
  }
}
</script>

<template>
  <div>
    <!-- chips -->
    <header-chips class="mb-2" :github="`tree/main/resources/weapons.json`" />

    <!-- upcoming -->
    <v-alert
      v-if="item.upcoming"
      color="warning"
      class="mb-2"
      :title="$t('common.upcomingContent')"
      :text="$t('common.upcomingContentMessage')"
    />

    <v-card>
      <v-card-title tag="h1" :class="`text-rarity${item.rarity}`">
        {{ nameLocalized }}
      </v-card-title>
      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-sheet class="d-flex align-center justify-center">
              <v-img
                :src="`/weapons/icons/${item.slug}.webp`"
                :alt="nameLocalized"
                :width="256"
                :height="256"
              />
            </v-sheet>
          </v-col>

          <v-col cols="12" md="8">
            <!-- introduction -->
            <div>
              <h2
                class="text-body-2"
                :innerHTML="
                  $t('weapons.introduction', {
                    name: nameLocalized,
                    rarity: item.rarity
                  })
                "
              />
            </div>

            <div v-if="data.description" class="mt-2">
              {{ data.description }}
            </div>

            <!-- stats -->
            <div>
              <v-sheet v-if="data.stats.atk" class="border rounded mt-2 pa-2">
                <v-row>
                  <v-col cols="6"> ATK </v-col>
                  <v-col cols="6">
                    {{ data.stats.atk }}
                  </v-col>
                </v-row>
              </v-sheet>

              <v-sheet
                v-if="data.stats.atkRate"
                class="border rounded mt-2 pa-2"
              >
                <v-row>
                  <v-col cols="6"> ATK </v-col>
                  <v-col cols="6"> {{ data.stats.atkRate }}% </v-col>
                </v-row>
              </v-sheet>

              <v-sheet
                v-if="data.stats.critRate"
                class="border rounded mt-2 pa-2"
              >
                <v-row>
                  <v-col cols="6"> {{ $t('common.critRate') }} </v-col>
                  <v-col cols="6"> {{ data.stats.critRate }}% </v-col>
                </v-row>
              </v-sheet>

              <v-sheet
                v-if="data.stats.critDMG"
                class="border rounded mt-2 pa-2"
              >
                <v-row>
                  <v-col cols="6"> {{ $t('common.critDMG') }} </v-col>
                  <v-col cols="6"> {{ data.stats.critDMG }}% </v-col>
                </v-row>
              </v-sheet>

              <v-sheet
                v-if="data.stats.energy"
                class="border rounded mt-2 pa-2"
              >
                <v-row>
                  <v-col cols="6"> {{ $t('common.energy') }} </v-col>
                  <v-col cols="6">
                    {{ data.stats.energy }}
                  </v-col>
                </v-row>
              </v-sheet>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider v-if="item.modifiedTime" />
      <v-card-actions v-if="item.modifiedTime">
        <h2 class="text-center text-body-2 w-100">
          {{
            $t('weapons.lastUpdatedOn', {
              name: nameLocalized,
              time: dayjs(item.modifiedTime)
            })
          }}
        </h2>
      </v-card-actions>
    </v-card>

    <!-- Skill -->
    <v-card v-if="data.skill" class="mt-2">
      <v-card-title tag="h2">
        {{ $t('weapons.skill', { name: nameLocalized }) }}
      </v-card-title>
      <v-divider />

      <v-card-text>
        <div :innerHTML="skillDescription" />
      </v-card-text>
    </v-card>

    <!-- Ascension Material -->
    <v-card class="mt-2">
      <v-card-title tag="h2">
        {{ $t('common.ascensionMaterial') }}
      </v-card-title>
      <v-divider />

      <v-card-text
        v-for="(ascension, index) in data.ascensions.filter(
          (e) => e.cost.length > 0
        )"
        :key="index"
      >
        <v-row>
          <v-col cols="12" sm="3" md="2">
            <v-card
              class="d-flex align-center justify-center text-center text-h6 fill-height pa-2"
            >
              Lv. {{ ascension.minLevel }}
            </v-card>
          </v-col>

          <v-col
            v-for="(cost, j) in ascension.cost"
            :key="j"
            cols="4"
            sm="3"
            md="2"
          >
            <v-card
              :to="
                dictItems[cost.item]
                  ? localePath(`/items/${dictItems[cost.item].slug}`)
                  : `/items`
              "
            >
              <v-responsive :aspect-ratio="1">
                <v-img
                  v-if="dictItems[cost.item]"
                  :src="`/items/icons/${dictItems[cost.item].slug}.webp`"
                  :alt="$t(dictItems[cost.item].name)"
                  class="align-end h-100"
                  cover
                />
              </v-responsive>
              <v-divider />

              <v-card-title class="text-center">
                x{{ formatNumber(cost.quantity) }}
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />

      <v-card-actions class="d-flex align-center justify-end">
        <v-btn
          :to="
            localePath({
              path: '/todo-list/create',
              meta: {
                weapon: item.slug
              }
            })
          "
          :text="$t('Add to Todo list')"
          :append-icon="mdiPlus"
          variant="outlined"
        />
      </v-card-actions>
    </v-card>

    <div class="mt-2">
      <comments :channel="route.path" />
    </div>
  </div>
</template>
