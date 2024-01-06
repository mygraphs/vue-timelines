<template>
  <div>
    <!-- Display text or input based on editMode -->
    <span v-if="!editMode" @click="enterEditMode">
      <b
        ><slot name="textFormat">{{ internalText }}</slot></b
      >
    </span>
    <input
      ref="editorElement"
      v-else
      type="text"
      v-model="tempText"
      @blur="saveText"
      @keyup.enter="saveText"
      @keyup.esc="cancelEdit"
    />
  </div>
</template>

<script>
import { nextTick } from 'vue';

export default {
  name: "TextEdit",
  props: {
    edit: {
      type: Boolean,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
    defaultText: {
      type: String,
      required: true,
    },
    trimText: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  mounted() {
    this.tempText = this.defaultText;
  },
  data() {
    return {
      tempText: "Init", // Temporary holder for text while editing
      editMode: false, // Whether the text is in edit mode
    };
  },
  watch: {
    defaultText(newVal) {
      console.log("SET DEFAULT TEXT " + newVal);
      this.tempText = newVal;
    },
    edit(newVal) {
      console.log("SEND TO EDIT " + newVal);
      if (newVal)
        this.enterEditMode();
      else
        this.cancelEdit();
    },
  },
  methods: {
    enterEditMode() {
      console.log("ENTER EDIT MODE " + this.tempText);
      this.editMode = true;

      // Set temporary text to current text when entering edit mode
      this.tempText = this.defaultText;

      // We have to wait for next tick so the input exists to focus on it.
      nextTick(() => {
        this.$refs.editorElement.focus();
      });
    },
    saveText() {
      console.log("SAVE TEXT [" + this.tempText + "]");

      if (this.trimText)
        this.tempText = this.tempText.trim();

      this.$emit("update:newValue", this.tempText); // Update the text
      this.editMode = false; // Switch back to view mode
    },
    cancelEdit() {
      console.log("CANCEL EDIT " + this.tempText);

      this.tempText = this.defaultText;
      this.editMode = false; // Exit edit mode without saving changes
    },
  },
};
</script>

<style>
/* Add styles if needed */
</style>
