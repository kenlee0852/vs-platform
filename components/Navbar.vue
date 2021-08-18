<template>
  <b-navbar type="is-primary">
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <img src="~assets/vs.svg" width="60" />
        <p class="is-size-4">VS PLATFORM</p>
      </b-navbar-item>
    </template>

    <template #end>
      <b-navbar-item class="mr-4" tag="div">
        <a class="button is-primary is-light" @click="goNewContest"> 舉辦比賽 </a>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
export default {
  methods: {
    goNewContest() {
      this.$router.push({ name: 'contest-new' });
    }
  }
}
</script>