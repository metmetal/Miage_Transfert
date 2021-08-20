<template>
  <div>
  <div v-if="!noFile">
    <div class="row justify-center q-mt-xl">
      <q-icon name="description" size="100px"/>
    </div>
    <div class="row justify-center">
      <p>{{fileName}}</p>
    </div>
    <div class="row justify-center">
      <p>Taille: {{sizeLabel}}</p>
    </div>
    <div class="row justify-center">
      <p>Hash: {{hash}}</p>
    </div>
    <div class="row justify-center">
      <q-btn label="Télécharger le fichier" type="submit" color="primary" @click="saveFile"/>
    </div>
  </div>

  <div v-if="noFile" class="row justify-center">
    <p>Le fichier n'existe pas ou est expiré !</p>
  </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DownloadFile',

  data () {
    return {
      timer: null,
      sizeLabel: '',
      fileName: '',
      hash: '',
      noFile: false
    }
  },
  created () {
    axios.get(`http://localhost:5000/file/${this.$route.params.token}`).then(res => {
      if (this.$route.params.token !== res.data.token) {
        console.log(res.data.token)
        this.noFile = true
      }
      this.sizeLabel = res.data.size
      this.fileName = res.data.name
      this.hash = res.data.hash
    })
  },

  methods: {
    saveFile () {
      this.$q.loading.show({
        message: 'Votre fichier est en cours de téléchargement.<br/><span class="text-orange text-weight-bold">Veuillez patienter SVP...</span>'
      })
      this.timer = setTimeout(() => {
        this.$q.loading.hide()
        this.timer = 0
      }, 10000)

      axios.get(`http://localhost:5000/file/${this.$route.params.token}`).then(res => {
        console.log(res)
        const linkSource = `data:${res.data.type};base64,${res.data.file}`
        const downloadLink = document.createElement('a')
        downloadLink.href = linkSource
        downloadLink.download = res.data.name
        downloadLink.click()
      })
    }
  }
}
</script>

<style scoped>

</style>
