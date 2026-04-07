<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <div class="w-20 h-20 rounded-2xl bg-surface-700 flex items-center justify-center mb-6">
      <span class="text-4xl font-bold text-gray-500">404</span>
    </div>
    <h1 class="text-2xl font-bold text-white mb-2">Page Not Found</h1>
    <p class="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
    <router-link to="/" class="btn-primary">Back to Home</router-link>
  </div>
</template>
