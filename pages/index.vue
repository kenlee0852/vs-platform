<template>
  <section class="section">
    <div class="columns is-multiline">
      <card
        class="is-one-quarter"
        v-for="(contest, index) in contests"
        :key="index"
        :contestName="contest.name"
        :imageSrc="getBackgroundImage(contest)"
        :contestId="contest.id"
      >
      </card>
    </div>
  </section>
</template>

<script>
import Card from '~/components/Card'
import contestService from '~/services/contest';

export default {
  name: 'Home',
  components: {
    Card
  },
  layout() {
    return 'home'
  },
  data() {
    return {
      contests: [],
    }
  },
  async fetch(){
    const data = await contestService.getAllContest();
    this.contests = data.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  },
  methods: {
    getBackgroundImage(contest) {
      const index = Math.floor(Math.random() * contest.candidates.length);
      return contest.candidates[index].url;
    }
  }
}
</script>
