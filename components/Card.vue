<template>
  <div class="column">
    <div class="card">
      <NuxtLink :to="{ name: 'contest-id', params: { id: contestId } }" ref="card">
        <div class="card-image">
          <figure class="image is-4by3">
            <img :src="imageSrc" />
          </figure>
        </div>
        <div class="card-content">
          <p class="title is-5 mb-2">{{ contestName }}</p>
        </div>
      </NuxtLink>
      <footer class="card-footer">
        <div class="card-footer-item">
          <div class="buttons">
            <b-button class="is-info" icon-left="poll" @click="goStatistics"> 查看統計 </b-button>
            <b-button class="is-light" icon-left="share" @click="clickShare">
              分享
            </b-button>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    contestId: {
      type: String,
      required: true,
    },
    contestName: {
      type: String,
      required: true,
    },
    imageSrc: {
      type: String,
      required: true,
    },
  },
  methods: {
    goStatistics() {
      this.$router.push({ name: 'contest-id-stat', params: { id: this.contestId } });
    },
    clickShare() {
      if (!navigator.clipboard) {
        this.$notify("error", "無法複製到剪貼簿");
      } else {
        const url = this.$refs.card.$el.href;
        navigator.clipboard.writeText(url);
        this.$buefy.snackbar.open({
          message: "已經將網址複製到剪貼簿",
          position: "is-top",
        });
      }
    },
  },
};
</script>
