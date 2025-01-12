import {
  AngularRenderer,
  moduleMetadata,
  type Preview,
} from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import docJson from '../documentation.json';
import { TranslateModule } from '@ngx-translate/core';
import { DecoratorFunction } from 'storybook/internal/types';

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
          // { value: 'es', title: 'Español' },
        ],
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot],
    }),
    withTranslation,
  ],
};

export default preview;
