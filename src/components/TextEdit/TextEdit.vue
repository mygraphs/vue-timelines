<template>
  <div>
    <!-- Display text or input based on editMode -->
    <span v-if="!editMode" @click.prevent="enterEditMode">
      <b
        ><slot name="textFormat">{{ internalText }}</slot></b
      >
    </span>
    <span v-else>
      <input
        ref="editorElement"
        type="text"
        v-model="tempText"
        @blur="saveText"
        @focus="handleFocus"
        @keyup.enter="saveText"
        @keyup.esc="cancelEdit"
      />
    </span>
  </div>
</template>

<script>
import { nextTick } from "vue";
import { clickOutside } from "@/utils/listener";

export default {
  name: "TextEdit",
  props: {
    edit: {
      type: Boolean,
      required: false,
      default: true,
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
    cancelClickOutside: {
      type: Boolean,
      required: false,
      default: false,
    },
    autoFocusOnEdit: {
      type: Boolean,
      required: false,
      default: true,
    },
    cleanOnFirstFocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    exitEditOnClickOutside: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  mounted() {
    this.tempText = this.defaultText;
    if (this.edit) {
      this.enterEditMode();
    }
  },
  data() {
    return {
      tempText: "Init", // Temporary holder for text while editing
      editMode: false, // Whether the text is in edit mode
      documentEventListener: null,
      firstFocus: true,
    };
  },
  watch: {
    defaultText(newVal) {
      console.log("SET DEFAULT TEXT " + newVal);
      this.tempText = newVal;
    },
    edit(newVal) {
      console.log("SEND TO EDIT " + newVal);
      if (newVal) this.enterEditMode();
      else this.cancelEdit();
    },
  },
  beforeUnmount() {
    if (this.documentEventListener)
      document.removeEventListener("click", this.documentEventListener);
  },
  methods: {
    enterEditMode(e) {
      if (e) {
        e.stopPropagation();
      }
      console.log("ENTER EDIT MODE " + this.tempText);
      this.editMode = true;

      // Set temporary text to current text when entering edit mode
      this.tempText = this.defaultText;

      // We have to wait for next tick so the input exists to focus on it.
      nextTick(() => {
        let el = this.$refs.editorElement;
        if (this.autoFocusOnEdit)
          el.focus();

        console.log(" Register click ");
        if (this.cancelClickOutside)
          this.documentEventListener = clickOutside(el, () => {
            console.log(" Cancel click ");
            this.cancelEdit();
          });
      });
    },
    handleFocus() {
      if (this.cleanOnFirstFocus && this.tempText == this.defaultText) {
        this.tempText = "";
        this.firstFocus = false;
      }
    },
    saveText() {
      console.log("SAVE TEXT [" + this.tempText + "]");
      if (this.tempText == "") {
        // Canceled ? We don't support to leave text empty.
        this.tempText = this.defaultText;
        return;
      }

      if (this.trimText) this.tempText = this.tempText.trim();

      this.$emit("update:newValue", this.tempText); // Update the text
      if (this.exitEditOnClickOutside)
        this.editMode = false; // Switch back to view mode
    },
    cancelEdit() {
      console.log("CANCEL EDIT " + this.tempText);

      this.tempText = this.defaultText;

      if (this.exitEditOnClickOutside)
        this.editMode = false; // Exit edit mode without saving changes
    },
  },
};
</script>

<style scoped>
/* Add styles if needed */

input[type="text"] {
  appearance: none;
  border: none;
  outline: none;
  width: 100%;

  border-bottom: 0.2em solid #e91e63;
  border-radius: 0.2em 0.2em 0 0;
  padding: 0.4em;
  color: #e91e63;
}
</style>
