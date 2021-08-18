<template>
  <div v-if="contestData">
    <p class="is-size-2 mb-4">{{ contestData.name }} 數據統計</p>
    <b-table
      :data="data"
      :bordered="true"
      :striped="true"
      :paginated="true"
      per-page="10"
      :current-page.sync="currentPage"
      :pagination-rounded="true"
    >
      <b-table-column field="rank" label="排行" v-slot="props" width="10%">
        {{ props.index + 1 }}
      </b-table-column>

      <b-table-column field="name" label="Name" v-slot="props" width="50%">
        <div class="columns">
          <div class="column is-narrow">
            <img :src="props.row.url" style="height: 100px" />
          </div>
          <div class="column">
            <span class="is-size-4">{{ props.row.name }}</span>
          </div>
        </div>
      </b-table-column>

      <b-table-column
        field="percentage"
        label="勝率"
        v-slot="props"
        width="40%"
      >
        <b-progress
          type="is-primary"
          :value="getPercentage(props.row.count)"
          show-value
          format="percent"
        ></b-progress>
      </b-table-column>

      <template #empty>
        <div class="has-text-centered">No records</div>
      </template>
    </b-table>
  </div>
</template>

<script>
import contestService from "~/services/contest";

export default {
  props: {
      contestId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      data: [],
      currentPage: 1,
      contestData: null,
      totalCount: 0,
    };
  },
  methods: {
    async getContest() {
      const doc = await contestService.getContestById(this.contestId);
      if (!doc.exists) {
        this.$nuxt.error({ statusCode: 404, message: "Contest not found" });
      }
      this.contestData = doc.data();
    },
    async getContestStat() {
      const docs = await contestService.getContestStatById(
        this.contestId
      );
      return docs;
    },
    lookupCandidate(index) {
      return this.contestData.candidates[index];
    },
    getPercentage(count) {
      return 100 * (count / this.totalCount);
    },
  },
  async mounted() {
    await this.getContest();
    const docs = await this.getContestStat();
    const statMap = {};
    let total = 0;
    docs.forEach((doc) => {
      const data = doc.data();
      if (data.winner) {
        if (statMap[data.winner] === undefined) {
          statMap[data.winner] = {
            ...this.lookupCandidate(data.winner),
            count: 0,
          };
        }
        statMap[data.winner].count += 1;
        total += 1;
      }
    });
    this.data = Object.keys(statMap)
      .map((key) => statMap[key])
      .sort((a, b) => b.count - a.count);
    this.totalCount = total;
  },
};
</script>
