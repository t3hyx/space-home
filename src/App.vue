<script setup lang="ts">
import SpaceScene from './components/SpaceScene.vue'
</script>

<template>
  <main class="app-container">
    <div class="scene-wrapper">
      <SpaceScene />
    </div>
  </main>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  overflow: hidden;
}

.app-container {
  width: 100vw;
  height: 100vh;
  background-color: #222;
}

.scene-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
