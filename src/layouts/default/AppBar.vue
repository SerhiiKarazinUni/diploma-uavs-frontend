<template>
  <v-app-bar
    style="color: #616E8C;"
    color="#F5F7FB"
    elevation="0"
    border="appbar-border"
    image="https://karazin.ua/inc/assets/images/main-slider-bg.svg"
  >
    <template v-slot:image>
      <v-img
      style="opacity: 0.5;"
      ></v-img>
    </template>

    <v-app-bar-title>Prefix tree based searchable encryption &mdash; map demo</v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn icon href="https://books.lilikovych.name/index.php?year=2023&bib=cw.bib" target="_blank">
      <v-icon>mdi-book-multiple</v-icon>
    </v-btn>

    <v-btn icon href="https://www.linkedin.com/in/sergiy-lilikovych/" target="_blank">
      <v-icon>mdi-account</v-icon>
    </v-btn>

    <v-btn icon href="https://github.com/SerhiiKarazinUni" target="_blank">
      <v-icon>mdi-github</v-icon>
    </v-btn>
  </v-app-bar>
</template>
<style>
.border-appbar-border{
  border-bottom: 1px solid #D5DDED !important;
}
</style>
<script setup>
</script>
