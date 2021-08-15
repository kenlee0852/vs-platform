<template>
  <div class="column">
    <div class="card">
      <NuxtLink to="/">
        <div class="card-image">
          <figure class="image is-4by3">
            <img :src="require(`assets/${image}`)" />
          </figure>
        </div>
        <div class="card-content">
          <p class="title is-5 mb-2">{{ title }}</p>
        </div>
      </NuxtLink>
      <footer class="card-footer">
        <div class="card-footer-item">
          <div class="buttons">
            <b-button class="is-info" icon-left="poll"> 查看統計 </b-button>
            <b-button class="is-light" icon-left="share"> 分享 </b-button>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
};
</script>
