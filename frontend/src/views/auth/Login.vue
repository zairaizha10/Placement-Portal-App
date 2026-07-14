<template>
<div class="login-page">
    <div class="login-left">
        <h1>Placement Portal</h1>
        <p>
            Connect Students, Companies and Administrators
            on one modern platform.
        </p>
    </div>
    <div class="login-card">
        <h2>Welcome Back</h2>
        <p class="subtitle">
            Login to continue
        </p>
        <form @submit.prevent="handleLogin">
            <div class="input-group">
                <label>Email</label>

                <input
                    type="email"
                    placeholder="Enter your email"
                    v-model="email"
                >

            </div>

            <div class="input-group">

                <label>Password</label>

                <input
                    type="password"
                    placeholder="Enter your password"
                    v-model="password"
                >

            </div>

            <button type="submit">

                Login

            </button>

        </form>

        <div class="register-link">

            <p>

                New User?

                <router-link to="/register">

                    Register Here

                </router-link>

            </p>

        </div>

    </div>

</div>

</template>

<script setup>

import {ref} from "vue"

import {useRouter} from "vue-router"

import {loginUser} from "../../services/authService"

const router=useRouter()

const email=ref("")

const password=ref("")

async function handleLogin(){

    try{

        const response=await loginUser({

            email:email.value,

            password:password.value

        })

        localStorage.setItem("token",response.data.token)

        localStorage.setItem("role",response.data.role)

        if(response.data.role==="student"){

            router.push("/student/dashboard")

        }

        else if(response.data.role==="company"){

            router.push("/company/dashboard")

        }

        else{

            router.push("/admin/dashboard")

        }

    }

    catch(error){

        alert(error.response.data.message)

    }

}

</script>

<style scoped>

@import "./Login.css";

</style>