<template>
    <div class="container" style="margin-top: 50px;">
        <div class="row">
            <div class="offset-md-3 col-md-6">
                <h1 class="text-center">Login</h1>

                <br />

                <form method="POST" v-on:submit.prevent="doLogin">
                    <div class="form-group">
                        <label>Enter email</label>
                        <input type="email" class="form-control" name="email" required />
                    </div>
 
                    <br />
 
                    <div class="form-group">
                        <label>Enter password</label>
                        <input type="password" class="form-control" name="password" required />
                    </div>
 
                    <br />
 
                    <input type="submit" value="Login" name="submit" class="btn btn-primary" v-bind:value="isLoading ? 'Loading...' : 'Login'" v-bind:disabled="isLoading" />
                </form>

                <br />

                <router-link to="/forgotPassword" class="forgot-link">Forgot your password ?</router-link>
            </div>
        </div>
    </div>
</template>
 
<script>

    import axios from "axios"
    import swal from "sweetalert2"
    import store from "../vuex/store"
 
    export default {
        name: "RegisterComponent",

        data() {
            return {
                isLoading: false
            }
        },
     
        methods: {
            doLogin: async function () {
                const self = this

                const form = event.target
                const formData = new FormData(form)
 
                this.isLoading = true
 
                const response = await axios.post(
                    this.$apiURL + "/login",
                    formData
                )

                this.isLoading = false
 
                if (response.data.status == "success") {
                    // get access token from server
                    const accessToken = response.data.accessToken
 
                    // save in local storage
                    localStorage.setItem(this.$accessToken, accessToken)

                    this.$headers.Authorization = "Bearer " + accessToken
                    store.commit("setUser", response.data.user)

                    // to go to home page without refreshing
                    this.$router.push("/")
                } else if (response.data.status == "verificationRequired") {
                    swal.fire("Error", response.data.message, "error")
                        .then(function () {
                            self.$router.push("/verify/" + form.email.value)
                        })
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            }
        }
    }
</script>