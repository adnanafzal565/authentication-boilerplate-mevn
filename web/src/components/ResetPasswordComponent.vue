<template>
    <div class="container" style="margin-top: 50px;">
        <div class="row">
            <div class="offset-md-3 col-md-6">
                <h1 class="text-center">Reset password</h1>

                <br />

                <form method="POST" v-on:submit.prevent="doResetPassword">
                    <div class="form-group">
                        <label>Enter email code</label>
                        <input type="text" class="form-control" name="code" required />
                    </div>
 
                    <br />

                    <div class="form-group">
                        <label>Enter new password</label>
                        <input type="password" class="form-control" name="password" required />
                    </div>
 
                    <br />
 
                    <input type="submit" value="Reset password" name="submit" class="btn btn-primary" v-bind:value="isLoading ? 'Loading...' : 'Reset password'" v-bind:disabled="isLoading" />
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
        name: "ResetPasswordComponent",

        data() {
            return {
                isLoading: false,
                email: this.$route.params.email
            }
        },
     
        methods: {
            doResetPassword: async function () {
                const self = this

                const form = event.target
                const formData = new FormData(form)
                formData.append("email", this.email)
 
                this.isLoading = true
 
                const response = await axios.post(
                    this.$apiURL + "/resetPassword",
                    formData
                )

                this.isLoading = false
 
                if (response.data.status == "success") {
                    swal.fire("Success", response.data.message, "success")
                        .then(function () {
                            self.$router.push("/login")
                        })
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            }
        }
    }
</script>