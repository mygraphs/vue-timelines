<template>
  <CellSizeContext>
    <TriditiveGantt :tasks="mocks" :columns="columnsConfig" />
  </CellSizeContext>
</template>

<script>
import { CellSizeContext } from "@/contexts";
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
      mocks: [
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
      groups: {
        group01: [
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
        group02: [
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
    };
  },
  components: {
    CellSizeContext,
    TriditiveGantt,
  },
};
</script>

<style>
* {
  box-sizing: border-box;
}
</style>
