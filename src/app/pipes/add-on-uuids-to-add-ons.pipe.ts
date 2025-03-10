import { Pipe, PipeTransform } from '@angular/core';
import { LanguageType } from '../services/lang.service';
import { ItemsService } from '../services/items.service';
import { PropertiesTranslationPipe } from './properties-translation.pipe';

@Pipe({
  name: 'addOnUuidsToAddOns',
})
export class AddOnUuidsToAddOnsPipe implements PipeTransform {
  constructor(
    private itemsService: ItemsService,
    private propertiesTranslationPipe: PropertiesTranslationPipe
  ) {}
  transform(values: string[], lang: LanguageType) {
    return values
      .map((addOnUuid) => this.itemsService.getAddOnByUuid(addOnUuid))
      .map((addOn) =>
        this.propertiesTranslationPipe.transform(addOn, lang, 'Name')
      )
      .join(' + ');
  }
}
