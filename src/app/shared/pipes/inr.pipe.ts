import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as Indian Rupee.
 * Usage: {{ 1250000 | inr }}  →  ₹12.50 L
 *        {{ 1250000 | inr:'full' }}  →  ₹12,50,000
 */
@Pipe({
  standalone: false, name: 'inr' })
export class InrPipe implements PipeTransform {

  transform(value: number | null | undefined, format: 'short' | 'full' = 'short'): string {
    if (value == null || isNaN(value)) return '₹0';

    if (format === 'full') {
      return '₹' + this.toIndianFormat(value);
    }

    // Short format: crore / lakh
    if (value >= 1_00_00_000) {
      return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
    }
    if (value >= 1_00_000) {
      return `₹${(value / 1_00_000).toFixed(2)} L`;
    }
    if (value >= 1_000) {
      return `₹${(value / 1_000).toFixed(1)} K`;
    }
    return '₹' + value.toFixed(0);
  }

  /** Indian comma formatting: 12,50,000 */
  private toIndianFormat(n: number): string {
    const str = Math.round(n).toString();
    if (str.length <= 3) return str;
    const last3 = str.slice(-3);
    const rest   = str.slice(0, -3);
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }
}
