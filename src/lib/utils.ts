import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Helper to check if a single-digit transition is direct (no buddy rules, no carry/borrow)
export function isDirectDigitTransition(da: number, dx: number): boolean {
  if (dx > 0) {
    const da_u = da % 5;
    const dx_u = dx % 5;
    const da_active5 = da >= 5;
    const dx_active5 = dx >= 5;
    return da_u + dx_u <= 4 && (!da_active5 || !dx_active5);
  } else if (dx < 0) {
    const adx = Math.abs(dx);
    const da_u = da % 5;
    const adx_u = adx % 5;
    const da_active5 = da >= 5;
    const adx_active5 = adx >= 5;
    return da_u >= adx_u && (!adx_active5 || da_active5);
  }
  return true;
}

// Helper to check if a single-digit transition is a Little Buddy Addition (+1 to +4)
export function isLittleBuddyPlusDigit(da: number, dx: number): boolean {
  if (dx <= 0 || dx >= 5) return false;
  const da_u = da % 5;
  const da_active5 = da >= 5;
  // +dx = +5 - (5 - dx). Requires active5 to be false, and active lower beads >= 5 - dx
  return !da_active5 && da_u >= 5 - dx;
}

// Helper to check if a single-digit transition is a Little Buddy Subtraction (-1 to -4)
export function isLittleBuddyMinusDigit(da: number, dx: number): boolean {
  if (dx >= 0 || dx <= -5) return false;
  const adx = Math.abs(dx);
  const da_u = da % 5;
  const da_active5 = da >= 5;
  // -adx = -5 + (5 - adx). Requires active5 to be true, and space for 5 - adx lower beads (4 - da_u >= 5 - adx)
  return da_active5 && (4 - da_u >= 5 - adx);
}

// Helper to extract digits from a number (least significant to most significant)
function getDigitsArray(num: number, length: number): number[] {
  const arr = [];
  let temp = num;
  for (let i = 0; i < length; i++) {
    arr.push(temp % 10);
    temp = Math.floor(temp / 10);
  }
  return arr;
}

