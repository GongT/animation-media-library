import './assets/main.css';

import { ComponentPublicInstance, createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.config.errorHandler = (err: unknown, instance: ComponentPublicInstance | null, info: string) => {
	console.log('VUE Error:', err);
};
app.config.warnHandler = (err: unknown, instance: ComponentPublicInstance | null, info: string) => {
	console.log('VUE Warn:', err);
};
app.config.performance = true;

app.use(router);

app.mount('#app');
