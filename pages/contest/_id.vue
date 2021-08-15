<template>
  <div>
    <!-- <b-loading v-model="isLoading"></b-loading> -->
    <div class="has-background-black mt-2" v-if="rivalReady()">
      <div class="columns is-2 is-mobile">
        <img
          class="logo-container"
          src="~assets/vs.svg"
          width="120px"
          height="120px"
        />
        <div class="column">
          <div
            class="is-pulled-right"
            style="height: 90vh; position: relative"
            @click="selectHandler(0)"
          >
            <img
              :src="match[0].url"
              class="img-container"
              :class="{
                selected: showSelected && selectIndex % 2 == 0,
                lose: showSelected && selectIndex % 2 == 1,
              }"
            />
            <span
              class="is-size-2 img-title"
              style="right: 50%; transform: translateX(50%)"
            >
              {{ match[0].title }}</span
            >
          </div>
        </div>
        <div class="column">
          <div
            class="is-pulled-left"
            style="height: 90vh; position: relative"
            @click="selectHandler(1)"
          >
            <img
              :src="match[1].url"
              class="img-container"
              :class="{
                selected: showSelected && selectIndex % 2 == 1,
                lose: showSelected && selectIndex % 2 == 0,
              }"
            />
            <span
              class="is-size-2 img-title"
              style="right: 50%; transform: translateX(50%)"
            >
              {{ match[1].title }}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="container mt-4" v-if="done">
      <div class="columns is-mobile">
        <div class="column is-narrow">
          <p class="card-header-title is-size-3 has-text-primary">
            {{ winner.title }} 勝利！
          </p>
          <div class="card" style="height: 70vh">
            <img :src="winner.url" class="img-container" />
          </div>
        </div>
        <div class="column"></div>
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
import contestService from "~/services/contest";

const validInvolveCount = [4, 8, 16, 32];

export default {
  name: "ContestDetail",

  components: {},
  layout(context) {
    return "contest";
  },
  computed: {
    isLoading() {
      return this.$fetchState.pending;
    },
    match() {
      return this.matches[this.round];
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
      clientId: null,
      candidates: [],
      matchResult: {},
      // current level matches
      matches: [],
      showSelected: false,
      selectIndex: 0,
      // current level key
      level: 0,
      round: 0,
      done: false,
      winner: null,
    };
  },
  methods: {
    async getContestHistory() {
      const doc = await contestService.getContestHistory(
        this.contest.id,
        this.clientId
      );
      if (!doc.exists) return false;
      const data = doc.data();
      this.involveCount = data.involveCount;
      this.level = data.level;
      this.round = data.round;
      const matches = JSON.parse(data.matches);
      this.matches = matches.map(match => [this.mapCandidate(match[0]), this.mapCandidate(match[1])]);
      this.candidates = data.candidates.map(this.mapCandidate);
      this.matchResult = data.matchResult;
      if(data.winner) this.winner = this.mapCandidate(data.winner);
      console.log('matches', this.matches);
      if (this.isComplete()) {
          this.completeHandler();
        } 
      return true;
    },
    mapCandidate(index) {
      return this.contest.candidates[index];
    },
    async getContest() {
      const doc = await contestService.getContestById(this.$route.params.id);
      if (!doc.exists) {
        this.$nuxt.error({ statusCode: 404, message: "Contest not found" });
      }
      this.contest = {
        ...doc.data(),
        id: this.$route.params.id,
      };
    },
    async init() {
      this.modalOpen = false;
      // slice unused candidates
      this.candidates = this.contest.candidates.slice(0, this.involveCount);
      this.level = this.involveCount;
      this.levelInit();
      // console.log(this.matches);
      await contestService.newContestHistory({
        contestId: this.contest.id,
        clientId: this.clientId,
        involveCount: this.involveCount,
        candidates: this.candidates,
        matches: this.matches,
        matchResult: this.matchResult
      });
    },
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      return arr;
    },
    async selectHandler(index) {
      if (this.showSelected) return;
      this.showSelected = true;
      this.selectIndex = index;
      const currentMatch = this.match;
      // remove this match from candidate and push winner to candidate
      this.candidates.splice(0, 2);
      this.candidates.push(currentMatch[index]);

      this.matchResult[this.level].push({
        win: currentMatch[index].index,
        lose: currentMatch[1 - index].index,
      });
      // finish current level
      await this.sleep(1000);
      if (this.isReachNextLevel()) {
        this.level /= 2;
        if (this.isComplete()) {
          this.completeHandler(currentMatch[index]);
        } else {
          this.levelInit();
        }
        console.log('yyy',this.round);
      } else {
        this.round += 1;
      }
      console.log('before update', this.round);
      await this.updateContestHistory();
      this.showSelected = false;
    },
    levelInit() {
      this.matchResult[this.level] = [];
      this.matches = [];
      this.candidates = this.shuffle(this.candidates);
      // fill next level matches
      for (let i = 0; i <= this.level / 2; i += 2) {
        this.matches.push([this.candidates[i], this.candidates[i + 1]]);
      }
      this.round = 0;
    },
    async updateContestHistory() {
      console.log('updateContestHistory',this.round);
      await contestService.updateContestHistory({
        contestId: this.contest.id,
        clientId: this.clientId,
        level: this.level,
        round: this.round,
        candidates: this.candidates,
        matches: this.matches,
        matchResult: this.matchResult,
        winner: this.winner,
      });
    },
    isReachNextLevel() {
      // top 8 will need 4 round, here round index from 0)
      return this.round + 1 == this.level / 2;
    },
    isComplete() {
      return this.level == 1;
    },
    completeHandler(winner) {
      this.done = true;
      if(winner) this.winner = winner;
    },
    sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
    rivalReady() {
      return (
        this.contest != null && this.matches.length > 0 && !this.done
      );
    },
  },
  async mounted() {
    this.clientId = this.$cookies.get("clientId");
    await this.getContest();
    const historyExist = await this.getContestHistory();
    if (historyExist) {
      console.log(historyExist);
    } else {
      this.validInvolveCount = this.validInvolveCount.filter(
        (item) => item <= this.contest.candidates.length
      );
      this.modalOpen = true;
    }
  },
};
</script>
<style scoped>
.img-title {
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
</style>