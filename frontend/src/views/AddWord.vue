<template>
  <div>
    <h2 style="font-size:20px;font-weight:600;margin-bottom:20px">新增单词</h2>
    <form @submit.prevent="submit" class="form">
      <div class="form-row">
        <div class="field">
          <label>单词 <span class="req">*</span></label>
          <input v-model="form.word" placeholder="输入英文单词" />
        </div>
        <div class="field">
          <label>词性</label>
          <select v-model="form.part_of_speech">
            <option value="">选择词性</option>
            <option>n.</option><option>v.</option><option>adj.</option><option>adv.</option>
            <option>prep.</option><option>conj.</option><option>pron.</option><option>int.</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>中文释义 <span class="req">*</span></label>
        <input v-model="form.translation" placeholder="输入中文释义" />
      </div>
      <div class="field">
        <label>例句</label>
        <input v-model="form.example" placeholder="输入例句（可选）" />
      </div>
      <div class="field">
        <label>备注</label>
        <textarea v-model="form.notes" placeholder="记忆技巧、词根词缀等（可选）" rows="3"></textarea>
      </div>
      <div v-if="error" class="err">{{ error }}</div>
      <div v-if="success" class="ok">{{ success }}</div>
      <button type="submit" class="btn-submit" :disabled="submitting">
        {{ submitting ? '添加中...' : '添加单词' }}
      </button>
    </form>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { addWord } from '../api/index.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ word:'', translation:'', part_of_speech:'', example:'', notes:'' })
const submitting = ref(false)
const error = ref('')
const success = ref('')

const submit = async () => {
  error.value = ''; success.value = ''
  if (!form.word.trim() || !form.translation.trim()) { error.value='单词和释义不能为空'; return }
  submitting.value = true
  try {
    await addWord(form)
    success.value = '添加成功！'
    form.word = ''; form.translation = ''; form.part_of_speech = ''; form.example = ''; form.notes = ''
    setTimeout(() => router.push('/words'), 600)
  } catch (e) { error.value = '添加失败，请重试' }
  finally { submitting.value = false }
}
</script>
<style scoped>
.form{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px}
.form-row{display:flex;gap:16px}
.form-row .field{flex:1}
.field{margin-bottom:16px}
.field:last-child{margin-bottom:0}
label{display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px}
.req{color:#ef4444}
input,select,textarea{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;background:#fff}
input:focus,select:focus,textarea:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.1)}
.btn-submit{margin-top:8px;padding:10px 24px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;transition:background .15s}
.btn-submit:hover{background:#4338ca}
.btn-submit:disabled{opacity:.6;cursor:not-allowed}
.err{color:#ef4444;font-size:13px;margin-bottom:8px}
.ok{color:#10b981;font-size:13px;margin-bottom:8px}
</style>
