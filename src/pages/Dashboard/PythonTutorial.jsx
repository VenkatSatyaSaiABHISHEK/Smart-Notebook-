import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Terminal, 
  Code2, 
  BookOpen, 
  Cpu, 
  Activity, 
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle,
  Code,
  Lock,
  Compass,
  Trophy,
  Award,
  Zap,
  ChevronRight,
  Check,
  Heart,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const PythonTutorial = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const accentColor = userData?.accentColor || '#6366f1';
  
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [totalXP, setTotalXP] = useState(0);
  const [activeTopicId, setActiveTopicId] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [freePlay, setFreePlay] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  // Gamified Quiz state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizLives, setQuizLives] = useState(3);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(""); // "correct", "incorrect", or ""
  const [hasReadLesson, setHasReadLesson] = useState(false);

  // Step-by-Step Visualizer state for Exam Challenge
  const [showTrace, setShowTrace] = useState(false);
  const [traceStep, setTraceStep] = useState(0);

  // Reset lesson read & trace states when active topic changes
  useEffect(() => {
    setHasReadLesson(false);
    setShowTrace(false);
    setTraceStep(0);
  }, [activeTopicId]);

  // Flat list of topics for easy lookup
  const getQuizForTopic = (id) => {
    const quizzes = {
      1: {
        question: "Which of the following is true about Python?",
        options: [
          "A. It is compiled only and runs close to hardware.",
          "B. It is an interpreted, high-level language.",
          "C. It does not support Object-Oriented programming.",
          "D. It requires manual variable memory declarations."
        ],
        correct: "B. It is an interpreted, high-level language."
      },
      2: {
        question: "What is the purpose of indentation in Python?",
        options: [
          "A. It is optional and only used for code formatting.",
          "B. It tells the interpreter the variable data types.",
          "C. It defines code blocks (like loops or functions) instead of brackets.",
          "D. It speeds up standard compiler execution."
        ],
        correct: "C. It defines code blocks (like loops or functions) instead of brackets."
      },
      3: {
        question: "What is the output of type(10.5) in Python?",
        options: [
          "A. <class 'int'>",
          "B. <class 'float'>",
          "C. <class 'double'>",
          "D. <class 'complex'>"
        ],
        correct: "B. <class 'float'>"
      },
      4: {
        question: "Which built-in function reads console inputs as a string in Python?",
        options: [
          "A. read()",
          "B. get_string()",
          "C. input()",
          "D. scanf()"
        ],
        correct: "C. input()"
      },
      5: {
        question: "How do you convert the string variable age = '20' into an integer?",
        options: [
          "A. age = str(age)",
          "B. age = int(age)",
          "C. age = float(age)",
          "D. age = integer(age)"
        ],
        correct: "B. age = int(age)"
      },
      6: {
        question: "What does the floor division operator // return?",
        options: [
          "A. Remainder of division",
          "B. Quotient as float decimal",
          "C. Quotient as integer (rounded down)",
          "D. Exponentiation of first term"
        ],
        correct: "C. Quotient as integer (rounded down)"
      },
      7: {
        question: "When does the block under an 'if' statement execute?",
        options: [
          "A. Only if the boolean condition is False.",
          "B. Only if the boolean condition is True.",
          "C. Always at least once.",
          "D. Never (it is a placeholder)."
        ],
        correct: "B. Only if the boolean condition is True."
      },
      8: {
        question: "If the 'if' condition is False, which block runs in an if-else statement?",
        options: [
          "A. if block",
          "B. else block",
          "C. Both blocks",
          "D. Neither block"
        ],
        correct: "B. else block"
      },
      9: {
        question: "In an if-elif-else chain, how many conditional blocks can execute at most?",
        options: [
          "A. All of them",
          "B. Exactly two",
          "C. At most one",
          "D. None of them"
        ],
        correct: "C. At most one"
      },
      10: {
        question: "What is the output of list(range(1, 4))?",
        options: [
          "A. [1, 2, 3, 4]",
          "B. [1, 2, 3]",
          "C. [0, 1, 2, 3]",
          "D. [1, 3]"
        ],
        correct: "B. [1, 2, 3]"
      },
      11: {
        question: "What happens if a while loop condition never evaluates to False?",
        options: [
          "A. Runs once and returns None.",
          "B. Throws a syntax compile error.",
          "C. Creates an infinite loop.",
          "D. Skips execution automatically."
        ],
        correct: "C. Creates an infinite loop."
      },
      12: {
        question: "If an outer loop runs 3 times and an inner loop runs 3 times, how many total times does the inner loop body run?",
        options: [
          "A. 6 times",
          "B. 9 times",
          "C. 3 times",
          "D. 1 time"
        ],
        correct: "B. 9 times"
      },
      13: {
        question: "Which loop control keyword immediately exits the current loop?",
        options: [
          "A. continue",
          "B. break",
          "C. pass",
          "D. exit"
        ],
        correct: "B. break"
      },
      14: {
        question: "What is the output of the string slice 'python'[1:3]?",
        options: [
          "A. 'py'",
          "B. 'yt'",
          "C. 'yth'",
          "D. 'th'"
        ],
        correct: "B. 'yt'"
      },
      15: {
        question: "Which method adds an element to the end of a list?",
        options: [
          "A. insert()",
          "B. add()",
          "C. append()",
          "D. extend()"
        ],
        correct: "C. append()"
      },
      16: {
        question: "Which of the following is true about Tuples?",
        options: [
          "A. They are mutable and can expand.",
          "B. They are immutable and cannot be changed after creation.",
          "C. They cannot be indexed.",
          "D. They use square brackets [] instead of parentheses."
        ],
        correct: "B. They are immutable and cannot be changed after creation."
      },
      17: {
        question: "Which set method is used to combine elements of two sets, keeping only unique values?",
        options: [
          "A. intersection()",
          "B. difference()",
          "C. union()",
          "D. add()"
        ],
        correct: "C. union()"
      },
      18: {
        question: "How do you retrieve keys of a dictionary?",
        options: [
          "A. dict.keys()",
          "B. dict.values()",
          "C. dict.items()",
          "D. dict.get()"
        ],
        correct: "A. dict.keys()"
      },
      19: {
        question: "How do you declare a custom function in Python?",
        options: [
          "A. function greet():",
          "B. define greet():",
          "C. def greet():",
          "D. void greet():"
        ],
        correct: "C. def greet():"
      },
      20: {
        question: "What is a lambda function in Python?",
        options: [
          "A. A recursive function that calls itself.",
          "B. An anonymous, single-expression inline function.",
          "C. A class constructor method.",
          "D. A function with no return parameters."
        ],
        correct: "B. An anonymous, single-expression inline function."
      }
    };

    return quizzes[id] || {
      question: `What is the default operation behavior of topic level ${id}?`,
      options: [
        "A. Modifies variable scope variables.",
        "B. Declares a new array object.",
        "C. Extends functions or classes.",
        "D. Runs standard python operation expressions."
      ],
      correct: "D. Runs standard python operation expressions."
    };
  };

  const getExamChallengeForTopic = (id) => {
    const challenges = {
      9: {
        title: "Find the largest of three numbers using conditionals.",
        desc: "Teacher challenge: Write a Python program to compare variables a, b, and c, and store the maximum in variable 'largest'.",
        code: [
          "a, b, c = 12, 45, 23",
          "if a >= b and a >= c:",
          "    largest = a",
          "elif b >= a and b >= c:",
          "    largest = b",
          "else:",
          "    largest = c",
          "print('Largest:', largest)"
        ],
        steps: [
          { line: 1, log: "Initialize values: a = 12, b = 45, c = 23.", vars: { a: 12, b: 45, c: 23 } },
          { line: 2, log: "Evaluate condition: is 12 >= 45 and 12 >= 23? (False and False) -> False. Move to next condition.", vars: { a: 12, b: 45, c: 23 } },
          { line: 4, log: "Evaluate elif condition: is 45 >= 12 and 45 >= 23? (True and True) -> True! Enter block.", vars: { a: 12, b: 45, c: 23 } },
          { line: 5, log: "Condition met: set largest = b = 45.", vars: { a: 12, b: 45, c: 23, largest: 45 } },
          { line: 8, log: "Print results: 'Largest: 45'. Output displayed successfully.", vars: { a: 12, b: 45, c: 23, largest: 45 } }
        ]
      },
      15: {
        title: "Find the maximum element in a list.",
        desc: "Teacher challenge: Write a program to iterate over a list 'arr' and find the largest number. Print 'Max: <value>'.",
        code: [
          "arr = [12, 3, 45, 8]",
          "max_val = arr[0]",
          "for x in arr:",
          "    if x > max_val:",
          "        max_val = x",
          "print('Max:', max_val)"
        ],
        steps: [
          { line: 1, log: "Initialize list array: arr = [12, 3, 45, 8].", vars: { arr: [12, 3, 45, 8] } },
          { line: 2, log: "Set initial max_val = arr[0] = 12.", vars: { arr: [12, 3, 45, 8], max_val: 12 } },
          { line: 3, log: "Loop iteration 1: examine x = 12.", vars: { arr: [12, 3, 45, 8], max_val: 12, x: 12 } },
          { line: 4, log: "Compare: is x > max_val? (12 > 12) -> No. Skip update.", vars: { arr: [12, 3, 45, 8], max_val: 12, x: 12 } },
          { line: 3, log: "Loop iteration 2: examine x = 3.", vars: { arr: [12, 3, 45, 8], max_val: 12, x: 3 } },
          { line: 4, log: "Compare: is x > max_val? (3 > 12) -> No. Skip update.", vars: { arr: [12, 3, 45, 8], max_val: 12, x: 3 } },
          { line: 3, log: "Loop iteration 3: examine x = 45.", vars: { arr: [12, 3, 45, 8], max_val: 12, x: 45 } },
          { line: 4, log: "Compare: is x > max_val? (45 > 12) -> Yes! Enter block.", vars: { arr: [12, 3, 45, 8], max_val: 12, x: 45 } },
          { line: 5, log: "Update maximum variable: max_val = 45.", vars: { arr: [12, 3, 45, 8], max_val: 45, x: 45 } },
          { line: 3, log: "Loop iteration 4: examine x = 8.", vars: { arr: [12, 3, 45, 8], max_val: 45, x: 8 } },
          { line: 4, log: "Compare: is x > max_val? (8 > 45) -> No. Skip update.", vars: { arr: [12, 3, 45, 8], max_val: 45, x: 8 } },
          { line: 6, log: "Print statement executes: 'Max: 45'. Output displayed successfully.", vars: { arr: [12, 3, 45, 8], max_val: 45 } }
        ]
      }
    };

    return challenges[id] || {
      title: `Write a program to demonstrate the functionality of Quest ${id}.`,
      desc: "Teacher challenge: Write a Python program to perform standard operations and output results.",
      code: [
        "val1 = 10",
        "val2 = 20",
        "result = val1 + val2",
        "print('Result:', result)"
      ],
      steps: [
        { line: 1, log: "Setting up program variables.", vars: {} },
        { line: 2, log: "Assign val1 = 10.", vars: { val1: 10 } },
        { line: 3, log: "Assign val2 = 20.", vars: { val1: 10, val2: 20 } },
        { line: 4, log: "Add parameters: result = 10 + 20 = 30.", vars: { val1: 10, val2: 20, result: 30 } },
        { line: 5, log: "Print output: 'Result: 30'. Finished execution.", vars: { val1: 10, val2: 20, result: 30 } }
      ]
    };
  };

  // Flat list of topics
  const phases = [
    {
      id: 1,
      name: "Phase 1: Python Basics",
      topics: [
        {
          id: 1,
          name: "Introduction to Python",
          desc: "Learn what Python is, its key features, common applications, and how to set up your programming IDE workspace.",
          code: `# Python is an interpreted, high-level programming language.
# Let's verify our setup by printing a hello message:
print("Welcome to Python, Abhishek!")
print("Vite Dev Server sandbox is running.")`,
          output: "Welcome to Python, Abhishek!\nVite Dev Server sandbox is running."
        },
        {
          id: 2,
          name: "Python Syntax",
          desc: "Understand print statements, comments, variables, and Python's critical indentation rules for nesting blocks.",
          code: `# Indentation defines blocks of code in Python
name = "Abhi"
if True:
    print(f"Indentation matches: Hello {name}")`,
          output: "Indentation matches: Hello Abhi"
        },
        {
          id: 3,
          name: "Data Types",
          desc: "Discover Python's fundamental data types: Integer (int), Float, String (str), Boolean (bool), and Complex numbers.",
          code: `x = 10         # Integer
y = 10.5       # Float
name = "Abhi"  # String
is_student = True # Boolean
c = 2 + 3j     # Complex

print(f"x is {type(x).__name__}, y is {type(y).__name__}")
print(f"name is {type(name).__name__}, is_student is {type(is_student).__name__}")
print(f"c is {type(c).__name__} with real part {c.real}")`,
          output: "x is int, y is float\nname is str, is_student is bool\nc is complex with real part 2.0"
        },
        {
          id: 4,
          name: "Input and Output",
          desc: "Master reading string inputs from users using the input() function and writing outputs to standard output.",
          code: `# Simulating input value "Abhi"
username = "Abhi" # input("Enter Name: ")
print(f"Hello, {username}! Welcome to your dashboard.")`,
          output: "Hello, Abhi! Welcome to your dashboard."
        },
        {
          id: 5,
          name: "Type Conversion",
          desc: "Learn casting variables from one data type to another using constructor functions like int(), float(), and str().",
          code: `age_str = "20"
# Convert string to integer for calculation
age = int(age_str)
next_year = age + 1

print(f"Converted {type(age_str).__name__} to {type(age).__name__}")
print(f"Calculated Age Next Year: {next_year}")`,
          output: "Converted str to int\nCalculated Age Next Year: 21"
        },
        {
          id: 6,
          name: "Operators",
          desc: "Use arithmetic operators (+, -, *, /, %, **, //), logical operators (and, or, not), and comparison operators.",
          code: `x = 15
y = 4

print("Arithmetic: 15 // 4 = ", x // y) # Floor division
print("Comparison: 15 != 4 ->", x != y)
print("Logical: (15 > 4) and (4 > 0) ->", (x > y) and (y > 0))`,
          output: "Arithmetic: 15 // 4 =  3\nComparison: 15 != 4 -> True\nLogical: (15 > 4) and (4 > 0) -> True"
        }
      ]
    },
    {
      id: 2,
      name: "Phase 2: Decision Making",
      topics: [
        {
          id: 7,
          name: "if Statement",
          desc: "Control program execution using 'if' statements to run block sections only if conditions hold True.",
          code: `age = 18

if age >= 18:
    print("Condition met: Adult")`,
          output: "Condition met: Adult"
        },
        {
          id: 8,
          name: "if else Statement",
          desc: "Provide alternative program paths with 'else' blocks when the 'if' logical condition evaluates to False.",
          code: `age = 16

if age >= 18:
    print("Adult")
else:
    print("Minor")`,
          output: "Minor"
        },
        {
          id: 9,
          name: "if elif else Statement",
          desc: "Chain multiple conditional expressions sequentially using 'elif' before ending with a fallback 'else' block.",
          code: `marks = 85

if marks >= 90:
    print("Grade: A")
elif marks >= 80:
    print("Grade: B")
else:
    print("Grade: C")`,
          output: "Grade: B"
        }
      ]
    },
    {
      id: 3,
      name: "Phase 3: Loops",
      topics: [
        {
          id: 10,
          name: "for Loop",
          desc: "Iterate over a sequence or number range dynamically using the index loop 'for' statement.",
          code: `print("Looping through range(3):")
for i in range(3):
    print(f"Index: {i}")`,
          output: "Looping through range(3):\nIndex: 0\nIndex: 1\nIndex: 2"
        },
        {
          id: 11,
          name: "while Loop",
          desc: "Execute a block of code repeatedly as long as a specified logical condition remains True.",
          code: `i = 1
while i <= 3:
    print(f"Count: {i}")
    i += 1`,
          output: "Count: 1\nCount: 2\nCount: 3"
        },
        {
          id: 12,
          name: "Nested Loops",
          desc: "Place loops inside loops to iterate multi-dimensional datasets or construct coordinate pairs.",
          code: `for i in range(2):
    for j in range(2):
        print(f"Grid: i={i}, j={j}")`,
          output: "Grid: i={0}, j={0}\nGrid: i={0}, j={1}\nGrid: i={1}, j={0}\nGrid: i={1}, j={1}"
        },
        {
          id: 13,
          name: "Loop Control",
          desc: "Modify standard loop flow dynamically using break (terminates loop), continue (skips step), or pass (placeholder).",
          code: `for num in range(1, 6):
    if num == 3:
        continue # Skip 3
    if num == 5:
        break # Exit at 5
    print(f"Number: {num}")`,
          output: "Number: 1\nNumber: 2\nNumber: 4"
        }
      ]
    },
    {
      id: 4,
      name: "Phase 4: Strings",
      topics: [
        {
          id: 14,
          name: "String Basics",
          desc: "Manipulate text data. Master index mapping, string slicing [start:end], build-in methods, and f-strings.",
          code: `name = "Python"
print("Indexing: name[0] ->", name[0])
print("Slicing: name[1:4] ->", name[1:4])
print("Uppercase:", name.upper())
print(f"Formatting: Welcome to {name}!")`,
          output: "Indexing: name[0] -> P\nSlicing: name[1:4] -> yth\nUppercase: PYTHON\nFormatting: Welcome to Python!"
        }
      ]
    },
    {
      id: 5,
      name: "Phase 5: Collections",
      topics: [
        {
          id: 15,
          name: "Lists",
          desc: "Lists are ordered, mutable collection sequences that allow duplicate values. Use append(), pop(), sort(), etc.",
          code: `numbers = [30, 10, 20]
numbers.append(40)
numbers.sort()
print("List sorted:", numbers)
print("Popped item:", numbers.pop())
print("Modified List:", numbers)`,
          output: "List sorted: [10, 20, 30, 40]\nPopped item: 40\nModified List: [10, 20, 30]"
        },
        {
          id: 16,
          name: "Tuples",
          desc: "Tuples are ordered, immutable collection sequences. Once created, their elements cannot be modified or replaced.",
          code: `data = (10, 20, 30)
print("Tuple data:", data)
print("First item:", data[0])
# data[0] = 50 -> This would throw a TypeError`,
          output: "Tuple data: (10, 20, 30)\nFirst item: 10"
        },
        {
          id: 17,
          name: "Sets",
          desc: "Sets are unordered collections of unique elements. Useful for union() and intersection() mathematics.",
          code: `s1 = {1, 2, 3}
s2 = {3, 4, 5}
s1.add(6)

print("Union:", s1.union(s2))
print("Intersection:", s1.intersection(s2))`,
          output: "Union: {1, 2, 3, 4, 5, 6}\nIntersection: {3}"
        },
        {
          id: 18,
          name: "Dictionaries",
          desc: "Dictionaries store elements as key-value pairs. Fetch values using keys, get(), and update() fields.",
          code: `student = {"name": "Abhi", "age": 20}
student.update({"gpa": 3.9})

print("Keys:", list(student.keys()))
print("Values:", list(student.values()))
print("GPA fetched via get():", student.get("gpa"))`,
          output: "Keys: ['name', 'age', 'gpa']\nValues: ['Abhi', 20, 3.9]\nGPA fetched via get(): 3.9"
        }
      ]
    },
    {
      id: 6,
      name: "Phase 6: Functions",
      topics: [
        {
          id: 19,
          name: "Functions Basics",
          desc: "Create modular code blocks using the 'def' statement. Send data using parameters and fetch results with return.",
          code: `def greet(user):
    return f"Hello, {user}!"

print(greet("Abhi"))`,
          output: "Hello, Abhi!"
        },
        {
          id: 20,
          name: "Types of Functions",
          desc: "Explore argument passing methods, default values, lambda functions, and recursive function structures.",
          code: `# Lambda (anonymous) function
square = lambda x: x * x

# Recursive function
def factorial(n):
    return 1 if n == 1 else n * factorial(n - 1)

print("Lambda square(5) ->", square(5))
print("Recursive factorial(4) ->", factorial(4))`,
          output: "Lambda square(5) -> 25\nRecursive factorial(4) -> 24"
        }
      ]
    },
    {
      id: 7,
      name: "Phase 7: Modules",
      topics: [
        {
          id: 21,
          name: "Modules",
          desc: "Import external Python source files or built-in libraries (like math, random, datetime, os) to extend functions.",
          code: `import math
import random

print("Square root of 64:", math.sqrt(64))
# Pick a static random value from range
print("Random pick from range [1-10]:", random.randint(1, 10))`,
          output: "Square root of 64: 8.0\nRandom pick from range [1-10]: 7"
        },
        {
          id: 22,
          name: "Packages",
          desc: "Packages are namespaces containing multiple modules. Import specific tools using the 'from ... import ...' syntax.",
          code: `from math import pi, sin
print(f"Value of pi: {pi:.4f}")
print(f"sin(pi/2): {sin(pi/2)}")`,
          output: "Value of pi: 3.1416\nsin(pi/2): 1.0"
        }
      ]
    },
    {
      id: 8,
      name: "Phase 8: Exception Handling",
      topics: [
        {
          id: 23,
          name: "Errors & Exceptions",
          desc: "Handle runtime faults gracefully using try-except blocks. Prevent code from crashing and run cleanups with finally.",
          code: `try:
    result = 10 / 0
except ZeroDivisionError as err:
    print("Caught Exception:", err)
finally:
    print("Cleanup step executed.")`,
          output: "Caught Exception: division by zero\nCleanup step executed."
        }
      ]
    },
    {
      id: 9,
      name: "Phase 9: File Handling",
      topics: [
        {
          id: 24,
          name: "Reading Files",
          desc: "Open and read content of text documents in Python using built-in file open streams.",
          code: `# Simulating opening a file and reading lines
# file = open("data.txt", "r")
file_content = "Abhi, 20\\nSriram, 21\\n"
print("File content read:\\n" + file_content)`,
          output: "File content read:\nAbhi, 20\nSriram, 21\n"
        },
        {
          id: 25,
          name: "Writing Files",
          desc: "Write new strings or append data to existing logs using write Mode ('w') and append Mode ('a').",
          code: `# Simulating writing data to disk
# file = open("output.txt", "w")
# file.write("Writing new dataset.")
print("File write completed successfully: output.txt created.")`,
          output: "File write completed successfully: output.txt created."
        }
      ]
    },
    {
      id: 10,
      name: "Phase 10: OOP basics",
      topics: [
        {
          id: 26,
          name: "Class",
          desc: "Define custom classes in Python as blueprints. Classes hold definitions for attributes and methods.",
          code: `class Student:
    pass # Empty blueprint

print("Class created:", Student.__name__)`,
          output: "Class created: Student"
        },
        {
          id: 27,
          name: "Object",
          desc: "Instantiate concrete objects from classes. Objects represent individual instances of class models.",
          code: `class Student:
    pass

s1 = Student()
print("Object instantiated:", s1)`,
          output: "Object instantiated: <__main__.Student object>"
        },
        {
          id: 28,
          name: "Constructor",
          desc: "Use the constructor __init__() method to initialize object state attributes on instantiation.",
          code: `class Student:
    def __init__(self, name):
        self.name = name

s = Student("Abhi")
print("Student initialized name:", s.name)`,
          output: "Student initialized name: Abhi"
        },
        {
          id: 29,
          name: "Inheritance",
          desc: "Inherit attributes and methods from parent classes to child classes to encourage code reusability.",
          code: `class Parent:
    def greet(self):
        return "Greeting from parent"

class Child(Parent):
    pass

c = Child()
print("Inherited method output:", c.greet())`,
          output: "Inherited method output: Greeting from parent"
        },
        {
          id: 30,
          name: "Polymorphism",
          desc: "Use polymorphism to define methods with same signatures but different implementations across objects.",
          code: `class Dog:
    def speak(self): return "Woof!"
class Cat:
    def speak(self): return "Meow!"

animals = [Dog(), Cat()]
for animal in animals:
    print(animal.speak())`,
          output: "Woof!\nMeow!"
        },
        {
          id: 31,
          name: "Encapsulation",
          desc: "Restrict access to class members by adding double underscores prefix for private variables.",
          code: `class Account:
    def __init__(self, balance):
        self.__balance = balance # Private variable

acc = Account(1000)
# print(acc.__balance) -> Throws Attribute Error!
print("Private variable protected inside scope.")`,
          output: "Private variable protected inside scope."
        },
        {
          id: 32,
          name: "Abstraction",
          desc: "Hide complex details and only show essential features using abstract classes (abc module).",
          code: `from abc import ABC, abstractmethod
class Vehicle(ABC):
    @abstractmethod
    def start(self): pass

class Car(Vehicle):
    def start(self): return "Engine started."

print(Car().start())`,
          output: "Engine started."
        }
      ]
    },
    {
      id: 11,
      name: "Phase 11: Advanced Python",
      topics: [
        {
          id: 33,
          name: "List Comprehension",
          desc: "Generate lists concisely from range logic in a single line. Squares, conditional odds, etc.",
          code: `squares = [x*x for x in range(5)]
print("Squares of range(5):", squares)`,
          output: "Squares of range(5): [0, 1, 4, 9, 16]"
        },
        {
          id: 34,
          name: "Lambda Functions",
          desc: "Define single expression anonymous inline functions dynamically.",
          code: `double = lambda x: x * 2
print("Double value of 8 is:", double(8))`,
          output: "Double value of 8 is: 16"
        },
        {
          id: 35,
          name: "map() function",
          desc: "Apply mapping functions over all elements in iterables using the map() constructor.",
          code: `nums = [1, 2, 3]
doubled = list(map(lambda x: x*2, nums))
print("Doubled elements:", doubled)`,
          output: "Doubled elements: [2, 4, 6]"
        },
        {
          id: 36,
          name: "filter() function",
          desc: "Filter elements from iterables based on conditional logic using the filter() constructor.",
          code: `nums = [1, 2, 3, 4]
odds = list(filter(lambda x: x % 2 != 0, nums))
print("Odd elements:", odds)`,
          output: "Odd elements: [1, 3]"
        },
        {
          id: 37,
          name: "reduce() function",
          desc: "Accumulate elements iteratively to output a single value using functools.reduce().",
          code: `from functools import reduce
nums = [1, 2, 3, 4]
sum_all = reduce(lambda x, y: x + y, nums)
print("Accumulated sum of elements:", sum_all)`,
          output: "Accumulated sum of elements: 10"
        },
        {
          id: 38,
          name: "Generators",
          desc: "Yield elements sequentially on demand without loading everything in memory.",
          code: `def number_generator():
    yield 1
    yield 2

for val in number_generator():
    print("Yielded:", val)`,
          output: "Yielded: 1\nYielded: 2"
        },
        {
          id: 39,
          name: "Decorators",
          desc: "Extend base behavior of existing functions dynamically using wrappers.",
          code: `def decorator(func):
    def wrapper():
        print("Logged start.")
        func()
    return wrapper

@decorator
def say_hello(): print("Hello!")

say_hello()`,
          output: "Logged start.\nHello!"
        },
        {
          id: 40,
          name: "Iterators",
          desc: "Create custom iterators containing __iter__() and __next__() loops.",
          code: `items = [10, 20]
it = iter(items)
print(next(it))
print(next(it))`,
          output: "10\n20"
        }
      ]
    },
    {
      id: 12,
      name: "Phase 12: Data Structures",
      topics: [
        {
          id: 41,
          name: "Stack",
          desc: "Implement Last-In-First-Out (LIFO) stacks using lists (append & pop).",
          code: `stack = []
stack.append('A')
stack.append('B')
print("Stack state:", stack)
print("Popped:", stack.pop())`,
          output: "Stack state: ['A', 'B']\nPopped: B"
        },
        {
          id: 42,
          name: "Queue",
          desc: "Implement First-In-First-Out (FIFO) queues using collections.deque.",
          code: `from collections import deque
queue = deque(['A', 'B'])
queue.append('C')
print("Queue state:", list(queue))
print("Dequeued:", queue.popleft())`,
          output: "Queue state: ['A', 'B', 'C']\nDequeued: A"
        },
        {
          id: 43,
          name: "Linked List",
          desc: "Create dynamic linked list chains of nodes linked together via pointers.",
          code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

head = Node("A")
head.next = Node("B")
print(f"Chain: {head.data} -> {head.next.data}")`,
          output: "Chain: A -> B"
        },
        {
          id: 44,
          name: "Tree",
          desc: "Model hierarchical structures using nodes holding left and right children.",
          code: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

root = TreeNode("Root")
root.left = TreeNode("Left Child")
print(f"Root: {root.val}, Left: {root.left.val}")`,
          output: "Root: Root, Left: Left Child"
        },
        {
          id: 45,
          name: "Graph",
          desc: "Build relational vertex graphs mapped inside adjacency dict arrays.",
          code: `graph = {
    'A': ['B', 'C'],
    'B': ['A']
}
print("Vertices connected to A:", graph['A'])`,
          output: "Vertices connected to A: ['B', 'C']"
        },
        {
          id: 46,
          name: "Searching Algorithms",
          desc: "Perform searches: Linear Search (O(N)) and Binary Search (O(log N)).",
          code: `arr = [1, 3, 5, 7]
# Linear search for 5
found = [idx for idx, val in enumerate(arr) if val == 5]
print("Item 5 found at index:", found[0])`,
          output: "Item 5 found at index: 2"
        },
        {
          id: 47,
          name: "Sorting Algorithms",
          desc: "Understand sorting algorithms: Bubble, Selection, Insertion, Merge, Quick Sort.",
          code: `arr = [5, 2, 9, 1]
# Simulated QuickSort/BuiltinSort
arr.sort()
print("Sorted Array:", arr)`,
          output: "Sorted Array: [1, 2, 5, 9]"
        }
      ]
    },
    {
      id: 13,
      name: "Phase 13: Libraries",
      topics: [
        {
          id: 48,
          name: "NumPy",
          desc: "Process multidimensional arrays efficiently with high-speed matrix functions.",
          code: `# Importing NumPy (simulated array creation)
arr = [1, 2, 3, 4]
print("NumPy Array elements:", arr)
print("Array mean calculation: 2.5")`,
          output: "NumPy Array elements: [1, 2, 3, 4]\nArray mean calculation: 2.5"
        },
        {
          id: 49,
          name: "Pandas",
          desc: "Utilize DataFrames and Series structures to read and filter datasets.",
          code: `# Simulated Pandas DataFrame mapping
data = {"Name": ["Abhi", "Sriram"], "Score": [95, 90]}
print("DataFrame columns:", list(data.keys()))
print("Row 0 Name:", data["Name"][0])`,
          output: "DataFrame columns: ['Name', 'Score']\nRow 0 Name: Abhi"
        },
        {
          id: 50,
          name: "Matplotlib",
          desc: "Construct visual bar, line, scatter charts dynamically.",
          code: `print("Matplotlib canvas initialization completed.")
print("Line plot created: [1, 2, 3] vs [10, 20, 30].")`,
          output: "Matplotlib canvas initialization completed.\nLine plot created: [1, 2, 3] vs [10, 20, 30]."
        },
        {
          id: 51,
          name: "Seaborn",
          desc: "Create statistical charts with beautiful pre-configured theme colors.",
          code: `print("Seaborn statistical plot theme applied successfully.")
print("Heatmap generation triggered.")`,
          output: "Seaborn statistical plot theme applied successfully.\nHeatmap generation triggered."
        },
        {
          id: 52,
          name: "OpenCV",
          desc: "Perform computer vision image manipulations, filters, and detections.",
          code: `print("OpenCV cv2 engine initialized.")
print("Resizing image structure to 224x224 shape.")`,
          output: "OpenCV cv2 engine initialized.\nResizing image structure to 224x224 shape."
        }
      ]
    },
    {
      id: 14,
      name: "Phase 14: Databases",
      topics: [
        {
          id: 53,
          name: "SQLite",
          desc: "Connect and execute SQL queries inside local relational file databases.",
          code: `# SQLite connection simulation
print("Database connected: app.db")
print("Executing: CREATE TABLE users(name TEXT, age INT);")`,
          output: "Database connected: app.db\nExecuting: CREATE TABLE users(name TEXT, age INT);"
        },
        {
          id: 54,
          name: "MySQL",
          desc: "Connect MySQL servers, execute INSERT, SELECT, and UPDATE queries.",
          code: `# MySQL query execute simulation
print("Connected to MySQL Host: localhost")
print("Executing: SELECT * FROM students WHERE name='Abhi';")`,
          output: "Connected to MySQL Host: localhost\nExecuting: SELECT * FROM students WHERE name='Abhi';"
        }
      ]
    },
    {
      id: 15,
      name: "Phase 15: Web Development",
      topics: [
        {
          id: 55,
          name: "Flask",
          desc: "Develop lightweight web applications, template rendering, and APIs.",
          code: `# Flask server route simulation
print("Flask server running on http://127.0.0.1:5000/")
print("Routing match: @app.route('/') -> serves home.html")`,
          output: "Flask server running on http://127.0.0.1:5000/\nRouting match: @app.route('/') -> serves home.html"
        },
        {
          id: 56,
          name: "Django",
          desc: "Build secure MVT pattern web frameworks with databases and admin panels.",
          code: `# Django server start simulation
print("Django setting configuration loaded.")
print("Starting development server at http://127.0.0.1:8000/")`,
          output: "Django setting configuration loaded.\nStarting development server at http://127.0.0.1:8000/"
        }
      ]
    },
    {
      id: 16,
      name: "Phase 16: APIs",
      topics: [
        {
          id: 57,
          name: "REST API",
          desc: "Understand HTTP methods (GET, POST, PUT, DELETE) and endpoints mapping.",
          code: `# REST GET API simulation
print("GET /api/v1/students/Abhi status: 200 OK")
print("Response: {'id': 1, 'name': 'Abhi'}")`,
          output: "GET /api/v1/students/Abhi status: 200 OK\nResponse: {'id': 1, 'name': 'Abhi'}"
        },
        {
          id: 58,
          name: "JSON",
          desc: "Serialize and deserialize data payloads using json.dumps() and json.loads().",
          code: `import json
data_dict = {"name": "Abhi", "age": 20}
json_str = json.dumps(data_dict)
print("Serialized JSON String:", json_str)`,
          output: "Serialized JSON String: {\"name\": \"Abhi\", \"age\": 20}"
        },
        {
          id: 59,
          name: "Requests Module",
          desc: "Send network HTTP requests to fetch or submit data from third-party hosts.",
          code: `# requests.get("https://api.github.com/users/Abhi")
print("HTTP GET request initiated.")
print("Response Status Code: 200 OK")`,
          output: "HTTP GET request initiated.\nResponse Status Code: 200 OK"
        }
      ]
    },
    {
      id: 17,
      name: "Phase 17: Automation",
      topics: [
        {
          id: 60,
          name: "Selenium",
          desc: "Automate browser interactions, fill forms, and click elements programmatically.",
          code: `# driver = webdriver.Chrome()
print("WebDriver connection initialized.")
print("Navigating to: https://google.com")`,
          output: "WebDriver connection initialized.\nNavigating to: https://google.com"
        },
        {
          id: 61,
          name: "Web Scraping",
          desc: "Parse website HTML elements using BeautifulSoup and extract target details.",
          code: `# soup = BeautifulSoup(html_doc, 'html.parser')
print("BeautifulSoup parsing initialized.")
print("Found title element tag: <title>LearnLoop</title>")`,
          output: "BeautifulSoup parsing initialized.\nFound title element tag: <title>LearnLoop</title>"
        }
      ]
    },
    {
      id: 18,
      name: "Phase 18: Data Science",
      topics: [
        {
          id: 62,
          name: "NumPy & Pandas Dataframes",
          desc: "Manipulate and inspect tabular data structures inside Pandas DataFrames.",
          code: `print("Inspecting dataframe shape: (1000, 5)")
print("Columns: ['age', 'gpa', 'enrolled', 'scores', 'name']")`,
          output: "Inspecting dataframe shape: (1000, 5)\nColumns: ['age', 'gpa', 'enrolled', 'scores', 'name']"
        },
        {
          id: 63,
          name: "Data Cleaning",
          desc: "Handle missing null cells, drop duplicates, and align types in datasets.",
          code: `print("Checking null fields count: age: 0, scores: 12")
print("Executing: df['scores'].fillna(df['scores'].mean())")`,
          output: "Checking null fields count: age: 0, scores: 12\nExecuting: df['scores'].fillna(df['scores'].mean())"
        },
        {
          id: 64,
          name: "Data Visualization",
          desc: "Plot statistical datasets to find correlations and distributions.",
          code: `print("Plotting correlation matrix heatmap.")
print("Heatmap columns aligned: scores, age, gpa")`,
          output: "Plotting correlation matrix heatmap.\nHeatmap columns aligned: scores, age, gpa"
        }
      ]
    },
    {
      id: 19,
      name: "Phase 19: Machine Learning",
      topics: [
        {
          id: 65,
          name: "Scikit-Learn",
          desc: "Implement Linear Regression, Classification algorithms, and Clustering tasks.",
          code: `# model = LinearRegression()
# model.fit(X_train, y_train)
print("Scikit-Learn model training initiated.")
print("Training R^2 Score achieved: 0.925")`,
          output: "Scikit-Learn model training initiated.\nTraining R^2 Score achieved: 0.925"
        }
      ]
    },
    {
      id: 20,
      name: "Phase 20: AI & Deep Learning",
      topics: [
        {
          id: 66,
          name: "TensorFlow & Keras",
          desc: "Build and define neural network architecture layers to compile AI models.",
          code: `# model = keras.Sequential([keras.layers.Dense(128)])
print("TensorFlow model backend loaded.")
print("Compiling: optimizer='adam', loss='sparse_categorical_crossentropy'")`,
          output: "TensorFlow model backend loaded.\nCompiling: optimizer='adam', loss='sparse_categorical_crossentropy'"
        },
        {
          id: 67,
          name: "Neural Networks",
          desc: "Understand backpropagation, weights, activation functions, and layer structures.",
          code: `print("Initializing feedforward weights.")
print("Applying ReLU activation function on dense layers.")`,
          output: "Initializing feedforward weights.\nApplying ReLU activation function on dense layers."
        },
        {
          id: 68,
          name: "Deep Learning",
          desc: "Train deep models over multiple epochs, track loss convergence and validate accuracy.",
          code: `print("Epoch 1/5 - loss: 0.2452 - accuracy: 0.9125")
print("Epoch 5/5 - loss: 0.0415 - accuracy: 0.9852")
print("AI Model Training Completed successfully!")`,
          output: "Epoch 1/5 - loss: 0.2452 - accuracy: 0.9125\nEpoch 5/5 - loss: 0.0415 - accuracy: 0.9852\nAI Model Training Completed successfully!"
        }
      ]
    }
  ];

  // Helper to flatten topics for index checks
  const allTopics = phases.flatMap(p => p.topics);
  const currentTopic = allTopics.find(t => t.id === activeTopicId) || allTopics[0];

  const currentQuiz = getQuizForTopic(currentTopic.id);
  const currentExamChallenge = getExamChallengeForTopic(currentTopic.id);

  // Load progress from Firestore or LocalStorage on mount
  useEffect(() => {
    const loadProgress = async () => {
      const currentUser = auth.currentUser;
      let completedSet = new Set();
      let xp = 0;

      // 1. Try local storage first
      try {
        const localCompleted = localStorage.getItem('python_completed_topics');
        const localXP = localStorage.getItem('python_xp');
        if (localCompleted) {
          completedSet = new Set(JSON.parse(localCompleted));
        }
        if (localXP) {
          xp = parseInt(localXP);
        }
      } catch (e) {
        console.error("Failed to load local python progress:", e);
      }

      // 2. Try Firestore
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            const firestoreCompleted = data.pythonCompleted || [];
            const firestoreXP = data.pythonXP || 0;
            
            if (firestoreCompleted.length > completedSet.size) {
              completedSet = new Set(firestoreCompleted);
            }
            if (firestoreXP > xp) {
              xp = firestoreXP;
            }
          }
        } catch (err) {
          console.error("Firestore progress fetch failed:", err);
        }
      }

      setCompletedTopics(completedSet);
      setTotalXP(xp);

      // Focus first uncompleted topic
      const firstUncompleted = allTopics.find(t => !completedSet.has(t.id));
      if (firstUncompleted) {
        setActiveTopicId(firstUncompleted.id);
      } else {
        setActiveTopicId(1);
      }
    };

    loadProgress();
  }, []);

  const handleTopicSelect = (topicId) => {
    // If not freePlay, enforce sequence locks: topic is locked if its predecessor is not completed
    if (!freePlay && topicId > 1 && !completedTopics.has(topicId - 1)) {
      setShowLockModal(true);
      return;
    }
    setActiveTopicId(topicId);
    setIsRunning(false);
    setHasExecuted(false);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasExecuted(true);
    }, 800);
  };

  const handleSendToCodeLab = () => {
    localStorage.setItem('codeLabImportCode', currentTopic.code);
    localStorage.setItem('codeLabLanguage', 'python');
    navigate('/notebook');
  };

  // Launch Quiz Modal
  const handleStartQuiz = () => {
    if (!hasReadLesson && !completedTopics.has(currentTopic.id)) {
      alert("📚 Please read the topic details first and click the checkbox indicating you have understood the lesson!");
      return;
    }
    setQuizLives(3);
    setSelectedOption(null);
    setQuizFeedback("");
    setShowQuizModal(true);
  };

  // Submit Quiz Answer
  const handleCheckAnswer = async () => {
    if (!selectedOption) return;

    if (selectedOption === currentQuiz.correct) {
      setQuizFeedback("correct");
      
      // Perform save
      const isAlreadyCompleted = completedTopics.has(currentTopic.id);
      if (!isAlreadyCompleted) {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 2000);

        const newCompleted = new Set(completedTopics);
        newCompleted.add(currentTopic.id);
        setCompletedTopics(newCompleted);

        const newXP = totalXP + 100;
        setTotalXP(newXP);

        // Save to LocalStorage
        try {
          localStorage.setItem('python_completed_topics', JSON.stringify(Array.from(newCompleted)));
          localStorage.setItem('python_xp', newXP.toString());
        } catch(e) {}

        // Save to Firestore
        const currentUser = auth.currentUser;
        if (currentUser) {
          try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
              pythonCompleted: Array.from(newCompleted),
              pythonXP: newXP
            });
          } catch (err) {
            console.error("Failed to save progress to cloud:", err);
          }
        }
      }

      // Close modal and focus next level after delay
      setTimeout(() => {
        setShowQuizModal(false);
        if (currentTopic.id < allTopics.length) {
          setActiveTopicId(currentTopic.id + 1);
          setIsRunning(false);
          setHasExecuted(false);
        }
      }, 1500);

    } else {
      setQuizFeedback("incorrect");
      const nextLives = quizLives - 1;
      setQuizLives(nextLives);
      
      if (nextLives <= 0) {
        // Force the user to read the lesson again
        setHasReadLesson(false);
        setTimeout(() => {
          setShowQuizModal(false);
          alert("❌ Out of lives! Please read the tutorial again carefully to unlock the quiz.");
        }, 1500);
      }
    }
  };

  const getRank = (xp) => {
    const level = Math.floor(xp / 500) + 1;
    if (level >= 15) return { level, title: "AI Archmage", badge: Award };
    if (level >= 12) return { level, title: "Algorithm Master", badge: Trophy };
    if (level >= 8) return { level, title: "OOP Overlord", badge: Award };
    if (level >= 5) return { level, title: "Loop Lieutenant", badge: Sparkles };
    if (level >= 3) return { level, title: "Variable Voyager", badge: Compass };
    return { level, title: "Python Rookie", badge: Zap };
  };

  const currentRank = getRank(totalXP);
  const RankIcon = currentRank.badge;

  const currentTraceStep = currentExamChallenge.steps[traceStep];

  return (
    <div className="flex flex-col h-screen bg-[#f9fafb] font-sans">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900">Python Mastery Roadmap (Gamified Quest)</span>
        </div>

        {/* Free Play Toggle */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 py-1 px-3 rounded-xl shadow-inner text-xs font-bold text-gray-500 select-none">
          <span>Free Play (Unlock All)</span>
          <button 
            onClick={() => setFreePlay(!freePlay)} 
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${freePlay ? 'bg-indigo-500' : 'bg-gray-300'}`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 transform ${freePlay ? 'translate-x-4.5' : 'translate-x-0'}`} />
          </button>
        </div>
      </header>

      {/* Confetti Animation Effect Overlay */}
      <AnimatePresence>
        {confettiActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-transparent"
          >
            <div className="text-center bg-white/90 border border-indigo-150 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3 animate-bounce">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-black text-indigo-700 text-lg">Topic Completed!</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">+100 XP Level Up Points Awarded</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Game Map Timeline (68 topics) */}
        <aside className="w-96 border-r border-gray-250 bg-white flex flex-col shrink-0 select-none">
          
          {/* Rank Badge & XP Dashboard */}
          <div className="p-5 border-b border-gray-150 bg-slate-900 text-white space-y-3.5 relative overflow-hidden shrink-0">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center text-indigo-400">
                  <RankIcon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Current Level {currentRank.level}</h4>
                  <p className="text-sm font-black text-slate-100">{currentRank.title}</p>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Total XP</h4>
                <p className="text-base font-black text-indigo-400 font-mono">{totalXP.toLocaleString()} XP</p>
              </div>
            </div>

            {/* Total Completion Progress Bar */}
            <div className="space-y-1.5 relative z-10 text-left">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Course Completion Quest</span>
                <span>{completedTopics.size} / {allTopics.length} Topics ({Math.round((completedTopics.size / allTopics.length) * 100)}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${(completedTopics.size / allTopics.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Background Blur Sparkle */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Gamified Road Map Node List */}
          <nav className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/50">
            {phases.map((phase) => (
              <div key={phase.id} className="space-y-3.5 relative">
                
                {/* Phase Divider Header */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
                    {phase.name}
                  </span>
                </div>

                {/* Grid / Path representation of Topic levels */}
                <div className="grid grid-cols-4 gap-3">
                  {phase.topics.map((topic) => {
                    const isCompleted = completedTopics.has(topic.id);
                    const isActive = activeTopicId === topic.id;
                    
                    // Enforce lock if predecessor not finished (unless freePlay is active)
                    const isLocked = !freePlay && topic.id > 1 && !completedTopics.has(topic.id - 1);

                    return (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicSelect(topic.id)}
                        className={`aspect-square rounded-2xl border flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all shadow-sm ${
                          isCompleted
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-emerald-50'
                            : isActive
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-extrabold ring-4 ring-indigo-100 scale-105'
                            : isLocked
                            ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-60'
                            : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-700'
                        }`}
                        title={topic.name}
                      >
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </div>
                        ) : isLocked ? (
                          <Lock className="w-4.5 h-4.5 text-gray-400" />
                        ) : (
                          <span className="font-mono font-black text-sm">{topic.id}</span>
                        )}
                        <span className="text-[9px] font-black tracking-tight mt-1 truncate max-w-[65px] uppercase">
                          {isCompleted ? "Done" : isLocked ? "Locked" : `Lvl ${topic.id}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Right Side: Quest Details & Live Simulator */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-white">
          <div className="max-w-[850px] mx-auto space-y-6">
            
            {/* active quest study block */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="text-left space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 py-1 px-2.5 rounded-lg shadow-sm">
                    {phases.find(p => p.topics.some(t => t.id === currentTopic.id))?.name}
                  </span>
                  <span className="text-xs font-bold text-gray-400">Quest Level {currentTopic.id}</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-snug">{currentTopic.name}</h2>
                <p className="text-sm text-gray-500 leading-relaxed mt-2">{currentTopic.desc}</p>
                
                {/* Lesson read verification checkbox */}
                {!completedTopics.has(currentTopic.id) && (
                  <div className="flex items-center gap-2.5 pt-3 select-none">
                    <input 
                      type="checkbox" 
                      id="read_check"
                      checked={hasReadLesson}
                      onChange={(e) => setHasReadLesson(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="read_check" className="text-xs font-bold text-gray-600 cursor-pointer">
                      I have read and understood this lesson content
                    </label>
                  </div>
                )}
              </div>

              {/* Complete Topic Action Badge / Quiz Trigger */}
              <div className="shrink-0 flex flex-col items-center pt-2 sm:pt-0">
                {completedTopics.has(currentTopic.id) ? (
                  <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-wider shadow-sm select-none">
                    <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" /> Completed ✓
                  </div>
                ) : (
                  <button
                    onClick={handleStartQuiz}
                    disabled={!hasReadLesson}
                    className={`px-5 py-3 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 ${
                      hasReadLesson 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:brightness-95 active:scale-98' 
                        : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed'
                    }`}
                  >
                    <Trophy className={`w-3.5 h-3.5 ${hasReadLesson ? 'fill-white' : 'text-gray-400'}`} /> Take Unlock Quiz (+100 XP)
                  </button>
                )}
              </div>
            </div>

            {/* Classroom/Exam coding challenge visualizer */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> Classroom Exam Challenge
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Typical teacher exam questions & visual traces</p>
                </div>
                <button
                  onClick={() => {
                    setShowTrace(!showTrace);
                    setTraceStep(0);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className="w-4 h-4 text-indigo-500" /> {showTrace ? "Hide Visualizer" : "Show Visualizer"}
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm text-gray-900">{currentExamChallenge.title}</h4>
                <p className="text-xs text-gray-500 leading-normal">{currentExamChallenge.desc}</p>
              </div>

              {/* RENDER STEP-BY-STEP VISUAL TRACER IF OPEN */}
              {showTrace ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3 animate-in fade-in duration-300">
                  
                  {/* Left: Code Box with active line */}
                  <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between min-h-[220px]">
                    <div className="font-mono text-xs text-slate-350 space-y-1 select-none text-left">
                      {currentExamChallenge.code.map((lineText, idx) => {
                        const lineNum = idx + 1;
                        const isLineActive = currentTraceStep.line === lineNum;
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center w-full py-0.5 px-2 rounded transition-all ${
                              isLineActive ? 'bg-indigo-500/20 border-l-3 border-indigo-500 text-white font-bold' : ''
                            }`}
                          >
                            <span className="w-5 text-slate-600 text-right mr-3 font-semibold">{lineNum}</span>
                            <pre className="whitespace-pre">{lineText}</pre>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stepper buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800 shrink-0">
                      <button
                        onClick={() => traceStep > 0 && setTraceStep(traceStep - 1)}
                        disabled={traceStep === 0}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg disabled:opacity-40 transition-opacity cursor-pointer text-xs font-bold"
                      >
                        Prev Step
                      </button>
                      <button
                        onClick={() => traceStep < currentExamChallenge.steps.length - 1 && setTraceStep(traceStep + 1)}
                        disabled={traceStep === currentExamChallenge.steps.length - 1}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-40 transition-opacity cursor-pointer text-xs font-bold"
                      >
                        Next Step
                      </button>
                      <button
                        onClick={() => setTraceStep(0)}
                        className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer ml-auto"
                        title="Restart Trace"
                      >
                        <RotateCcw className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: State variables & Execution Logs */}
                  <div className="md:col-span-6 space-y-4">
                    {/* Variables watch */}
                    <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 text-left">
                      <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-indigo-500" /> Trace Variables
                      </h5>
                      <div className="divide-y divide-gray-150 font-mono text-xs">
                        {Object.keys(currentTraceStep.vars).length > 0 ? (
                          Object.entries(currentTraceStep.vars).map(([name, val], i) => (
                            <div key={i} className="flex justify-between py-1.5">
                              <span className="text-gray-500 font-semibold">{name}</span>
                              <span className="text-gray-900 font-bold">{JSON.stringify(val)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-gray-400 italic text-center">No active variables</div>
                        )}
                      </div>
                    </div>

                    {/* Console log */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Trace Console Log
                      </h5>
                      <div className="font-mono text-xs text-emerald-400 min-h-[40px] flex items-center">
                        <span>&gt; {currentTraceStep.log}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="border border-gray-150 rounded-2xl p-4 bg-slate-50/50 text-left font-mono text-xs overflow-x-auto select-all">
                  <pre>{currentExamChallenge.code.join("\n")}</pre>
                </div>
              )}
            </div>

            {/* Code Block & Output Sandbox */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* code playground box */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-400 font-mono">Interactive Python Code Box</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendToCodeLab}
                      className="px-3.5 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-750 hover:border-slate-650 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Code className="w-3.5 h-3.5 text-indigo-400" /> Send to Code Lab
                    </button>
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="px-4 py-1.5 text-xs font-bold text-white shadow-md rounded-xl transition-all cursor-pointer flex items-center gap-1.5 hover:brightness-95"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Play className="w-3 h-3 fill-white" /> Run Code
                    </button>
                  </div>
                </div>
                
                <div className="font-mono text-[13px] text-slate-300 space-y-1 relative z-10 select-text overflow-x-auto text-left">
                  <pre className="whitespace-pre">{currentTopic.code}</pre>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
              </div>

              {/* simulated output panel */}
              {(isRunning || hasExecuted) && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-3 text-left">
                    <Terminal className="w-4.5 h-4.5 text-emerald-400" /> Interactive Console Output
                  </h3>
                  <div className="font-mono text-xs text-emerald-400 min-h-[60px] flex flex-col justify-start pr-1 select-text text-left">
                    <div className="text-slate-500 mb-1.5">&gt; python example.py</div>
                    {isRunning ? (
                      <div className="text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
                        <span>Initializing sandbox and compiling...</span>
                      </div>
                    ) : (
                      <>
                        <pre className="text-white font-bold leading-relaxed whitespace-pre-wrap">{currentTopic.output}</pre>
                        <div className="text-emerald-500 font-extrabold mt-3">&gt; Process finished with exit code 0.</div>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>

      {/* Gamified Quiz Popup Modal (Duolingo Style) */}
      <AnimatePresence>
        {showQuizModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (quizFeedback !== "correct") {
                  setShowQuizModal(false);
                }
              }}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="bg-white border border-gray-250 rounded-[32px] p-7 shadow-2xl relative z-10 w-full max-w-lg space-y-6"
            >
              
              {/* Quiz Header: Level Info & Lives */}
              <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                <span className="text-xs font-black uppercase text-indigo-500 tracking-wider">
                  Level {currentTopic.id} Quest Unlock Quiz
                </span>
                
                {/* Lives Hearts */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-5 h-5 ${i < quizLives ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <div className="space-y-2 text-left">
                <h4 className="font-extrabold text-gray-800 text-base leading-relaxed">
                  {currentQuiz.question}
                </h4>
              </div>

              {/* Option List */}
              <div className="space-y-2 text-left">
                {currentQuiz.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={i}
                      disabled={quizFeedback === "correct"}
                      onClick={() => {
                        setSelectedOption(opt);
                        setQuizFeedback("");
                      }}
                      className={`w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/40 text-indigo-750 shadow-sm' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Feedback messages */}
              {quizFeedback === "correct" && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-bold rounded-2xl text-left flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Correct answer! +100 XP gained, loading next level...</span>
                </div>
              )}
              {quizFeedback === "incorrect" && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 text-xs font-bold rounded-2xl text-left flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                  <span>Wrong answer! Try again. Lives remaining: {quizLives}/3</span>
                </div>
              )}

              {/* Action button */}
              <div className="pt-2">
                <button
                  disabled={!selectedOption || quizFeedback === "correct"}
                  onClick={handleCheckAnswer}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    selectedOption && quizFeedback !== "correct"
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Lock Overlay Modal */}
      <AnimatePresence>
        {showLockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="bg-white border border-gray-250 rounded-[28px] p-6 shadow-2xl relative z-10 w-full max-w-sm text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-gray-900 text-lg">Quest Level Locked!</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Complete the previous topic along the road map to unlock this quest and progress further!
                </p>
              </div>
              <button
                onClick={() => setShowLockModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PythonTutorial;
