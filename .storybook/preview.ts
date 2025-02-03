import {
  AngularRenderer,
  moduleMetadata,
  applicationConfig,
  type Preview,
} from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { importProvidersFrom } from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DecoratorFunction } from 'storybook/internal/types';

// Use the same factory function as in your app.config
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'i18n/', '.json');
}

const withTranslation: DecoratorFunction<AngularRenderer> = (
  storyFn,
  context
) => {
  const story = storyFn() as any;
  localStorage.setItem('locale', context.globals['locale']);

  return story;
};

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'he', right: '🇮🇱', title: 'עברית' },
          { value: 'es', right: '🇪🇸', title: 'Español' },
        ],
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule],
    }),
    applicationConfig({
      providers: [
        provideHttpClient(),
        importProvidersFrom(
          TranslateModule.forRoot({
            defaultLanguage: localStorage.getItem('locale') || 'en',
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient],
            },
            extend: true,
          })
        ),
      ],
    }),
    withTranslation,
  ],
};

export default preview;
