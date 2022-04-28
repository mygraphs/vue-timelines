<template>
  <CalendarContext>
    <CellSizeContext>
      <TriditiveGantt :groups="groups" />
    </CellSizeContext>
  </CalendarContext>
</template>

<script>
import { CellSizeContext, CalendarContext } from "@/contexts";
import TriditiveGantt from "./TriditiveGantt";

export default {
  name: "App",
  data() {
    return {
      columnsConfig: [
        { slug: "ID", key: "id" },
        { slug: "Title", key: "title" },
        { slug: "Progress", key: "progress" },
        { slug: "Due date", key: "duedate" },
        { slug: "Started date", key: "creationDate" },
      ],
      groups: [
        {
          name: "group 01",
          id: "1",
          tasks: [
            {
              id: "01",
              title: "Test task 01",
              creationDate: 1641437099,
              duedate: 1651805099,
              progress: 0.8,
            },
            {
              id: "02",
              title: "Test task 02",
              creationDate: 1643856299,
              duedate: 1649126699,
              progress: 0.5,
            },
          ],
        },
        {
          name: "group 02",
          id: "2",
          tasks: [
            {
              id: "01",
              title: "Test task 01",
              creationDate: 1649041200,
              duedate: 1650510000,
              progress: 0.8,
            },
            {
              id: "02",
              title: "Test task 02",
              creationDate: 1650596400,
              duedate: 1651374000,
              progress: 0.5,
            },
            {
              id: "03",
              title: "Test task 03",
              creationDate: 1651719600,
              duedate: 1651892400,
              progress: 0.5,
            },
            {
              id: "04",
              title: "Test task 04",
              creationDate: 1652151600,
              duedate: 1652324400,
              progress: 0.5,
            },
          ],
        },
      ],
    };
  },
  components: {
    CellSizeContext,
    CalendarContext,
    TriditiveGantt,
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
</style>
