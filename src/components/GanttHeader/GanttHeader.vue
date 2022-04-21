<template>
  <div class="header">
    <h2>Triditive Gantt</h2>

    <div class="header__actions">
      <div class="header__zoom-buttons">
        <span>Zoom</span>
        <button class="header__button" @click="reduceCellSize">-</button>
        <button class="header__button" @click="increaseCellSize">+</button>
        <button class="header__button" @click="resetCellSize">Reset</button>
      </div>

      <button class="header__button" @click="handleScrollToday">Today</button>
    </div>
  </div>
</template>

<script>
import {
  reduceCellSize,
  increaseCellSize,
  resetCellSize,
  cellSize,
  cellSizeInPx,
} from "@/contexts/CellSizeContext";

export default {
  name: "GanttHeader",
  inject: {
    reduceCellSize,
    increaseCellSize,
    resetCellSize,
    cellSize,
    cellSizeInPx,
  },
  methods: {
    handleScrollToday: function () {
      this.$emit("scrollToday");
    },
  },
};
</script>

<style>
.header {
  display: flex;
  justify-content: space-between;
}

.header__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.header__zoom-buttons {
  display: flex;
  gap: 0.2rem;
}

.header__button {
  background-color: whitesmoke;
  padding: 0.2rem 0.5rem;
  border: 1px solid rgb(93, 125, 153);
  border-radius: 2px;
  box-shadow: none;
}
</style>
