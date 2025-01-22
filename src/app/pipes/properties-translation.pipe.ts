import { Pipe, PipeTransform } from '@angular/core';
import { LanguageType } from '../services/lang.service';

@Pipe({
  name: 'propertiesTranslation',
})
export class PropertiesTranslationPipe implements PipeTransform {
  transform(value: any, lang: LanguageType, keySuffix: 'Details' | 'Name') {
    return value[`${lang}${keySuffix}`];
  }
}
