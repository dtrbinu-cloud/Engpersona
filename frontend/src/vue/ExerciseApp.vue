<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  progressPercent: {
    type: Number,
    required: true,
  },
  feedbackMessage: {
    type: String,
    default: '',
  },
  feedbackType: {
    type: String,
    default: 'info',
  },
});

const selectedAnswer = ref('');
const typedAnswer = ref('');
const filledAnswer = ref('');
const submitting = ref(false);
const formRef = ref(null);

const questionParts = computed(() => String(props.question.question || '').split('______'));
const options = computed(() => {
  const values = ['a', 'b', 'c', 'd']
    .map((key) => ({
      key: key.toUpperCase(),
      value: props.question[`option_${key}`],
    }))
    .filter((item) => item.value);

  return values.length === 4 ? values : [];
});
const isMultipleChoice = computed(() => options.value.length > 0);
const answerValue = computed(() => (
  isMultipleChoice.value ? selectedAnswer.value : typedAnswer.value.trim()
));

function submitAnswer(event) {
  if (!answerValue.value || submitting.value) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  submitting.value = true;
  filledAnswer.value = answerValue.value;

  window.setTimeout(() => {
    formRef.value?.submit();
  }, 650);
}
</script>

<template>
  <div class="exercise-workspace">
    <aside class="exercise-sidebar" aria-label="Navigasi Soal Latihan">
      <a class="exercise-mark" href="/dashboard" aria-label="EngPersona Home">
        <img :src="'/logo.png'" alt="EngPersona Logo">
        <div class="exercise-brand-name">engpersona</div>
      </a>

      <nav class="exercise-menu" aria-label="Menu utama">
        <a class="exercise-menu-item" href="/dashboard">Home</a>
        <a class="exercise-menu-item active" href="/exercise/start">Belajar</a>
        <a class="exercise-menu-item" href="/history">Score</a>
        <a class="exercise-menu-item" href="/dashboard">Profil</a>
      </nav>

      <form action="/exercise/exit" method="POST" class="exercise-exit-form">
        <button class="exercise-exit" type="submit">Keluar dari Soal Latihan</button>
      </form>
    </aside>

    <section class="exercise-panel" aria-label="Soal Latihan">
      <div class="exercise-card">
        <div class="exercise-card-header">
          <span>Soal {{ currentIndex }} dari {{ totalQuestions }}</span>
          <span class="exercise-skip">Skip</span>
        </div>

        <div
          class="exercise-progress"
          role="progressbar"
          :aria-valuenow="progressPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span :style="{ width: `${progressPercent}%` }"></span>
        </div>

        <div v-if="feedbackMessage" class="exercise-feedback" :class="feedbackType || 'info'">
          {{ feedbackMessage }}
        </div>

        <h1 class="exercise-question" id="questionText">
          <template v-for="(part, index) in questionParts" :key="`${part}-${index}`">
            {{ part }}
            <span
              v-if="index < questionParts.length - 1"
              class="answer-blank"
              :class="{ 'is-filled': filledAnswer }"
            >{{ filledAnswer || '______' }}</span>
          </template>
        </h1>

        <form
          ref="formRef"
          action="/exercise"
          method="POST"
          class="exercise-form"
          @submit="submitAnswer"
        >
          <input type="hidden" name="answer" :value="answerValue">

          <div v-if="isMultipleChoice" class="exercise-options">
            <label
              v-for="option in options"
              :key="option.key"
              class="answer-option exercise-option"
              :class="{ 'is-sending': submitting && selectedAnswer === option.value }"
            >
              <input
                v-model="selectedAnswer"
                type="radio"
                :value="option.value"
                :disabled="submitting"
                required
              >
              <span class="exercise-radio" aria-hidden="true"></span>
              <span class="exercise-option-text">{{ option.key }}. {{ option.value }}</span>
            </label>
          </div>

          <input
            v-else
            v-model="typedAnswer"
            type="text"
            class="exercise-text-answer"
            placeholder="Ketik jawaban..."
            :disabled="submitting"
            required
          >

          <button class="exercise-next" type="submit" :disabled="submitting">Next</button>
        </form>
      </div>
    </section>
  </div>
</template>
