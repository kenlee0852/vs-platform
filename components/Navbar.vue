<template>
  <b-navbar type="is-primary">
    <template #brand>
      <b-navbar-item tag="router-link" :to="{ path: '/' }">
        <img src="~assets/vs.svg" width="60" />
      </b-navbar-item>
    </template>

    <template #end>
      <b-navbar-item class="mr-4" tag="div">
        <a class="button is-primary is-light"> 舉辦比賽 </a>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>