// Check if transition is valid for a given mode
export function isValidTransition(
  currentSum: number,
  x: number, // positive for add, negative for sub
  mode: string,
  digits: number,
  handType?: string
): { valid: boolean; techniqueTriggered: boolean } {
  const targetSum = currentSum + x;
  let maxLimit = Math.pow(10, digits);

  if (handType === "right") {
    maxLimit = 10;
  } else if (handType === "left") {
    maxLimit = 100;
    if (currentSum % 10 !== 0 || x % 10 !== 0 || targetSum % 10 !== 0) {
      return { valid: false, techniqueTriggered: false };
    }
  } else if (handType === "both") {
    maxLimit = 100;
  }

  // Bounds check
  if (targetSum < 0 || targetSum >= maxLimit) {
    return { valid: false, techniqueTriggered: false };
  }

  // Get digits arrays
  const currentDigits = getDigitsArray(currentSum, handType === "left" || handType === "both" ? 2 : digits);

  // Compute delta per digit (including carries/borrows)
  const deltas: number[] = [];
  let carry = 0;
  const activeDigits = handType === "left" || handType === "both" ? 2 : digits;
  
  if (x >= 0) {
    let tempX = x;
    for (let i = 0; i < activeDigits; i++) {
      const dx = (tempX % 10) + carry;
      const currentD = currentDigits[i];
      
      const actualD = currentD + dx;
      if (actualD >= 10) {
        carry = 1;
      } else {
        carry = 0;
      }
      deltas.push(dx);
      tempX = Math.floor(tempX / 10);
    }
  } else {
    let tempX = Math.abs(x);
    for (let i = 0; i < activeDigits; i++) {
      const dx = (tempX % 10) + carry;
      const currentD = currentDigits[i];
      
      const actualD = currentD - dx;
      if (actualD < 0) {
        carry = 1;
      } else {
        carry = 0;
      }
      deltas.push(-dx);
      tempX = Math.floor(tempX / 10);
    }
  }

  // Evaluate transitions based on mode
  let techniqueTriggered = false;
  let allDirect = true;

  for (let i = 0; i < activeDigits; i++) {
    const da = currentDigits[i];
    const dx = deltas[i];

    if (mode.includes("Basic") || mode.includes("Fingermath") || mode.startsWith("Super")) {
      // Basic / Fingermath/ Super: check if direct on all digits
      if (!isDirectDigitTransition(da, dx)) {
        allDirect = false;
      }
    } else if (mode.includes("Little Buddy +")) {
      if (isLittleBuddyPlusDigit(da, dx)) {
        techniqueTriggered = true;
      } else if (!isDirectDigitTransition(da, dx)) {
        allDirect = false;
      }
    } else if (mode.includes("Little Buddy -")) {
      if (isLittleBuddyMinusDigit(da, dx)) {
        techniqueTriggered = true;
      } else if (!isDirectDigitTransition(da, dx)) {
        allDirect = false;
      }
    } else if (mode.includes("Big Buddy +")) {
      // Big Buddy addition usually causes a carry to next column
      const isCarry = deltas[i] + currentDigits[i] >= 10;
      if (isCarry) {
        techniqueTriggered = true;
      } else if (!isDirectDigitTransition(da, dx)) {
        allDirect = false;
      }
    } else if (mode.includes("Big Buddy -")) {
      // Big Buddy subtraction causes a borrow
      const isBorrow = currentDigits[i] - Math.abs(deltas[i]) < 0;
      if (isBorrow) {
        techniqueTriggered = true;
      } else if (!isDirectDigitTransition(da, dx)) {
        allDirect = false;
      }
    } else if (mode.includes("+/-")) {
      // Mix +/- can trigger any technique
      if (
        isLittleBuddyPlusDigit(da, dx) ||
        isLittleBuddyMinusDigit(da, dx) ||
        deltas[i] + currentDigits[i] >= 10 ||
        currentDigits[i] - Math.abs(deltas[i]) < 0
      ) {
        techniqueTriggered = true;
      }
    }
  }

  if (mode.includes("Basic") || mode.includes("Fingermath") || mode.startsWith("Super")) {
    return { valid: allDirect, techniqueTriggered: allDirect };
  }

  // For technique specific modes, we want to allow direct transitions, but we MUST trigger the technique at least once
  // or return valid if it's direct.
  const isValid = allDirect || techniqueTriggered;
  return { valid: isValid, techniqueTriggered };
}

