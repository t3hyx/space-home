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

body, html {
  font-family: sans-serif;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scene-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
