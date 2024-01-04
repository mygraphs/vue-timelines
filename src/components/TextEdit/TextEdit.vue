<template>
  <div>
    <!-- Display text or input based on editMode -->
    <h2 v-if="!editMode" @click="enterEditMode">{{ text }}</h2>
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
  },
  inject: {
    handleUpdateText: { from: "handleUpdateText" },
  },
  mounted() {
    this.text = this.defaultText;
  },
  data() {
    return {
      text: "Editable Text", // Initial text
      tempText: "", // Temporary holder for text while editing
      editMode: false, // Whether the text is in edit mode
    };
  },
  watch: {
    defaultText(newVal) {
      this.text = newVal;
    },
    edit(newVal) {
      console.log("SEND TO EDIT");
      if (newVal)
        this.enterEditMode();
      else
        this.cancelEdit();
    },
  },
  methods: {
    enterEditMode() {
      this.editMode = true;
      this.tempText = this.text; // Set temporary text to current text when entering edit mode

      // We have to wait for next tick so the input exists to focus on it.
      nextTick(() => {
        this.$refs.editorElement.focus();
      });
    },
    saveText() {
      this.text = this.tempText; // Update the text
      this.editMode = false; // Switch back to view mode
      this.handleUpdateText(this, this.text);
    },
    cancelEdit() {
      this.tempText = this.text;
      this.editMode = false; // Exit edit mode without saving changes
    },
  },
};
</script>

<style>
/* Add styles if needed */
</style>
