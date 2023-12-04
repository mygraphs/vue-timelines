<template>
  <div class="header">
    <h2 class="header__title">Vue Timelines</h2>

    <div class="header__actions">
      <select v-model="selectedTimeFrame" @change="handleTimeFrame">
        <option v-for="option in options" :value="option.value" :key="option.value">
          {{ option.text }}
        </option>
      </select>

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
import eventBus from '../eventBus.js';

import { todayCell, setCellSizeDays, cellDays } from "@/contexts/CalendarContext";
import {
  reduceCellSize,
  increaseCellSize,
  resetCellSize,
  cellSize,
  cellSizeInPx,
  cellSizeDays,
} from "@/contexts/CellSizeContext";

export default {
  name: "TimelineHeader",
  inject: {
    reduceCellSize,
    increaseCellSize,
    resetCellSize,
    cellSize,
    cellSizeInPx,
    todayCell,
    setCellSizeDays,
    cellDays,
  },
  methods: {
    handleScrollToday: function () {
      this.$emit("scrollToday");
    },
    handleTimeFrame: function () {
      debugger;
      this.setCellSizeDays(this.selectedTimeFrame);
      eventBus.emit('timeline-invalidate');
    },
  },
  mounted() {
    setTimeout(() => this.handleScrollToday(), 0);
  },
  data() {
    return {
      selectedTimeFrame: '1', // This will be updated with the value of the selected option
      options: [
        { text: 'Daily', value: '1' },
        { text: '5 Days', value: '5' },
        { text: 'Work Week', value: '7' },
        { text: 'Two Weeks', value: '14' },
        { text: 'Month', value: '30' },
        { text: 'Year', value: '365' },
      ],
    };
  },
};
</script>

<style>
.header {
  display: flex;
  justify-content: space-between;
  background-color: #f8f9fc;
}

.header__title {
  font-weight: 500;
  margin: 1rem 0;
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