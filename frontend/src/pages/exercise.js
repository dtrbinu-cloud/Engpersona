import { createApp } from 'vue';
import ExerciseApp from '../vue/ExerciseApp.vue';

const mount = document.getElementById('exercise-app');
const propsSource = document.getElementById('exercise-props');

if (mount && propsSource) {
  createApp(ExerciseApp, JSON.parse(propsSource.textContent || '{}')).mount(mount);
}
