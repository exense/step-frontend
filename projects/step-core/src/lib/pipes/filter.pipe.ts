import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'textFilter',
    pure: false
})
export class TextFilterPipePipe implements PipeTransform {
    transform(items: any[], filterAttribute: string, filterValue: string): any {
        if (!items || !filterAttribute || !filterValue) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => item[filterAttribute].indexOf(filterValue) !== -1);
    }
}
