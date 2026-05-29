import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Cpu, 
  Sparkles,
  Terminal,
  Code2,
  GitCommit,
  Brain,
  Hash,
  Binary,
  List,
  Type,
  BarChart,
  Activity,
  Workflow
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CodeVisualizer = () => {
  const { userData } = useAuth();
  const accentColor = userData?.accentColor || '#6366f1';
  
  const [activeTab, setActiveTab] = useState('largest_digit');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1500); // ms per step
  const timerRef = useRef(null);

  // Reset steps on tab change
  useEffect(() => {
    setStep(0);
    setIsPlaying(false);
  }, [activeTab]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep(prev => {
          const maxSteps = presets[activeTab].steps.length;
          if (prev >= maxSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeTab, playSpeed]);

  const handleNext = () => {
    const maxSteps = presets[activeTab].steps.length;
    if (step < maxSteps - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  // Preset Configurations & Data Traces
  const presets = {
    largest_digit: {
      name: "Largest Digit",
      category: "numbers",
      visualType: "digits",
      desc: "Finds the largest digit in a number. Traces largest_digit(5852). Illustrates extracting the last digit and tracking the maximum digit step-by-step.",
      code: [
        "def largest_digit(n):",
        "    max_digit = 0",
        "    while n > 0:",
        "        digit = n % 10",
        "        if digit > max_digit:",
        "            max_digit = digit",
        "        n = n // 10",
        "    return max_digit"
      ],
      steps: [
        { line: 1, log: "Calling function largest_digit with n = 5852.", vars: { n: 5852 } },
        { line: 2, log: "Initializing max_digit = 0.", vars: { n: 5852, max_digit: 0 } },
        { line: 3, log: "Loop: Is n > 0? (5852 > 0) -> Yes.", vars: { n: 5852, max_digit: 0 } },
        { line: 4, log: "Extract last digit: digit = 5852 % 10 = 2.", vars: { n: 5852, max_digit: 0, digit: 2 } },
        { line: 5, log: "Check: Is digit > max_digit? (2 > 0) -> Yes.", vars: { n: 5852, max_digit: 0, digit: 2 } },
        { line: 6, log: "Update max_digit to 2.", vars: { n: 5852, max_digit: 2, digit: 2 } },
        { line: 7, log: "Divide n: n = 5852 // 10 = 585.", vars: { n: 585, max_digit: 2 } },
        { line: 3, log: "Loop: Is n > 0? (585 > 0) -> Yes.", vars: { n: 585, max_digit: 2 } },
        { line: 4, log: "Extract last digit: digit = 585 % 10 = 5.", vars: { n: 585, max_digit: 2, digit: 5 } },
        { line: 5, log: "Check: Is digit > max_digit? (5 > 2) -> Yes.", vars: { n: 585, max_digit: 2, digit: 5 } },
        { line: 6, log: "Update max_digit to 5.", vars: { n: 585, max_digit: 5, digit: 5 } },
        { line: 7, log: "Divide n: n = 585 // 10 = 58.", vars: { n: 58, max_digit: 5 } },
        { line: 3, log: "Loop: Is n > 0? (58 > 0) -> Yes.", vars: { n: 58, max_digit: 5 } },
        { line: 4, log: "Extract last digit: digit = 58 % 10 = 8.", vars: { n: 58, max_digit: 5, digit: 8 } },
        { line: 5, log: "Check: Is digit > max_digit? (8 > 5) -> Yes.", vars: { n: 58, max_digit: 5, digit: 8 } },
        { line: 6, log: "Update max_digit to 8.", vars: { n: 58, max_digit: 8, digit: 8 } },
        { line: 7, log: "Divide n: n = 58 // 10 = 5.", vars: { n: 5, max_digit: 8 } },
        { line: 3, log: "Loop: Is n > 0? (5 > 0) -> Yes.", vars: { n: 5, max_digit: 8 } },
        { line: 4, log: "Extract last digit: digit = 5 % 10 = 5.", vars: { n: 5, max_digit: 8, digit: 5 } },
        { line: 5, log: "Check: Is digit > max_digit? (5 > 8) -> No.", vars: { n: 5, max_digit: 8, digit: 5 } },
        { line: 7, log: "Divide n: n = 5 // 10 = 0.", vars: { n: 0, max_digit: 8 } },
        { line: 3, log: "Loop: Is n > 0? (0 > 0) -> No. Exiting loop.", vars: { n: 0, max_digit: 8 } },
        { line: 8, log: "Return max_digit = 8.", vars: { n: 0, max_digit: 8, returnVal: 8 } },
        { line: 0, log: "Function completed. Return value: 8.", vars: { result: 8 } }
      ]
    },
    sum_digits: {
      name: "Sum of Digits",
      category: "numbers",
      visualType: "stack",
      desc: "Calculates sum of digits recursively. Traces sum_digits(582) -> 5 + 8 + 2 = 15.",
      code: [
        "def sum_digits(n):",
        "    if n == 0:",
        "        return 0",
        "    digit = n % 10",
        "    rest = sum_digits(n // 10)",
        "    return digit + rest"
      ],
      steps: [
        { line: 1, log: "Initial call: sum_digits(582).", stack: [{ n: 582, status: "Active" }], vars: { n: 582 } },
        { line: 2, log: "Check base case: is n == 0? (582 == 0) -> No.", stack: [{ n: 582, status: "Active" }], vars: { n: 582 } },
        { line: 4, log: "Extract digit: digit = 582 % 10 = 2.", stack: [{ n: 582, status: "Active" }], vars: { n: 582, digit: 2 } },
        { line: 5, log: "Evaluate sum_digits(582 // 10) -> sum_digits(58). Suspending frame.", stack: [{ n: 582, status: "Suspended" }], vars: { n: 582, digit: 2 } },
        { line: 1, log: "Recursive call: sum_digits(58).", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Active" }], vars: { n: 58 } },
        { line: 2, log: "Check base case: is 58 == 0? -> No.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Active" }], vars: { n: 58 } },
        { line: 4, log: "Extract digit: digit = 58 % 10 = 8.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Active" }], vars: { n: 58, digit: 8 } },
        { line: 5, log: "Evaluate sum_digits(58 // 10) -> sum_digits(5). Suspending frame.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }], vars: { n: 58, digit: 8 } },
        { line: 1, log: "Recursive call: sum_digits(5).", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Active" }], vars: { n: 5 } },
        { line: 2, log: "Check base case: is 5 == 0? -> No.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Active" }], vars: { n: 5 } },
        { line: 4, log: "Extract digit: digit = 5 % 10 = 5.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Active" }], vars: { n: 5, digit: 5 } },
        { line: 5, log: "Evaluate sum_digits(5 // 10) -> sum_digits(0). Suspending frame.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Suspended" }], vars: { n: 5, digit: 5 } },
        { line: 1, log: "Recursive call: sum_digits(0).", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Suspended" }, { n: 0, status: "Active" }], vars: { n: 0 } },
        { line: 2, log: "Check base case: is 0 == 0? -> Yes!", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Suspended" }, { n: 0, status: "Active" }], vars: { n: 0 } },
        { line: 3, log: "Base case matched. Returning 0.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Suspended" }, { n: 0, status: "Base Return: 0" }], vars: { n: 0, returnVal: 0 } },
        { line: 5, log: "Resume sum_digits(5): calculate digit + rest = 5 + 0 = 5.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Suspended" }, { n: 5, status: "Active: 5 + 0" }], vars: { n: 5, digit: 5, returnVal: 5 } },
        { line: 5, log: "Resume sum_digits(58): calculate digit + rest = 8 + 5 = 13.", stack: [{ n: 582, status: "Suspended" }, { n: 58, status: "Active: 8 + 5" }], vars: { n: 58, digit: 8, returnVal: 13 } },
        { line: 5, log: "Resume sum_digits(582): calculate digit + rest = 2 + 13 = 15.", stack: [{ n: 582, status: "Active: 2 + 13" }], vars: { n: 582, digit: 2, returnVal: 15 } },
        { line: 0, log: "Function completed. Return value: 15.", stack: [], vars: { result: 15 } }
      ]
    },
    reverse_number: {
      name: "Reverse Number",
      category: "numbers",
      visualType: "digits",
      desc: "Reverses the digits of a number. Traces reverse_number(123) -> 321. Illustrates digit shifting math.",
      code: [
        "def reverse_number(n):",
        "    rev = 0",
        "    while n > 0:",
        "        digit = n % 10",
        "        rev = (rev * 10) + digit",
        "        n = n // 10",
        "    return rev"
      ],
      steps: [
        { line: 1, log: "Calling reverse_number with n = 123.", vars: { n: 123 } },
        { line: 2, log: "Initializing rev = 0.", vars: { n: 123, rev: 0 } },
        { line: 3, log: "Loop: Is n > 0? (123 > 0) -> Yes.", vars: { n: 123, rev: 0 } },
        { line: 4, log: "Extract digit: digit = 123 % 10 = 3.", vars: { n: 123, rev: 0, digit: 3 } },
        { line: 5, log: "Update rev: rev = (0 * 10) + 3 = 3.", vars: { n: 123, rev: 3, digit: 3 } },
        { line: 6, log: "Divide n: n = 123 // 10 = 12.", vars: { n: 12, rev: 3 } },
        { line: 3, log: "Loop: Is n > 0? (12 > 0) -> Yes.", vars: { n: 12, rev: 3 } },
        { line: 4, log: "Extract digit: digit = 12 % 10 = 2.", vars: { n: 12, rev: 3, digit: 2 } },
        { line: 5, log: "Update rev: rev = (3 * 10) + 2 = 32.", vars: { n: 12, rev: 32, digit: 2 } },
        { line: 6, log: "Divide n: n = 12 // 10 = 1.", vars: { n: 1, rev: 32 } },
        { line: 3, log: "Loop: Is n > 0? (1 > 0) -> Yes.", vars: { n: 1, rev: 32 } },
        { line: 4, log: "Extract digit: digit = 1 % 10 = 1.", vars: { n: 1, rev: 32, digit: 1 } },
        { line: 5, log: "Update rev: rev = (32 * 10) + 1 = 321.", vars: { n: 1, rev: 321, digit: 1 } },
        { line: 6, log: "Divide n: n = 1 // 10 = 0.", vars: { n: 0, rev: 321 } },
        { line: 3, log: "Loop: Is n > 0? (0 > 0) -> No. Exiting loop.", vars: { n: 0, rev: 321 } },
        { line: 7, log: "Return rev = 321.", vars: { n: 0, rev: 321, returnVal: 321 } },
        { line: 0, log: "Function completed. Return value: 321.", vars: { result: 321 } }
      ]
    },
    factorial: {
      name: "Factorial Recursion",
      category: "recursion",
      visualType: "stack",
      desc: "Traces fact(5). Illustrates recursion calls stacking up on the Call Stack, and then unwinding (popping) back to compute the final value.",
      code: [
        "def fact(n):",
        "    if n == 1:",
        "        return 1",
        "    res = n * fact(n - 1)",
        "    return res"
      ],
      steps: [
        { line: 1, log: "Initial call: fact(5) triggered.", stack: [{ n: 5, status: "Active" }], vars: { n: 5 } },
        { line: 2, log: "Checking base case: is 5 == 1? No.", stack: [{ n: 5, status: "Active" }], vars: { n: 5 } },
        { line: 4, log: "Evaluating fact(5): Needs fact(4) result. Suspending fact(5).", stack: [{ n: 5, status: "Suspended" }], vars: { n: 5 } },
        { line: 1, log: "New recursive frame: fact(4) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Active" }], vars: { n: 4 } },
        { line: 2, log: "Checking base case: is 4 == 1? No.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Active" }], vars: { n: 4 } },
        { line: 4, log: "Evaluating fact(4): Needs fact(3) result. Suspending fact(4).", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }], vars: { n: 4 } },
        { line: 1, log: "New recursive frame: fact(3) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Active" }], vars: { n: 3 } },
        { line: 2, log: "Checking base case: is 3 == 1? No.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Active" }], vars: { n: 3 } },
        { line: 4, log: "Evaluating fact(3): Needs fact(2) result. Suspending fact(3).", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }], vars: { n: 3 } },
        { line: 1, log: "New recursive frame: fact(2) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Active" }], vars: { n: 2 } },
        { line: 2, log: "Checking base case: is 2 == 1? No.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Active" }], vars: { n: 2 } },
        { line: 4, log: "Evaluating fact(2): Needs fact(1) result. Suspending fact(2).", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }], vars: { n: 2 } },
        { line: 1, log: "New recursive frame: fact(1) called.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }, { n: 1, status: "Active" }], vars: { n: 1 } },
        { line: 2, log: "Checking base case: is 1 == 1? Yes!", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }, { n: 1, status: "Active" }], vars: { n: 1 } },
        { line: 3, log: "Base case matched. Returning 1.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Suspended" }, { n: 1, status: "Base Return: 1" }], vars: { n: 1, returnVal: 1 } },
        { line: 4, log: "Resuming fact(2). Received 1 from fact(1). Calculating res = 2 * 1 = 2.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Active: 2 * 1" }], vars: { n: 2, res: 2 } },
        { line: 5, log: "fact(2) returning 2.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Suspended" }, { n: 2, status: "Returning: 2" }], vars: { n: 2, res: 2, returnVal: 2 } },
        { line: 4, log: "Resuming fact(3). Received 2 from fact(2). Calculating res = 3 * 2 = 6.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Active: 3 * 2" }], vars: { n: 3, res: 6 } },
        { line: 5, log: "fact(3) returning 6.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Suspended" }, { n: 3, status: "Returning: 6" }], vars: { n: 3, res: 6, returnVal: 6 } },
        { line: 4, log: "Resuming fact(4). Received 6 from fact(3). Calculating res = 4 * 6 = 24.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Active: 4 * 6" }], vars: { n: 4, res: 24 } },
        { line: 5, log: "fact(4) returning 24.", stack: [{ n: 5, status: "Suspended" }, { n: 4, status: "Returning: 24" }], vars: { n: 4, res: 24, returnVal: 24 } },
        { line: 4, log: "Resuming fact(5). Received 24 from fact(4). Calculating res = 5 * 24 = 120.", stack: [{ n: 5, status: "Active: 5 * 24" }], vars: { n: 5, res: 120 } },
        { line: 5, log: "fact(5) returning 120. Recursion completed!", stack: [{ n: 5, status: "Returning: 120" }], vars: { n: 5, res: 120, returnVal: 120 } },
        { line: 0, log: "Recursion finished. Output is 120.", stack: [], vars: { result: 120 } }
      ]
    },
    fibonacci: {
      name: "Fibonacci Sequence",
      category: "recursion",
      visualType: "array_build",
      desc: "Traces dynamic generation of Fibonacci sequence. Calculates list of numbers up to sequence length 7.",
      code: [
        "def fibonacci(n):",
        "    seq = [0, 1]",
        "    for i in range(2, n):",
        "        next_val = seq[i-1] + seq[i-2]",
        "        seq.append(next_val)",
        "    return seq"
      ],
      steps: [
        { line: 1, log: "Calling fibonacci with n = 7.", vars: { n: 7 } },
        { line: 2, log: "Initializing sequence with base cases [0, 1].", vars: { n: 7, seq: [0, 1] } },
        { line: 3, log: "Loop: i = 2.", vars: { n: 7, seq: [0, 1], i: 2 } },
        { line: 4, log: "Calculate next value: seq[1] + seq[0] = 1 + 0 = 1.", vars: { n: 7, seq: [0, 1], i: 2, next_val: 1 } },
        { line: 5, log: "Append 1 to sequence.", vars: { n: 7, seq: [0, 1, 1], i: 2 } },
        { line: 3, log: "Loop: i = 3.", vars: { n: 7, seq: [0, 1, 1], i: 3 } },
        { line: 4, log: "Calculate next value: seq[2] + seq[1] = 1 + 1 = 2.", vars: { n: 7, seq: [0, 1, 1], i: 3, next_val: 2 } },
        { line: 5, log: "Append 2 to sequence.", vars: { n: 7, seq: [0, 1, 1, 2], i: 3 } },
        { line: 3, log: "Loop: i = 4.", vars: { n: 7, seq: [0, 1, 1, 2], i: 4 } },
        { line: 4, log: "Calculate next value: seq[3] + seq[2] = 2 + 1 = 3.", vars: { n: 7, seq: [0, 1, 1, 2], i: 4, next_val: 3 } },
        { line: 5, log: "Append 3 to sequence.", vars: { n: 7, seq: [0, 1, 1, 2, 3], i: 4 } },
        { line: 3, log: "Loop: i = 5.", vars: { n: 7, seq: [0, 1, 1, 2, 3], i: 5 } },
        { line: 4, log: "Calculate next value: seq[4] + seq[3] = 3 + 2 = 5.", vars: { n: 7, seq: [0, 1, 1, 2, 3, 5], i: 5, next_val: 5 } },
        { line: 5, log: "Append 5 to sequence.", vars: { n: 7, seq: [0, 1, 1, 2, 3, 5], i: 5 } },
        { line: 3, log: "Loop: i = 6.", vars: { n: 7, seq: [0, 1, 1, 2, 3, 5], i: 6 } },
        { line: 4, log: "Calculate next value: seq[5] + seq[4] = 5 + 3 = 8.", vars: { n: 7, seq: [0, 1, 1, 2, 3, 5], i: 6, next_val: 8 } },
        { line: 5, log: "Append 8 to sequence.", vars: { n: 7, seq: [0, 1, 1, 2, 3, 5, 8], i: 6 } },
        { line: 6, log: "Returning sequence: [0, 1, 1, 2, 3, 5, 8].", vars: { n: 7, seq: [0, 1, 1, 2, 3, 5, 8], returnVal: [0, 1, 1, 2, 3, 5, 8] } },
        { line: 0, log: "Function completed. Return value: [0, 1, 1, 2, 3, 5, 8].", vars: { result: [0, 1, 1, 2, 3, 5, 8] } }
      ]
    },
    binary_search: {
      name: "Binary Search",
      category: "searching",
      visualType: "binary_search",
      desc: "Traces searching for target 23 in a sorted array. Visualizes the pointers low (blue), high (red), and mid (green) dividing the array.",
      array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
      code: [
        "def binary_search(arr, target):",
        "    low = 0",
        "    high = len(arr) - 1",
        "    while low <= high:",
        "        mid = (low + high) // 2",
        "        if arr[mid] == target:",
        "            return mid",
        "        elif arr[mid] < target:",
        "            low = mid + 1",
        "        else:",
        "            high = mid - 1",
        "    return -1"
      ],
      steps: [
        { line: 1, log: "Searching for target 23 in sorted array.", low: null, high: null, mid: null, vars: { target: 23 } },
        { line: 2, log: "Setting low index to 0.", low: 0, high: null, mid: null, vars: { low: 0, target: 23 } },
        { line: 3, log: "Setting high index to array end (9).", low: 0, high: 9, mid: null, vars: { low: 0, high: 9, target: 23 } },
        { line: 4, log: "Loop condition: is low <= high? (0 <= 9) -> Yes.", low: 0, high: 9, mid: null, vars: { low: 0, high: 9, target: 23 } },
        { line: 5, log: "Calculated mid index: (0+9)//2 = 4. arr[4] = 16.", low: 0, high: 9, mid: 4, vars: { low: 0, high: 9, mid: 4, "arr[mid]": 16, target: 23 } },
        { line: 6, log: "Comparing: is arr[mid] == target? (16 == 23) -> No.", low: 0, high: 9, mid: 4, vars: { low: 0, high: 9, mid: 4, "arr[mid]": 16, target: 23 } },
        { line: 8, log: "Comparing: is arr[mid] < target? (16 < 23) -> Yes.", low: 0, high: 9, mid: 4, vars: { low: 0, high: 9, mid: 4, "arr[mid]": 16, target: 23 } },
        { line: 9, log: "Updating low pointer: mid + 1 = 5. Discarding left half.", low: 5, high: 9, mid: 4, vars: { low: 5, high: 9, target: 23 } },
        { line: 4, log: "Loop condition: is low <= high? (5 <= 9) -> Yes.", low: 5, high: 9, mid: null, vars: { low: 5, high: 9, target: 23 } },
        { line: 5, log: "Calculated mid index: (5+9)//2 = 7. arr[7] = 56.", low: 5, high: 9, mid: 7, vars: { low: 5, high: 9, mid: 7, "arr[mid]": 56, target: 23 } },
        { line: 6, log: "Comparing: is arr[mid] == target? (56 == 23) -> No.", low: 5, high: 9, mid: 7, vars: { low: 5, high: 9, mid: 7, "arr[mid]": 56, target: 23 } },
        { line: 8, log: "Comparing: is arr[mid] < target? (56 < 23) -> No.", low: 5, high: 9, mid: 7, vars: { low: 5, high: 9, mid: 7, "arr[mid]": 56, target: 23 } },
        { line: 11, log: "Updating high pointer: mid - 1 = 6. Discarding right half.", low: 5, high: 6, mid: 7, vars: { low: 5, high: 6, target: 23 } },
        { line: 4, log: "Loop condition: is low <= high? (5 <= 6) -> Yes.", low: 5, high: 6, mid: null, vars: { low: 5, high: 6, target: 23 } },
        { line: 5, log: "Calculated mid index: (5+6)//2 = 5. arr[5] = 23.", low: 5, high: 6, mid: 5, vars: { low: 5, high: 6, mid: 5, "arr[mid]": 23, target: 23 } },
        { line: 6, log: "Comparing: is arr[mid] == target? (23 == 23) -> MATCH FOUND!", low: 5, high: 6, mid: 5, vars: { low: 5, high: 6, mid: 5, "arr[mid]": 23, target: 23 } },
        { line: 7, log: "Returning matched mid index (5).", low: 5, high: 6, mid: 5, vars: { low: 5, high: 6, mid: 5, returnVal: 5 } },
        { line: 0, log: "Search complete. Target 23 found at index 5.", low: 5, high: 6, mid: 5, vars: { result: 5 } }
      ]
    },
    bubble_sort: {
      name: "Bubble Sort",
      category: "sorting",
      visualType: "bubble_sort",
      desc: "Traces sorting a small unsorted array. Highlights compared indices and shows swaps occurring in real-time.",
      code: [
        "def bubble_sort(arr):",
        "    n = len(arr)",
        "    for i in range(n):",
        "        for j in range(0, n - i - 1):",
        "            if arr[j] > arr[j + 1]:",
        "                arr[j], arr[j+1] = arr[j+1], arr[j]"
      ],
      steps: [
        { line: 1, log: "Initial state of unsorted array.", arr: [23, 8, 56, 12, 38], comp: [], vars: {} },
        { line: 2, log: "Setting n = 5.", arr: [23, 8, 56, 12, 38], comp: [], vars: { n: 5 } },
        { line: 3, log: "Outer Loop: i = 0.", arr: [23, 8, 56, 12, 38], comp: [], vars: { n: 5, i: 0 } },
        { line: 4, log: "Inner Loop: j = 0.", arr: [23, 8, 56, 12, 38], comp: [0, 1], vars: { n: 5, i: 0, j: 0 } },
        { line: 5, log: "Comparing arr[0] and arr[1]: is 23 > 8? Yes.", arr: [23, 8, 56, 12, 38], comp: [0, 1], vars: { n: 5, i: 0, j: 0 } },
        { line: 6, log: "Swapping elements at index 0 and 1.", arr: [8, 23, 56, 12, 38], comp: [0, 1], vars: { n: 5, i: 0, j: 0 } },
        { line: 4, log: "Inner Loop increment: j = 1.", arr: [8, 23, 56, 12, 38], comp: [1, 2], vars: { n: 5, i: 0, j: 1 } },
        { line: 5, log: "Comparing arr[1] and arr[2]: is 23 > 56? No.", arr: [8, 23, 56, 12, 38], comp: [1, 2], vars: { n: 5, i: 0, j: 1 } },
        { line: 4, log: "Inner Loop increment: j = 2.", arr: [8, 23, 56, 12, 38], comp: [2, 3], vars: { n: 5, i: 0, j: 2 } },
        { line: 5, log: "Comparing arr[2] and arr[3]: is 56 > 12? Yes.", arr: [8, 23, 56, 12, 38], comp: [2, 3], vars: { n: 5, i: 0, j: 2 } },
        { line: 6, log: "Swapping elements at index 2 and 3.", arr: [8, 23, 12, 56, 38], comp: [2, 3], vars: { n: 5, i: 0, j: 2 } },
        { line: 4, log: "Inner Loop increment: j = 3.", arr: [8, 23, 12, 56, 38], comp: [3, 4], vars: { n: 5, i: 0, j: 3 } },
        { line: 5, log: "Comparing arr[3] and arr[4]: is 56 > 38? Yes.", arr: [8, 23, 12, 56, 38], comp: [3, 4], vars: { n: 5, i: 0, j: 3 } },
        { line: 6, log: "Swapping elements at index 3 and 4.", arr: [8, 23, 12, 38, 56], comp: [3, 4], vars: { n: 5, i: 0, j: 3 } },
        { line: 3, log: "Outer Loop increment: i = 1 (Pass 2).", arr: [8, 23, 12, 38, 56], comp: [], vars: { n: 5, i: 1 } },
        { line: 4, log: "Inner Loop reset: j = 0.", arr: [8, 23, 12, 38, 56], comp: [0, 1], vars: { n: 5, i: 1, j: 0 } },
        { line: 5, log: "Comparing arr[0] and arr[1]: is 8 > 23? No.", arr: [8, 23, 12, 38, 56], comp: [0, 1], vars: { n: 5, i: 1, j: 0 } },
        { line: 4, log: "Inner Loop increment: j = 1.", arr: [8, 23, 12, 38, 56], comp: [1, 2], vars: { n: 5, i: 1, j: 1 } },
        { line: 5, log: "Comparing arr[1] and arr[2]: is 23 > 12? Yes.", arr: [8, 23, 12, 38, 56], comp: [1, 2], vars: { n: 5, i: 1, j: 1 } },
        { line: 6, log: "Swapping elements at index 1 and 2.", arr: [8, 12, 23, 38, 56], comp: [1, 2], vars: { n: 5, i: 1, j: 1 } },
        { line: 4, log: "Inner Loop increment: j = 2.", arr: [8, 12, 23, 38, 56], comp: [2, 3], vars: { n: 5, i: 1, j: 2 } },
        { line: 5, log: "Comparing arr[2] and arr[3]: is 23 > 38? No.", arr: [8, 12, 23, 38, 56], comp: [2, 3], vars: { n: 5, i: 1, j: 2 } },
        { line: 0, log: "Array sorted successfully!", arr: [8, 12, 23, 38, 56], comp: [], vars: {} }
      ]
    },
    palindrome_check: {
      name: "Palindrome Check",
      category: "strings",
      visualType: "palindrome",
      desc: "Checks if a string is a palindrome. Visualizes low (blue) and high (red) pointers scanning s = 'RADAR' inwards.",
      code: [
        "def is_palindrome(s):",
        "    low = 0",
        "    high = len(s) - 1",
        "    while low < high:",
        "        if s[low] != s[high]:",
        "            return False",
        "        low += 1",
        "        high -= 1",
        "    return True"
      ],
      steps: [
        { line: 1, log: "Calling is_palindrome with s = 'RADAR'.", low: null, high: null, vars: { s: "RADAR" } },
        { line: 2, log: "Setting low = 0.", low: 0, high: null, vars: { s: "RADAR", low: 0 } },
        { line: 3, log: "Setting high = 4.", low: 0, high: 4, vars: { s: "RADAR", low: 0, high: 4 } },
        { line: 4, log: "Checking: is low < high? (0 < 4) -> Yes.", low: 0, high: 4, vars: { s: "RADAR", low: 0, high: 4 } },
        { line: 5, log: "Compare s[low] and s[high]: 'R' == 'R'. Matches.", low: 0, high: 4, vars: { s: "RADAR", low: 0, high: 4 } },
        { line: 7, log: "Increment low: low = 1.", low: 1, high: 4, vars: { s: "RADAR", low: 1, high: 4 } },
        { line: 8, log: "Decrement high: high = 3.", low: 1, high: 3, vars: { s: "RADAR", low: 1, high: 3 } },
        { line: 4, log: "Checking: is low < high? (1 < 3) -> Yes.", low: 1, high: 3, vars: { s: "RADAR", low: 1, high: 3 } },
        { line: 5, log: "Compare s[low] and s[high]: 'A' == 'A'. Matches.", low: 1, high: 3, vars: { s: "RADAR", low: 1, high: 3 } },
        { line: 7, log: "Increment low: low = 2.", low: 2, high: 3, vars: { s: "RADAR", low: 2, high: 3 } },
        { line: 8, log: "Decrement high: high = 2.", low: 2, high: 2, vars: { s: "RADAR", low: 2, high: 2 } },
        { line: 4, log: "Checking: is low < high? (2 < 2) -> No.", low: 2, high: 2, vars: { s: "RADAR", low: 2, high: 2 } },
        { line: 9, log: "Loop finished with no mismatches. Returning True.", low: 2, high: 2, vars: { s: "RADAR", low: 2, high: 2, returnVal: true } },
        { line: 0, log: "Function completed. Return value: True.", low: 2, high: 2, vars: { result: true } }
      ]
    },
    largest_array: {
      name: "Largest Element in Array",
      category: "arrays",
      visualType: "largest_array",
      desc: "Finds the maximum value in an array. Highlights current element index i (blue) and max_val variable.",
      code: [
        "def find_largest(arr):",
        "    max_val = arr[0]",
        "    for i in range(1, len(arr)):",
        "        if arr[i] > max_val:",
        "            max_val = arr[i]",
        "    return max_val"
      ],
      steps: [
        { line: 1, log: "Calling find_largest with arr = [2, 8, 5, 1].", i: null, vars: { arr: [2, 8, 5, 1] } },
        { line: 2, log: "Initializing max_val = arr[0] = 2.", i: null, vars: { arr: [2, 8, 5, 1], max_val: 2 } },
        { line: 3, log: "Loop: index i = 1 (arr[1] = 8).", i: 1, vars: { arr: [2, 8, 5, 1], max_val: 2, i: 1 } },
        { line: 4, log: "Check: is arr[1] > max_val? (8 > 2) -> Yes.", i: 1, vars: { arr: [2, 8, 5, 1], max_val: 2, i: 1 } },
        { line: 5, log: "Update max_val to 8.", i: 1, vars: { arr: [2, 8, 5, 1], max_val: 8, i: 1 } },
        { line: 3, log: "Loop: index i = 2 (arr[2] = 5).", i: 2, vars: { arr: [2, 8, 5, 1], max_val: 8, i: 2 } },
        { line: 4, log: "Check: is arr[2] > max_val? (5 > 8) -> No.", i: 2, vars: { arr: [2, 8, 5, 1], max_val: 8, i: 2 } },
        { line: 3, log: "Loop: index i = 3 (arr[3] = 1).", i: 3, vars: { arr: [2, 8, 5, 1], max_val: 8, i: 3 } },
        { line: 4, log: "Check: is arr[3] > max_val? (1 > 8) -> No.", i: 3, vars: { arr: [2, 8, 5, 1], max_val: 8, i: 3 } },
        { line: 6, log: "Loop finished. Returning max_val = 8.", i: null, vars: { arr: [2, 8, 5, 1], max_val: 8, returnVal: 8 } },
        { line: 0, log: "Function completed. Return value: 8.", i: null, vars: { result: 8 } }
      ]
    },
    gcd: {
      name: "GCD (Greatest Common Divisor)",
      category: "recursion",
      visualType: "stack",
      desc: "Traces Euclidean algorithm for GCD recursively. Shows stack frames of gcd(36, 24) computing 12.",
      code: [
        "def gcd(a, b):",
        "    if b == 0:",
        "        return a",
        "    return gcd(b, a % b)"
      ],
      steps: [
        { line: 1, log: "Initial call: gcd(36, 24).", stack: [{ a: 36, b: 24, status: "Active" }], vars: { a: 36, b: 24 } },
        { line: 2, log: "Check base case: is b == 0? (24 == 0) -> No.", stack: [{ a: 36, b: 24, status: "Active" }], vars: { a: 36, b: 24 } },
        { line: 4, log: "Evaluate gcd(b, a % b) -> gcd(24, 12). Suspending frame.", stack: [{ a: 36, b: 24, status: "Suspended" }], vars: { a: 36, b: 24 } },
        { line: 1, log: "Recursive call: gcd(24, 12).", stack: [{ a: 36, b: 24, status: "Suspended" }, { a: 24, b: 12, status: "Active" }], vars: { a: 24, b: 12 } },
        { line: 2, log: "Check base case: is b == 0? (12 == 0) -> No.", stack: [{ a: 36, b: 24, status: "Suspended" }, { a: 24, b: 12, status: "Active" }], vars: { a: 24, b: 12 } },
        { line: 4, log: "Evaluate gcd(b, a % b) -> gcd(12, 0). Suspending frame.", stack: [{ a: 36, b: 24, status: "Suspended" }, { a: 24, b: 12, status: "Suspended" }], vars: { a: 24, b: 12 } },
        { line: 1, log: "Recursive call: gcd(12, 0).", stack: [{ a: 36, b: 24, status: "Suspended" }, { a: 24, b: 12, status: "Suspended" }, { a: 12, b: 0, status: "Active" }], vars: { a: 12, b: 0 } },
        { line: 2, log: "Check base case: is b == 0? (0 == 0) -> Yes!", stack: [{ a: 36, b: 24, status: "Suspended" }, { a: 24, b: 12, status: "Suspended" }, { a: 12, b: 0, status: "Active" }], vars: { a: 12, b: 0 } },
        { line: 3, log: "Base case matched. Returning a = 12.", stack: [{ a: 36, b: 24, status: "Suspended" }, { a: 24, b: 12, status: "Suspended" }, { a: 12, b: 0, status: "Base Return: 12" }], vars: { a: 12, b: 0, returnVal: 12 } },
        { line: 4, log: "Resume gcd(24, 12). Received 12 from child. Returning 12.", stack: [{ a: 36, b: 24, status: "Suspended" }, { a: 24, b: 12, status: "Returning: 12" }], vars: { a: 24, b: 12, returnVal: 12 } },
        { line: 4, log: "Resume gcd(36, 24). Received 12 from child. Returning 12.", stack: [{ a: 36, b: 24, status: "Returning: 12" }], vars: { a: 36, b: 24, returnVal: 12 } },
        { line: 0, log: "Function completed. Return value: 12.", stack: [], vars: { result: 12 } }
      ]
    }
  };

  const currentPreset = presets[activeTab];
  const currentStepData = currentPreset.steps[step];

  const getCategoryDetails = (cat) => {
    switch(cat) {
      case 'numbers': return { name: 'Numbers', icon: Hash, color: 'text-amber-600 bg-amber-50 border-amber-100' };
      case 'recursion': return { name: 'Recursion', icon: Brain, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
      case 'searching': return { name: 'Searching', icon: Binary, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      case 'sorting': return { name: 'Sorting', icon: BarChart, color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 'arrays': return { name: 'Arrays', icon: List, color: 'text-blue-600 bg-blue-50 border-blue-100' };
      case 'strings': return { name: 'Strings', icon: Type, color: 'text-purple-600 bg-purple-50 border-purple-100' };
      default: return { name: 'General', icon: Cpu, color: 'text-slate-650 bg-slate-50 border-slate-100' };
    }
  };

  const getStackFrameLabel = (frame) => {
    if (frame.a !== undefined) return `gcd(${frame.a}, ${frame.b})`;
    if (activeTab === 'sum_digits') return `sum_digits(${frame.n})`;
    return `fact(${frame.n})`;
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9fafb] font-sans">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900">Step-by-Step Algorithm Visualizer</span>
        </div>
        <div className="flex items-center gap-3">
          <span 
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            CRT Study Tools
          </span>
        </div>
      </header>

      {/* Main Body: Sidebar + Editor/Visualizer Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Topic Selector Sidebar */}
        <aside className="w-80 border-r border-gray-250 bg-white flex flex-col shrink-0 select-none">
          <div className="p-5 border-b border-gray-150">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-500" /> Visualization Topics
            </h3>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {Object.entries(presets).map(([key, value]) => {
              const isActive = activeTab === key;
              const catDetails = getCategoryDetails(value.category);
              const CatIcon = catDetails.icon;

              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                    isActive 
                      ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' 
                      : 'border-transparent hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${isActive ? 'text-indigo-650' : 'text-gray-900'}`}>
                      {value.name}
                    </span>
                    <div className={`p-1 rounded-md border flex items-center justify-center shrink-0 ${catDetails.color}`}>
                      <CatIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-450 text-gray-400 uppercase tracking-widest font-black">
                    {catDetails.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Side: Scrollable Arena */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* Topic Description Card */}
            <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <span className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${getCategoryDetails(currentPreset.category).color}`}>
                  {React.createElement(getCategoryDetails(currentPreset.category).icon, { className: 'w-3.5 h-3.5' })}
                  {getCategoryDetails(currentPreset.category).name}
                </span>
                <span className="text-xs font-bold text-gray-400">Preset Trace Simulation</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 leading-snug">{currentPreset.name}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mt-1.5">{currentPreset.desc}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: CODE & VARIABLES WATCHER (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Python Code block */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col min-h-[300px]">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-400 font-mono">Python Code snippet</span>
                    </div>
                  </div>
                  
                  <div className="font-mono text-xs text-slate-300 space-y-1.5 flex-1 relative z-10 select-none">
                    {currentPreset.code.map((line, idx) => {
                      const lineNum = idx + 1;
                      const isActive = currentStepData.line === lineNum;
                      
                      return (
                        <div 
                          key={idx}
                          className={`flex items-center w-full py-1 px-2.5 rounded-lg transition-all relative ${
                            isActive ? 'bg-indigo-500/10 border-l-4 border-indigo-500 text-white font-bold' : ''
                          }`}
                        >
                          <span className="w-6 text-slate-600 text-right mr-4 select-none font-semibold">{lineNum}</span>
                          <pre className="whitespace-pre">{line}</pre>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
                </div>

                {/* Local variable watcher */}
                <div className="bg-white border border-[#e5e7eb] rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-indigo-500" /> Local Variables
                  </h3>
                  <div className="divide-y divide-gray-100 font-mono text-[13px]">
                    {Object.keys(currentStepData.vars).length > 0 ? (
                      Object.entries(currentStepData.vars).map(([name, val], i) => (
                        <div key={i} className="flex justify-between py-2.5">
                          <span className="text-gray-500 font-semibold">{name}</span>
                          <span className="text-[#111827] font-bold bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-lg shadow-sm">{JSON.stringify(val)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-gray-400 italic text-center text-xs">No variables active in current scope</div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: VISUAL ARENA & EXECUTION LOGS (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Visualizer Player */}
                <div className="bg-white border border-[#e5e7eb] rounded-3xl p-8 shadow-sm flex flex-col justify-between min-h-[380px] relative overflow-hidden">
                  
                  {/* Arena Header */}
                  <div className="flex justify-between items-center shrink-0 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center" style={{ color: accentColor }}>
                        <Layers className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">{currentPreset.name} Arena</h3>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Visual state representation</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                      Step {step + 1} of {currentPreset.steps.length}
                    </span>
                  </div>

                  {/* Dynamic Visualizers */}
                  <div className="flex-1 flex flex-col justify-center items-center py-6 w-full">
                    
                    {/* Visualizer: STACK PILE */}
                    {currentPreset.visualType === 'stack' && (
                      <div className="flex flex-col-reverse w-full max-w-[240px] gap-3">
                        {currentStepData.stack && currentStepData.stack.length > 0 ? (
                          <AnimatePresence initial={false}>
                            {currentStepData.stack.map((frame, i) => {
                              const isTop = i === currentStepData.stack.length - 1;
                              const isBase = frame.status.toLowerCase().includes('base');
                              const isReturning = frame.status.toLowerCase().includes('return');
                              
                              return (
                                <motion.div
                                  key={i + '-' + (frame.n || frame.a)}
                                  initial={{ opacity: 0, scale: 0.8, y: -25 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 25 }}
                                  transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                                  className={`border rounded-xl p-3 text-center flex flex-col justify-center relative overflow-hidden shadow-sm ${
                                    isBase 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-extrabold shadow-emerald-100/50' 
                                      : isReturning
                                      ? 'bg-amber-50 border-amber-200 text-amber-950 font-extrabold shadow-amber-100/50'
                                      : isTop
                                      ? 'bg-indigo-650 text-white font-extrabold shadow-indigo-100/30'
                                      : 'bg-white border-gray-200 text-gray-700'
                                  }`}
                                  style={{ backgroundColor: isTop && !isBase && !isReturning ? accentColor : undefined }}
                                >
                                  <span className="text-sm font-mono font-bold">{getStackFrameLabel(frame)}</span>
                                  <span className={`text-[10px] mt-1 block truncate font-medium ${isTop && !isBase && !isReturning ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {frame.status}
                                  </span>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        ) : (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center text-center space-y-3 py-6"
                          >
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center shadow-inner animate-bounce">
                              <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-gray-800 text-sm">Execution Completed</h4>
                              <p className="text-xs text-gray-500 max-w-[200px] mt-0.5">Stack resolved successfully. Output value returned: {currentStepData.vars.result}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Visualizer: DIGITS (for Largest Digit, Reverse Number) */}
                    {currentPreset.visualType === 'digits' && (
                      <div className="w-full max-w-md space-y-8 text-center">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Input Number (n)</span>
                            <span className="text-2xl font-mono font-bold text-gray-900">{currentStepData.vars.n}</span>
                          </div>
                          <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block mb-1">Extracted Digit</span>
                            <span className="text-2xl font-mono font-bold text-indigo-700">
                              {currentStepData.vars.digit !== undefined ? currentStepData.vars.digit : "-"}
                            </span>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block mb-1">
                              {activeTab === 'reverse_number' ? 'Reversed (rev)' : 'Max Digit'}
                            </span>
                            <span className="text-2xl font-mono font-bold text-emerald-700">
                              {activeTab === 'reverse_number' 
                                ? (currentStepData.vars.rev !== undefined ? currentStepData.vars.rev : "0")
                                : (currentStepData.vars.max_digit !== undefined ? currentStepData.vars.max_digit : "0")
                              }
                            </span>
                          </div>
                        </div>

                        {/* Interactive animation representing division of digits */}
                        {currentStepData.vars.digit !== undefined && (
                          <div className="text-xs font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100 py-3 px-6 rounded-2xl inline-block max-w-[280px]">
                            {activeTab === 'reverse_number' ? (
                              <span>Shifting rev: rev = ({currentPreset.steps[step - 1]?.vars.rev || 0} * 10) + {currentStepData.vars.digit} = {currentStepData.vars.rev}</span>
                            ) : (
                              <span>Comparing: max({currentPreset.steps[step - 1]?.vars.max_digit || 0}, {currentStepData.vars.digit}) = {currentStepData.vars.max_digit}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Visualizer: ARRAY BUILDER (for Fibonacci) */}
                    {currentPreset.visualType === 'array_build' && (
                      <div className="w-full space-y-6">
                        <div className="flex flex-wrap justify-center items-center gap-3">
                          {currentStepData.vars.seq && currentStepData.vars.seq.map((num, i) => (
                            <motion.div
                              key={i + '-' + num}
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 350, damping: 20 }}
                              className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-700 font-mono font-bold text-base flex items-center justify-center shadow-sm"
                            >
                              {num}
                            </motion.div>
                          ))}
                        </div>

                        {currentStepData.vars.next_val !== undefined && (
                          <div className="text-center">
                            <span className="text-xs font-bold text-indigo-650 bg-indigo-50/50 border border-indigo-100 py-2.5 px-5 rounded-2xl inline-block">
                              Adding next: {currentStepData.vars.seq[currentStepData.vars.seq.length - 2]} + {currentStepData.vars.seq[currentStepData.vars.seq.length - 1]} = {currentStepData.vars.next_val}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Visualizer: BINARY SEARCH */}
                    {currentPreset.visualType === 'binary_search' && (
                      <div className="w-full space-y-12">
                        <div className="flex justify-center items-center gap-2 overflow-x-auto py-4 px-2 custom-scrollbar">
                          {currentPreset.array.map((num, i) => {
                            const isLow = i === currentStepData.low;
                            const isHigh = i === currentStepData.high;
                            const isMid = i === currentStepData.mid;
                            const inRange = currentStepData.low !== null && currentStepData.high !== null && i >= currentStepData.low && i <= currentStepData.high;
                            
                            return (
                              <div key={i} className="flex flex-col items-center shrink-0 gap-2">
                                <div 
                                  className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-all duration-300 ${
                                    isMid 
                                      ? 'bg-emerald-500 border-emerald-600 text-white scale-110 shadow-emerald-100 ring-4 ring-emerald-100' 
                                      : isLow 
                                      ? 'bg-blue-500 border-blue-600 text-white scale-105' 
                                      : isHigh 
                                      ? 'bg-red-500 border-red-600 text-white scale-105'
                                      : inRange
                                      ? 'bg-white border-indigo-300 text-indigo-950 font-extrabold'
                                      : 'bg-gray-50 border-gray-150 text-gray-400 opacity-40'
                                  }`}
                                >
                                  {num}
                                </div>
                                <div className="h-6 flex flex-col items-center">
                                  {isMid && <span className="text-[10px] font-black text-emerald-600 uppercase">Mid</span>}
                                  {isLow && <span className="text-[10px] font-black text-blue-600 uppercase">Low</span>}
                                  {isHigh && <span className="text-[10px] font-black text-red-600 uppercase">High</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
                          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-blue-500"></span> Low index</span>
                          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-red-500"></span> High index</span>
                          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-emerald-500"></span> Midpoint (check)</span>
                        </div>
                      </div>
                    )}

                    {/* Visualizer: BUBBLE SORT */}
                    {currentPreset.visualType === 'bubble_sort' && (
                      <div className="w-full max-w-lg space-y-8">
                        <div className="flex justify-around items-end h-[160px] border-b border-gray-250 pb-2 relative">
                          {currentStepData.arr.map((val, i) => {
                            const isCompared = currentStepData.comp.includes(i);
                            const percentHeight = (val / 56) * 100;
                            
                            return (
                              <div key={i} className="flex flex-col items-center w-16 gap-3">
                                <span className="text-[11px] font-mono font-bold text-gray-500">{val}</span>
                                <motion.div
                                  layout
                                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                  className={`w-10 rounded-t-xl transition-colors shadow-sm ${
                                    isCompared 
                                      ? 'bg-amber-400 border border-amber-500 animate-pulse' 
                                      : 'bg-indigo-500 border border-indigo-650/50'
                                  }`}
                                  style={{ 
                                    height: `${percentHeight}px`,
                                    backgroundColor: !isCompared ? accentColor : undefined,
                                    borderColor: !isCompared ? accentColor : undefined
                                  }}
                                />
                                <span className="text-[10px] font-black text-gray-400 font-mono">idx {i}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-center text-xs font-bold uppercase tracking-wider text-gray-500">
                          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-amber-400"></span> Currently comparing</span>
                        </div>
                      </div>
                    )}

                    {/* Visualizer: PALINDROME (for Palindrome Check) */}
                    {currentPreset.visualType === 'palindrome' && (
                      <div className="w-full space-y-12">
                        <div className="flex justify-center items-center gap-4">
                          {currentStepData.vars.s.split('').map((char, i) => {
                            const isLow = i === currentStepData.low;
                            const isHigh = i === currentStepData.high;
                            
                            return (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div 
                                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-mono font-black text-lg shadow-sm transition-all duration-300 ${
                                    isLow 
                                      ? 'bg-blue-500 border-blue-600 text-white scale-110 shadow-blue-100 ring-4 ring-blue-100' 
                                      : isHigh 
                                      ? 'bg-red-500 border-red-600 text-white scale-110 shadow-red-100 ring-4 ring-red-100'
                                      : 'bg-white border-gray-200 text-gray-800'
                                  }`}
                                >
                                  {char}
                                </div>
                                <div className="h-6 flex flex-col items-center">
                                  {isLow && <span className="text-[10px] font-black text-blue-650 uppercase">Low</span>}
                                  {isHigh && <span className="text-[10px] font-black text-red-650 uppercase">High</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-500">
                          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-blue-500"></span> Low index</span>
                          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-md bg-red-500"></span> High index</span>
                        </div>
                      </div>
                    )}

                    {/* Visualizer: LARGEST ARRAY */}
                    {currentPreset.visualType === 'largest_array' && (
                      <div className="w-full space-y-10 text-center">
                        <div className="flex justify-center items-center gap-3">
                          {currentStepData.vars.arr && currentStepData.vars.arr.map((num, i) => {
                            const isActive = i === currentStepData.i;
                            return (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div 
                                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-mono font-bold text-base shadow-sm transition-all duration-300 ${
                                    isActive 
                                      ? 'bg-blue-500 border-blue-600 text-white scale-110 shadow-blue-100 ring-4 ring-blue-100' 
                                      : 'bg-white border-gray-200 text-gray-800'
                                  }`}
                                >
                                  {num}
                                </div>
                                <div className="h-6 flex flex-col items-center">
                                  {isActive && <span className="text-[10px] font-black text-blue-650 uppercase">Index i</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {currentStepData.vars.max_val !== undefined && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 inline-block shadow-sm">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block mb-1">Current Max Value (max_val)</span>
                            <span className="text-2xl font-mono font-black text-emerald-700">{currentStepData.vars.max_val}</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Controls */}
                  <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={step === 0}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                        title="Step Backward"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-6 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer hover:brightness-95 text-sm"
                        style={{ backgroundColor: accentColor }}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                        {isPlaying ? 'Pause' : 'Auto Play'}
                      </button>
                      
                      <button
                        onClick={handleNext}
                        disabled={step === currentPreset.steps.length - 1}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                        title="Step Forward"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>

                      <button
                        onClick={handleReset}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        title="Reset Algorithm"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>

                    {isPlaying && (
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Delay:</span>
                        <input
                          type="range"
                          min="500"
                          max="3000"
                          step="250"
                          value={playSpeed}
                          onChange={(e) => setPlaySpeed(parseInt(e.target.value))}
                          className="w-24 accent-indigo-650 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-gray-500 w-12 text-right">{playSpeed}ms</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Console Logs */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Terminal className="w-4.5 h-4.5 text-emerald-400" /> Execution Console
                  </h3>
                  <div className="font-mono text-xs text-emerald-400 space-y-2 h-20 overflow-y-auto custom-scrollbar select-none pr-1">
                    <div className="text-slate-500">&gt; python code_simulator.py</div>
                    <div className="text-white font-bold leading-relaxed">
                      &gt; {currentStepData.log}
                    </div>
                    {step === currentPreset.steps.length - 1 && (
                      <div className="text-emerald-500 font-extrabold animate-pulse">&gt; Done. Process finished with exit code 0.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CodeVisualizer;
