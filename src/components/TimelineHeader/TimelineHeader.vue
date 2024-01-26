<template>
  <div class="header">
    <h2 class="header__title">{{ title }}</h2>

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

      <div class="header__zoom-buttons">
        <span>Height</span>
        <button class="header__button" @click="reduceCellHeight">-</button>
        <button class="header__button" @click="increaseCellHeight">+</button>
      </div>

      <button class="header__button" @click="handleScrollToday">Today</button>
    </div>
  </div>
</template>

<script>
import eventBus from "../eventBus.js";

import { mapMutations, mapState, mapGetters } from "vuex";

import {
  mainHeaderHeight,
  reduceCellSize,
  increaseCellSize,
  increaseCellHeight,
  reduceCellHeight,
  resetCellSize,
  cellSize,
} from "@/contexts/CellSizeContext";

export default {
  name: "TimelineHeader",
  inject: {
    mainHeaderHeight,
    reduceCellSize,
    increaseCellSize,
    increaseCellHeight,
    reduceCellHeight,

    resetCellSize,
    cellSize,
  },
  computed: { ...mapState("api", ["title"]) },
  methods: {
    ...mapMutations(["setCellSizeDays"]),
    handleScrollToday: function () {
      this.$emit("scrollToday");
    },
    handleTimeFrame: function () {
      this.setCellSizeDays(this.selectedTimeFrame);
      eventBus.emit("timeline-invalidate");
    },
  },
  mounted() {
    setTimeout(() => this.handleScrollToday(), 0);
  },
  data() {
    return {
      selectedTimeFrame: "1", // This will be updated with the value of the selected option
      options: [
        { text: "1 hour", value: 0.0416666666667 },
        { text: "8 hour", value: 0.333333333334 },
        { text: "Daily", value: 1 },
        { text: "5 Days", value: 5 },
        { text: "Work Week", value: 7 },
        { text: "Two Weeks", value: 14 },
        { text: "Month", value: 30 },
        { text: "Year", value: 365 },
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
  height: v-bind('mainHeaderHeight + "px"');
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
