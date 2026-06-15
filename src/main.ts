import { bootstrapApplication } from '@angular/platform-browser';
// Flowbite JS provides small interactive helpers for some Tailwind components (dropdowns, modals)
import 'flowbite';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
