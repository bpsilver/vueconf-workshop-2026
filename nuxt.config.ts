// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import Aura from "@primeuix/themes/aura";
import storage from "./config/storage";

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    components: [
        {
            extensions: [".vue"],
            path: "~/components",
        },
        {
            extensions: [".vue"],
            path: "~/pages/",
            pathPrefix: false,
            pattern: "**/partials/**",
        },
    ],
    css: ["~/assets/css/app.css"],
    devtools: {
        enabled: true,
    },
    experimental: {
        typedPages: true,
    },
    modules: ["@nuxt/eslint", "@primevue/nuxt-module"],
    nitro: {
        storage,
        experimental: {
            tasks: true,
        },
    },
    pages: {
        pattern: ["**/*.vue", "!**/partials/**"],
    },
    primevue: {
        options: {
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: ".dark",
                },
            },
        },
    },
    runtimeConfig: {
        dbHost: process.env.NUXT_DB_HOST,
        dbPort: process.env.NUXT_DB_PORT,
        dbDatabase: process.env.NUXT_DB_DATABASE,
        dbUser: process.env.NUXT_DB_USER,
        dbPassword: process.env.NUXT_DB_PASSWORD,
        geminiApiKey: process.env.NUXT_GEMINI_API_KEY,
    },
    vite: {
        plugins: [tailwindcss()],
    },
});
