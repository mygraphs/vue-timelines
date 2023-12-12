<template>
  <g
    @pointerdown.left="start"
    @pointerup="end"
    @pointercancel="end"
    @pointermove="dragging ? move($event) : null"
    @touchstart.prevent=""
    @dragstart.prevent=""
    :class="{ dragging }"
  >
    <slot />
  </g>
</template>

<script>
export default {
  name: "Draggable",
  props: { modelValue: Object }, // should be {x, y}
  data() {
    return { dragging: false };
  },
  methods: {
    start(event) {
      if (event.ctrlKey) return;
      console.log(" START ");
      this.dragging = {dx: event.layerX, dy:event.layerY};
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    end(_event) {
      console.log(" DRAGGING END ");
      this.dragging = null;
    },
    move(event) {
      console.log(" MOVE ");
      /*
        let {x, y} = convertPixelToSvgCoord(event);
        this.$emit('update:modelValue', {
          x: x + this.dragging.dx,
          y: y + this.dragging.dy,
        });
        */
    },
  },
};
</script>

<style scoped>
g {
  cursor: grab;
}
g.dragging {
  user-select: none;
  cursor: grabbing;
}
</style>
