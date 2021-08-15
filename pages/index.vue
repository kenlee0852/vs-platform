<template>
  <section class="section">
    <div class="columns">
      <card
        class="is-one-quarter"
        title="Freaasdasdsadsadsadsadsadsadsadae"
        image="vs.svg"
      >
        Open source on <a href="https://github.com/buefy/buefy">
          GitHub
        </a>
      </card>
    </div>
  </section>
</template>

<script>
import Card from '~/components/Card'

export default {
  name: 'HomePage',

  components: {
    Card
  },
  async fetch(){
  }
}
</script>
