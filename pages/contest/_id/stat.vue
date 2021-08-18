<template>
    <section class="section">
        <Statistic :contestId="$route.params.id"/>
    </section>
</template>

<script>
import Statistic from "~/components/Statistic";

export default {
  name: "NewContest",

  components: {
    Statistic,
  },
  data() {
    return {
    }
  },
  methods: {

  },
};
</script>