<template>
    <div class="container" style="margin-top: 50px;">
        <div class="row">
            <div class="offset-md-3 col-md-6">
                <h1 class="text-center">Forget password</h1>

                <br />

                <form method="POST" v-on:submit.prevent="doForgetPassword">
                    <div class="form-group">
                        <label>Enter email</label>
                        <input type="email" class="form-control" name="email" required />
                    </div>
 
                    <br />
 
                    <input type="submit" value="Send recovery email" name="submit" class="btn btn-primary" v-bind:value="isLoading ? 'Loading...' : 'Send recovery email'" v-bind:disabled="isLoading" />
                </form>
            </div>
        </div>
    </div>
</template>
 
<script>

    import axios from "axios"
    import swal from "sweetalert2"
    import store from "../vuex/store"
 
    export default {
        name: "ForgotPasswordComponent",

        data() {
            return {
                isLoading: false
            }
        },
     
        methods: {
            doForgetPassword: async function () {
                const self = this

                const form = event.target
                const formData = new FormData(form)
 
                this.isLoading = true
 
                const response = await axios.post(
                    this.$apiURL + "/sendPasswordRecoveryEmail",
                    formData
                )

                this.isLoading = false
 
                if (response.data.status == "success") {
                    swal.fire("Success", response.data.message, "success")
                        .then(function () {
                            self.$router.push("/resetPassword/" + form.email.value)
                        })
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            }
        }
    }
</script>