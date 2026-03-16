import { Pipe, PipeTransform } from '@angular/core';

/**
 * Replaces all occurrences of a substring.
 * Usage: {{ 'SUBMISSION_PHOTO' | replace:'_':' ' }}  →  'SUBMISSION PHOTO'
 */
@Pipe({ standalone: false, name: 'replace' })
export class ReplacePipe implements PipeTransform {
  transform(value: string | null | undefined, from: string, to: string): string {
    if (value == null) return '';
    return value.split(from).join(to);
  }
}
