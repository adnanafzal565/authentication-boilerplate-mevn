<template>
  <nav class="navbar navbar-expand-lg bg-light">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">Navbar</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link v-bind:class="'nav-link' + ($route.path == '/' ? ' active' : '')" aria-current="page" to="/">Home</router-link>
          </li>

          <li class="nav-item" v-if="user == null">
            <router-link v-bind:class="'nav-link' + ($route.path == '/login' ? ' active' : '')" to="/login">Login</router-link>
          </li>

          <li class="nav-item" v-if="user == null">
            <router-link v-bind:class="'nav-link' + ($route.path == '/register' ? ' active' : '')" to="/register">Register</router-link>
          </li>
          
          <li class="nav-item dropdown" v-if="user != null">
            <a class="nav-link dropdown-toggle" v-text="user.name" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"></a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" v-on:click="doLogout" href="javascript:void(0);">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>

  import "../../assets/css/bootstrap.css"

  import axios from "axios"
  import swal from "sweetalert2"
  import store from "../../vuex/store"

  export default {
    name: "AppHeader",

    computed: {
      user() {
        return store.getters.getUser
      }
    },

    methods: {

      doLogout: async function () {
        const response = await axios.post(
          this.$apiURL + "/logout",
          null,
          {
            headers: this.$headers
          }
        )
     
        if (response.data.status == "success") {
          // remove access token from local storage
          localStorage.removeItem(this.$accessToken)
          this.$headers.Authorization = "Bearer "
          store.commit("setUser", null)
   
          this.$router.push("/login")
        } else {
          swal.fire("Error", response.data.message, "error")
        }
      },
 
      getUser: async function () {
        // check if user is logged in
        if (localStorage.getItem(this.$accessToken)) {
          const response = await axios.post(
            this.$apiURL + "/getUser",
            null,
            {
              headers: this.$headers
            }
          )

          if (response.data.status == "success") {
            // user is logged in
            store.commit("setUser", response.data.user)
          } else {
            // user is logged out
            localStorage.removeItem(this.$accessToken)
          }
        }
      },
    },

    mounted: function () {
        this.getUser()
    }
  }
</script>