// Generate the math sequence
export function generateMathSequence(
  category: string,
  mode: string,
  digits: number,
  rows: number,
  handType?: string
): { numbers: number[]; answer: number } {
  const isMultiplication = mode.includes("Multiplication") || mode.includes("Phép nhân") || mode.includes("Nhân") || mode.includes("x") || mode.includes("X");
  const isDivision = mode.includes("Division") || mode.includes("Phép chia") || mode.includes("Chia") || mode.includes("÷");

  if (isMultiplication) {
    let num1 = 0;
    let num2 = 0;
    
    // digits mapping:
    // 1: 1D x 1D
    // 2: 2D x 1D
    // 3: 2D x 2D
    // 4: 3D x 1D
    if (digits === 1) {
      num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
      num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    } else if (digits === 2) {
      num1 = Math.floor(Math.random() * 90) + 10; // 10 to 99
      num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    } else if (digits === 3) {
      num1 = Math.floor(Math.random() * 90) + 10; // 10 to 99
      num2 = Math.floor(Math.random() * 90) + 10; // 10 to 99
    } else {
      num1 = Math.floor(Math.random() * 900) + 100; // 100 to 999
      num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    }

    return {
      numbers: [num1, num2],
      answer: num1 * num2,
    };
  }

  if (isDivision) {
    let divisor = 0;
    let quotient = 0;

    // digits mapping:
    // 1: 3D ÷ 1D
    // 2: 4D ÷ 1D
    // 3: 4D ÷ 2D
    if (digits === 1) {
      divisor = Math.floor(Math.random() * 8) + 2; // 2 to 9
      quotient = Math.floor(Math.random() * 90) + 10; // 10 to 99
      while (divisor * quotient < 100) {
        quotient = Math.floor(Math.random() * 90) + 10;
      }
    } else if (digits === 2) {
      divisor = Math.floor(Math.random() * 8) + 2; // 2 to 9
      quotient = Math.floor(Math.random() * 900) + 100; // 100 to 999
      while (divisor * quotient < 1000) {
        quotient = Math.floor(Math.random() * 900) + 100;
      }
    } else {
      divisor = Math.floor(Math.random() * 90) + 10; // 10 to 99
      quotient = Math.floor(Math.random() * 90) + 10; // 10 to 99
      while (divisor * quotient < 1000) {
        quotient = Math.floor(Math.random() * 90) + 10;
      }
    }

    const dividend = divisor * quotient;
    return {
      numbers: [dividend, divisor],
      answer: quotient,
    };
  }

  const numbers: number[] = [];
  let maxLimit = Math.pow(10, digits);
  if (category === "Fingermath") {
    maxLimit = handType === "right" ? 10 : 100;
  }
  
  // Choose starting number
  let currentSum = 0;
  if (category === "Fingermath") {
    if (handType === "right") {
      currentSum = Math.floor(Math.random() * 9); // 0 to 8
    } else if (handType === "left") {
      currentSum = (Math.floor(Math.random() * 9)) * 10; // 0 to 80 (multiples of 10)
    } else {
      currentSum = Math.floor(Math.random() * 90) + 9; // 9 to 98
    }
  } else {
    if (digits === 1) {
      currentSum = Math.floor(Math.random() * 8) + 1; // 1 to 8
    } else if (digits === 2) {
      currentSum = Math.floor(Math.random() * 80) + 10; // 10 to 89
    } else {
      currentSum = Math.floor(Math.random() * 800) + 100; // 100 to 899
    }
  }
  
  numbers.push(currentSum);

  for (let step = 1; step < rows; step++) {
    let found = false;
    let fallbackNum = 0;

    // Retry loop to find a valid number matching the level technique
    for (let attempts = 0; attempts < 60; attempts++) {
      // Generate standard random number
      let x = 0;
      if (category === "Fingermath") {
        if (handType === "right") {
          x = Math.floor(Math.random() * 8) + 1; // 1 to 8
        } else if (handType === "left") {
          x = (Math.floor(Math.random() * 8) + 1) * 10; // 10 to 80 (multiples of 10)
        } else {
          x = Math.floor(Math.random() * 40) + 1; // 1 to 40
        }
      } else {
        if (digits === 1) {
          x = Math.floor(Math.random() * 8) + 1; // 1 to 8
        } else if (digits === 2) {
          x = Math.floor(Math.random() * 40) + 1; // 1 to 40
        } else {
          x = Math.floor(Math.random() * 400) + 1; // 1 to 400
        }
      }

      // Decide addition/subtraction
      const isSub = Math.random() > 0.5;
      const signedX = isSub ? -x : x;

      const { valid, techniqueTriggered } = isValidTransition(currentSum, signedX, mode, digits, handType);

      if (valid) {
        if (techniqueTriggered || attempts > 30) {
          currentSum += signedX;
          numbers.push(signedX);
          found = true;
          break;
        } else {
          if (fallbackNum === 0) fallbackNum = signedX;
        }
      }
    }

    if (!found) {
      if (fallbackNum !== 0) {
        currentSum += fallbackNum;
        numbers.push(fallbackNum);
      } else {
        const stepVal = category === "Fingermath" && handType === "left" ? 10 : 1;
        const fallbackStep = currentSum + stepVal < maxLimit ? stepVal : -stepVal;
        currentSum += fallbackStep;
        numbers.push(fallbackStep);
      }
    }
  }

  return {
    numbers,
    answer: currentSum,
  };
}
