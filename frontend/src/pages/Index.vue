<template>
  <q-page class="row justify-center">
    <div class="q-pa-md">
      <fieldset :disabled="disable" style="border: none">
      <q-form
        @submit="onSubmit"
        class="q-gutter-md"
        enctype="multipart/form-data"
      >
        <div class="q-gutter-sm row items-start">
          <q-uploader
            url="#"
            label="Télécharger les fichiers"
            multiple
            batch
            style="max-width: 300px"
            ref="file"
            auto-upload
            capture="user"
            :factory="uploadFile"
          />
        </div>

        <q-input
          filled
          v-model="emailDest"
          label-slot clearable
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Ce champ est obligatoire']">
          <template v-slot:label>
            <div class="row items-center all-pointer-events">
              <q-icon class="q-mr-xs" color="deep-orange" size="24px" name="mail" />
              Email du destinataire
              <q-tooltip content-class="bg-grey-8" anchor="top left" self="bottom left" :offset="[0, 8]">Saisissez l'adreese mail du destinataire</q-tooltip>
            </div>
          </template>
        </q-input>
        <q-input
          filled
          v-model="email"
          label-slot clearable
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Ce champ est obligatoire']">
          <template v-slot:label>
            <div class="row items-center all-pointer-events">
              <q-icon class="q-mr-xs" color="deep-orange" size="24px" name="mail" />
              Votre adresse mail
              <q-tooltip content-class="bg-grey-8" anchor="top left" self="bottom left" :offset="[0, 8]">Saisissez votre adresse mail</q-tooltip>
            </div>
          </template>
        </q-input>

        <q-input
          v-model="text"
          label="Message"
          filled
          type="textarea"
        />
        <div>
          <q-btn v-if="!trans" label="Transférer" type="submit" color="primary"/>
          <q-spinner
            v-if="trans"
            color="primary"
            size="3em"
          />

        </div>

      </q-form>
      </fieldset>
    </div>
  </q-page>

</template>

<script>
import axios from 'axios'
export default {
  name: 'PageIndex',
  data () {
    return {
      emailDest: '',
      email: '',
      text: '',
      fileName: null,
      file: '',
      fileType: '',
      size: '',
      trans: false,
      disable: false
    }
  },

  methods: {
    onSubmit () {
      this.trans = true
      this.disable = true
      this.$q.notify({
        progress: true,
        message: 'Votre fichier est en cours d\'envoi',
        icon: 'mail',
        color: 'white',
        textColor: 'primary',
        position: 'bottom-right'
      })

      const formData = new FormData()
      this.file.forEach(file => {
        formData.append('file', file)
      })
      formData.append('destinataire', this.emailDest)
      formData.append('emetteur', this.email)
      formData.append('message', this.text)
      formData.append('name', this.fileName)
      formData.append('type', this.fileType)
      formData.append('size', this.size)
      axios.post('http://localhost:5000/file/', formData, {
        headers: {
          'Content-type': 'multipart/form-data'
        }
      }).then(res => {
        if (res.data.sent > 0) {
          this.$q.notify({
            type: 'positive',
            message: 'Votre fichier a été envoyé avec succès',
            position: 'bottom-right'
          })
          this.trans = false
          this.disable = false
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Votre fichier n\'a pas pu être envoyé!',
            position: 'bottom-right'
          })
        }
      }).catch(err => {
        this.trans = false
        this.disable = false
        this.$q.notify({
          type: 'negative',
          message: 'Une erreur est survenue lors de l\'envoi du fichier. Veuillez réessayer!',
          position: 'bottom-right'
        })

        console.log(err)
      })
    },

    uploadFile () {
      this.file = this.$refs.file.files
      this.size = this.$refs.file.files[0].__sizeLabel
      this.fileType = this.$refs.file.files[0].type
      this.fileName = this.$refs.file.files[0].name
    }

  }
}
</script>
