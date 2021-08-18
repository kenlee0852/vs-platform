<template>
  <section class="section">
    <div class="column">
      <b-field label="比賽名稱">
        <b-input
          v-model="contestName"
          required
          validation-message="必填"
          ref="contestName"
        ></b-input>
      </b-field>
    </div>
    <div class="column">
      <b-field class="file is-primary" :class="{ 'has-name': !!files }">
        <b-upload class="file-label" multiple v-model="files" accept="image/*">
          <span class="file-cta">
            <b-icon class="file-icon" icon="upload"></b-icon>
            <span class="file-label"> 上傳 </span>
          </span>
        </b-upload>
      </b-field>
    </div>
    <div class="columns is-multiline">
      <div class="column is-3" v-for="(file, index) in files" :key="index">
        <div class="card">
          <div class="card-image" style="border-bottom: 1px solid #ededed">
            <figure class="image is-square">
              <img :src="preview(file)" />
            </figure>
          </div>
          <div class="card-content">
            <b-field label="簡單敘述 (顯示於圖上)">
              <b-input
                v-model="file.candidateName"
                required
                validation-message="必填"
                ref="nameInputs"
              ></b-input>
            </b-field>
          </div>
        </div>
      </div>
    </div>
    <div class="column is-2">
      <b-button class="is-success" expanded @click="newContest">
        送出
      </b-button>
    </div>
  </section>
</template>

<script>
import Card from "~/components/Card";
import uploadService from '~/services/upload';
import contestService from '~/services/contest';

export default {
  name: "NewContest",

  components: {
    Card,
  },
  data() {
    return {
      files: [],
      contestName: null,
    };
  },
  methods: {
    preview(file) {
      return URL.createObjectURL(file);
    },
    async newContest() {
      // if(!this.validation()) return;
      const urls = await uploadService.uploadHandler(this.files);
      const candidates = this.files.map((file, index) => ({
        name: file.candidateName,
        url: urls[index],
        index,
      }));
      const contest = {
        name: this.contestName,
        candidates
      };
      try {
        await contestService.newContest(contest);
      } catch (error) {
        this.$notify('error', '發生未知錯誤');
        return;
      }
      this.$notify('success', '新增成功');
      this.$router.push({ path: '/' });
    },
    validation() {
      if(this.files.length < 4) {
        this.$notify('error', '至少需要四張相片！');
        return false;
      }
      if(this.files.length % 2 != 0) {
        this.$notify('error', '參與人數需為偶數');
        return false;
      }
      const items = [
        this.$refs.contestName.checkHtml5Validity(),
        ...this.$refs.nameInputs.map((input) => input.checkHtml5Validity()),
      ];
      if(!items.every(item => item == true)) {
        this.$notify('error', '請完成必填項目！');
        return false;
      }
      return true;
    },
  },
};
</script>
