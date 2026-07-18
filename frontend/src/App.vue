<template>
  <div>
    <nav class="nav">
      <router-link to="/words" class="nl">单词本</router-link>
      <router-link to="/words/add" class="nl">新增单词</router-link>
      <router-link to="/practice" class="nl">背诵练习</router-link>
    </nav>
    <main class="main"><router-view/></main>
  </div>
</template>
<style scoped>
.nav{display:flex;border-bottom:1px solid #e5e7eb;padding:0 24px;background:#fff;position:sticky;top:0;z-index:10}
.nl{padding:14px 20px;text-decoration:none;color:#6b7280;font-size:14px;font-weight:500;border-bottom:2px solid transparent;transition:all .15s}
.nl:hover{color:#111827}
.nl.router-link-exact-active{color:#4f46e5;border-bottom-color:#4f46e5}
.main{max-width:800px;margin:24px auto;padding:0 24px}
</style>
