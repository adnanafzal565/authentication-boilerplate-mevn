<template>
    <footer style="padding: 25px;">
        <div class="container">
            <div class="row">
                <div class="col-md-12 text-center">
                    Copyright <span v-text="year"></span>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>

  import jQuery from "jquery"
  import "../../assets/js/bootstrap.js"

  export default {
    name: "AppFooter",

    data() {
      return {
        year: new Date().getFullYear()
      }
    }
  }
</script>