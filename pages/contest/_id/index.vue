<template>
  <div>
    <!-- <b-loading v-model="isLoading"></b-loading> -->
    <div class="has-background-black mt-2" v-if="matchReady()">
      <div class="columns is-2 is-mobile">
        <img
          class="logo-container"
          src="~assets/vs.svg"
          width="120px"
          height="120px"
        />
        <div class="is-size-2 contest-name">{{ getTitle() }}</div>
        <div class="column">
          <div
            class="is-pulled-right"
            style="height: 90vh; position: relative"
            @click="selectHandler('candidate1')"
          >
            <img
              :src="match.candidate1.url"
              class="img-container"
              :class="{
                selected: showSelected && match.candidate1.isSelect,
                lose: showSelected && !match.candidate1.isSelect,
              }"
            />
            <span
              class="is-size-2 img-name"
              style="right: 50%; transform: translateX(50%)"
            >
              {{ match.candidate1.name }}</span
            >
          </div>
        </div>
        <div class="column">
          <div
            class="is-pulled-left"
            style="height: 90vh; position: relative"
            @click="selectHandler('candidate2')"
          >
            <img
              :src="match.candidate2.url"
              class="img-container"
              :class="{
                selected: showSelected && match.candidate2.isSelect,
                lose: showSelected && !match.candidate2.isSelect,
              }"
            />
            <span
              class="is-size-2 img-name"
              style="right: 50%; transform: translateX(50%)"
            >
              {{ match.candidate2.name }}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-4" v-if="isComplete">
      <div class="columns is-mobile">
        <div class="column is-narrow">
          <p class="card-header-title is-size-3 has-text-primary">
            {{ winner.name }} 勝利！
          </p>
          <div class="card" style="height: 70vh">
            <img :src="winner.url" class="img-container" />
          </div>
        </div>
        <div class="column">
          <Statistic :contestId="contestData.id"/>
        </div>
      </div>
    </div>
    <b-modal v-model="modalOpen" :width="300" :height="500" :can-cancel="false">
      <div class="card">
        <div class="card-content">
          <b-field label="選擇比賽人數">
            <b-select required v-model="involveCount">
              <option
                v-for="option in validInvolveCount"
                :value="option"
                :key="option"
              >
                {{ `${option}人` }}
              </option>
            </b-select>
          </b-field>
        </div>
        <footer class="card-footer">
          <div class="card-footer-item is-justify-content-start">
            <b-button class="is-primary" @click="init()"> 確認 </b-button>
          </div>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { nanoid } from "nanoid";
import Statistic from "~/components/Statistic";
import contestService, { Contest } from "~/services/contest";

const validInvolveCount = [4, 8, 16, 32];

export default {
  name: "ContestDetail",

  components: {
    Statistic
  },
  layout() {
    return "contest";
  },
  computed: {
    isLoading() {
      return this.$fetchState.pending;
    },
    match() {
      const candidate1 = {
        ...this.lookupCandidate(this.contest.match.candidate1),
        isSelect: false,
      };
      const candidate2 = {
        ...this.lookupCandidate(this.contest.match.candidate2),
        isSelect: false,
      };
      return {
        candidate1,
        candidate2,
      };
    },
  },
  middleware(context) {
    if (!context.$cookies.get("clientId")) {
      context.$cookies.set("clientId", nanoid(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  },
  data() {
    return {
      modalOpen: false,
      validInvolveCount,
      involveCount: 4,
      contest: null,
      contestData: null,
      clientId: null,
      showSelected: false,
      isComplete: false,
      winner: null,
    };
  },
  methods: {
    async getContestHistory() {
      const doc = await contestService.getContestHistory(
        this.contestData.id,
        this.clientId
      );
      return doc;
    },
    lookupCandidate(index) {
      return this.contestData.candidates[index];
    },
    async getContest() {
      const doc = await contestService.getContestById(this.$route.params.id);
      if (!doc.exists) {
        this.$nuxt.error({ statusCode: 404, message: "Contest not found" });
      }
      this.contestData = {
        ...doc.data(),
        id: doc.id,
      };
    },
    async init() {
      this.modalOpen = false;
      const candidates = this.contestData.candidates.map(candidate => candidate.index);
      this.contest = new Contest(
        candidates,
        this.involveCount,
        this.contestData.id,
        this.clientId
      );
      await this.contest.init();
    },
    initFromHistory(data) {
      const contest = new Contest(
        data.candidates,
        data.involveCount,
        this.contestData.id,
        this.clientId
      );
      contest.level = data.level;
      contest.round = data.round;
      contest.matches = data.matches;
      contest.match = data.matches[data.round];
      contest.result = data.result;
      this.contest = contest;
      if (this.contest.isComplete()) {
        this.isComplete = true;
        this.winner = this.lookupCandidate(data.winner);
      }
    },
    async selectHandler(winnerKey) {
      if (this.showSelected) return;
      this.showSelected = true;
      this.match[winnerKey].isSelect = true;

      const winnerIndex = this.match[winnerKey].index;
      const loseIndex =
        winnerKey === "candidate1"
          ? this.match.candidate2.index
          : this.match.candidate1.index;

      await this.sleep(1000);
      await this.contest.nextRound(winnerIndex, loseIndex);
      if (this.contest.isComplete()) {
        this.winner = this.lookupCandidate(winnerIndex);
        this.isComplete = true;
      }
      this.showSelected = false;
    },
    sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
    matchReady() {
      return (
        this.contest != null &&
        this.contest.matches.length > 0 &&
        !this.isComplete
      );
    },
    getTitle() {
      let levelName = this.contest.level + '強';
      let roundName = `${this.contest.round + 1}/${this.contest.level / 2}`;
      if (this.contest.level == 2) levelName = '決賽';
      return `${this.contestData.name} ${levelName} (${roundName})`;
    },
  },
  async mounted() {
    this.clientId = this.$cookies.get("clientId");
    await this.getContest();
    // check if has history
    const historyDoc = await this.getContestHistory();
    if (historyDoc.exists) {
      this.initFromHistory(historyDoc.data());
    } else {
      // select level based on candidate length
      this.validInvolveCount = this.validInvolveCount.filter(
        (item) => item <= this.contestData.candidates.length
      );
      this.modalOpen = true;
    }
  },
};
</script>
<style scoped>
.img-name {
  position: absolute;
  bottom: 10%;
  color: white;
  text-shadow: 0 0 5px #000;
}

.logo-container {
  position: absolute;
  top: 55%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
}

.img-container {
  max-height: 100% !important;
  width: auto !important;
}
.selected {
  border: 5px solid #ffe08a;
}

.lose {
  opacity: 0.3;
}

.contest-name {
  width: 100%;
  position: absolute;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
  z-index: 2;
}
</style>