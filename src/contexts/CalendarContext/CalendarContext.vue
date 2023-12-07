<template>
  <slot />
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex';

export default {
  name: "CalendarContext",
  computed: {
    // Map Vuex state to local computed properties
    ...mapState([ 'calendarInit', 'calendarEnd', 'cellDays' ]),
    // Map Vuex getters to local computed properties
    ...mapGetters([ 'totalCells', 'todayCell' ])
  },
  methods: {
    // Map Vuex mutations to local methods
    ...mapMutations([ 'setCellSizeDays', 'setCalendarSize', 'checkCalendarSize' ])
  },
};
</script>
