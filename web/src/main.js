import { createApp } from 'vue'
import App from './App.vue'

// import the vue router necessary functions
import { createRouter, createWebHistory } from 'vue-router'

import RegisterComponent from "./components/RegisterComponent.vue"
import LoginComponent from "./components/LoginComponent.vue"
import ForgotPasswordComponent from "./components/ForgotPasswordComponent.vue"
import ResetPasswordComponent from "./components/ResetPasswordComponent.vue"
import VerifyComponent from "./components/VerifyComponent.vue"

// Define some routes
// Each route should map to a component.
const routes = [
    { path: "/verify/:email", component: VerifyComponent },
    { path: "/resetPassword/:email", component: ResetPasswordComponent },
    { path: "/forgotPassword", component: ForgotPasswordComponent },
    { path: "/login", component: LoginComponent },
    { path: "/register", component: RegisterComponent }
]

// Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
    // Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHistory(),
    routes, // short for `routes: routes`
})

const app = createApp(App)
app.use(router)

app.config.globalProperties.$mainURL = "http://localhost:8080"
app.config.globalProperties.$apiURL = "http://localhost:3000"
app.config.globalProperties.$accessToken = "accessToken"

app.config.globalProperties.$headers = {
    Authorization: "Bearer " + localStorage.getItem("accessToken")
}

app.mount('#app')
