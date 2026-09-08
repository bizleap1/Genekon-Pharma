/**
 * Convert numeric amount in INR to formal English words with Rupees and Paise.
 * Example: 220.32 -> "Two Hundred Twenty Rupees and Thirty Two Paise Only"
 */
export function numberToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Zero Rupees Only";

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertLessThanThousand(num: number): string {
    let str = "";
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    if (num > 0) {
      str += units[num] + " ";
    }
    return str.trim();
  }

  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let rupeesStr = "";
  let rem = rupees;

  // Crores
  if (rem >= 10000000) {
    const crores = Math.floor(rem / 10000000);
    rupeesStr += convertLessThanThousand(crores) + " Crore ";
    rem %= 10000000;
  }

  // Lakhs
  if (rem >= 100000) {
    const lakhs = Math.floor(rem / 100000);
    rupeesStr += convertLessThanThousand(lakhs) + " Lakh ";
    rem %= 100000;
  }

  // Thousands
  if (rem >= 1000) {
    const thousands = Math.floor(rem / 1000);
    rupeesStr += convertLessThanThousand(thousands) + " Thousand ";
    rem %= 1000;
  }

  // Remainder < 1000
  if (rem > 0) {
    rupeesStr += convertLessThanThousand(rem) + " ";
  }

  rupeesStr = rupeesStr.trim() + " Rupees";

  let paiseStr = "";
  if (paise > 0) {
    paiseStr = " and " + convertLessThanThousand(paise) + " Paise";
  }

  return (rupeesStr + paiseStr + " Only").replace(/\s+/g, " ");
}
