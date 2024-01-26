<template>
  <div ref="ref_create_timeline_panel">
    <div class="create__timeline_panel">
      <div class="create__timeline_panel_container">
        <h2>CREATE NEW TIMELINE</h2>
        <div class="create__timeline_panel_header"></div>
        <TextEdit
          :edit="true"
          :defaultText="title"
          :autoFocusOnEdit="false"
          :cleanOnFirstFocus="true"
          :exitEditOnClickOutside="false"
          v-model:newValue="title"
          field="title"
        >
          <template v-slot:textFormat>
            <h2>{{ title }}</h2>
          </template>
          <template v-slot:inputFormat> </template>
        </TextEdit>
        <div style="margin-top: 15px">
          <div class="flex-grid">
            <div class="coll">
              <b> START </b>
            </div>
            <div class="colr">
              <VueDatePicker
                :model-value="compStartDate"
                @update:model-value="setStartDate"
                placeholder="Start date ..." text-input
              />
            </div>
          </div>
          <div class="flex-grid">
            <div class="coll"><b>END </b></div>
            <div class="colr">
              <VueDatePicker
                :model-value="compEndDate"
                @update:model-value="setEndDate"
                placeholder="End date ..." text-input
              />
            </div>
          </div>
          <br />

          <button
            class="btn"
            :disabled="!isFormValidated"
            :class="isFormValidated ? 'btn-success' : 'btn-dark'"
            @click="handleSubmit"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";

import * as localizedFormat from "dayjs/plugin/localizedFormat";

import eventBus from "../eventBus.js";

import { nextTick } from "vue";
import { TextEdit } from "@/components/TextEdit/";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

import { addDays, getTimestampNow } from "@/utils/date";

dayjs.extend(localizedFormat);
dayjs.locale(navigator.language);

const DEFAULT_TITLE = "Timeline Title";
const DEFAULT_DAYS_MARGIN = 14;

export default {
  name: "FormCreateTimeline",
  components: {
    TextEdit,
    VueDatePicker,
  },
  inject: {},
  methods: {
    openParent: function () {
      this.$emit("OpenParent");
    },
    closeParent: function () {
      this.$emit("CloseParent");
    },
    validateDates: function () {
      if (this.dueDate > this.creationDate) return;
      // Due date before creation date
      let t = this.creationDate;
      this.creationDate = this.dueDate;
      this.dueDate = t;
    },
    setStartDate: function (startDate) {
      console.log(" START DATE CHANGED " + startDate);
      this.creationDate = startDate / 1000;
      this.validateDates();
    },
    setEndDate: function (endDate) {
      console.log(" End DATE CHANGED " + endDate);
      this.dueDate = endDate / 1000;
      this.validateDates();
    },
    handleUpdateText: function (element, text) {
      console.log(" TEXT CHANGED " + text);
    },
    handleSubmit: function () {
      console.log(" Submit to API new timeline ");
      this.commitTimeline();
      this.closeParent();
    },
    handleCancel: function () {
      console.log(" Cancel and close ");
      this.closeParent();
    },
    commitTimeline: function () {
      console.log("============ COMMIT TIMELINE " + this.title + "====================");

      if (!this.creationDate)
        this.creationDate = getTimestampNow();

      if (!this.dueDate)
        this.creationDate = getTimestampNow();

      let timeline = {
        etype: "TIMELINE",
        start_date: this.creationDate,
        end_date: this.dueDate,
        title: this.title,
        state: this.state,
      };
      this.$emit("callbackSubmit", timeline);
    },
    invalidate: function () {
      console.log("Invalidate");
    },
  },
  mounted() {
    const currentDate = new Date() / 1000;

    if (!this.creationDate)
      this.creationDate = addDays(currentDate, -DEFAULT_DAYS_MARGIN);

    if (!this.dueDate) this.dueDate = addDays(currentDate, DEFAULT_DAYS_MARGIN);

    this.invalidate();
  },
  beforeUnmount() {},
  computed: {
    isFormValidated() {
      let isValid = this.DEFAULT_TITLE != this.title && this.title != "";
      return isValid;
    },
    creationDateText() {
      return dayjs(new Date(this.creationDate * 1000)).format("LLL");
    },
    dueDateText() {
      return dayjs(new Date(this.dueDate * 1000)).format("LLL");
    },
    compStartDate() {
      return new Date(this.creationDate * 1000);
    },
    compEndDate() {
      return new Date(this.dueDate * 1000);
    },
  },
  watch: {
    title(newTitle) {
      console.log(" PROPAGATE TITLE CHANGE TO " + newTitle);
    },
    creationDate(newDate) {
      console.log(" PROPAGATE Start DATE ");
    },
    dueDate(newDate) {
      console.log(" PROPAGATE End DATE ");
    },
  },
  provide: function () {
    return {};
  },
  data() {
    return {
      DEFAULT_TITLE: DEFAULT_TITLE,
      title: DEFAULT_TITLE,
      isEdit: true,
      state: null,

      creationDate: null,
      dueDate: null,
    };
  },
};
</script>

<style>
.create__timeline_panel_header {
  height: 10px;
  z-index: 100;
}

.create__timeline_panel:before {
}

.create__timeline_panel {
  margin-left: 12px;
  margin-right: 12px;
  border-radius: 10px;
  padding: 12px;

  border: 1px;
  border-color: #000;
  border-style: solid;

  background-color: #fafafa;
  padding: 12px;
  border: 1px solid black;
}

.create__timeline_panel_container {
  min-width: 550px;
  min-height: 100px;
}

.task__title {
  font-weight: 500;
  margin: 1rem 0;
}
</style>

<style scoped>
.small {
  padding: 2px;
  padding-left: 10px;
  padding-right: 10px;
}

.flex-grid {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-grid .coll {
  width: 20%;
}
.flex-grid .colr {
  width: 80%;
}
</style>
