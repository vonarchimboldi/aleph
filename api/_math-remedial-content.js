export const COURSE_VERSION = "remediation-2026-10-29-v1";
export const course = [
  {
    "day": 1,
    "title": "Statements, definitions and legitimate operations",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "A mathematical statement asserts something that can be true or false once its variables and domain are fixed. “And” requires both statements; inclusive “or” requires at least one. Negation reverses truth. A definition lets you replace a term by its precise meaning: a divides b means b=ak for an integer k. Specify a≠0 when using ordinary divisibility here. An example can refute a universal claim; a few examples do not prove it. Read the notation card alongside each sentence. For example “for every integer n” fixes both a domain and a scope; “there exists an integer k” supplies a witness. A free variable is not yet a universal assertion until its scope is specified. Translate symbols back into words before manipulating them.",
        "workedExample": "Over the integers, “n is even and positive” means both 2 divides n and n>0. Its negation is “n is odd or n≤0.” The value n=0 satisfies the negation, because it is not positive.",
        "questions": [
          {
            "id": "REM01-F1",
            "prompt": "For integers n, translate (i) n is divisible by 3 and n>5; (ii) n is divisible by 3 or n>5. Give an integer satisfying only the second statement.",
            "minutes": 10
          },
          {
            "id": "REM01-F2",
            "prompt": "Let P mean x>0 and Q mean x²=4, for real x. At each x=−2, 0, 2, state whether P, Q, ¬P, P∧Q and P∨Q are true or false.",
            "minutes": 10
          },
          {
            "id": "REM01-F3",
            "prompt": "A learner claims: if a real number x has x²>1, then x>1. Decide the claim and justify your decision.",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "Compare a verbal rule with a direct numerical inequality. Track which operations preserve order and which reverse it.",
        "workedExample": "From −2x<6, division by −2 gives x>−3. The test value x=0 satisfies both forms; x=−4 satisfies neither.",
        "questions": [
          {
            "id": "REM01-R1",
            "prompt": "Without solving any equation, start with 2<5. Multiply by −3 and explain the resulting inequality. Then state the rule for an arbitrary negative multiplier.",
            "minutes": 5
          },
          {
            "id": "REM01-R2",
            "prompt": "Solve −4x+3≤15. Write the inequality after every operation, then check one included and one excluded value.",
            "minutes": 15
          },
          {
            "id": "REM01-R3",
            "prompt": "For real x, solve (x−2)/(x+1)>0. Explain why multiplying immediately by x+1 needs a case distinction.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM01-R1"
  },
  {
    "day": 2,
    "title": "Quantifiers, scope and negation",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "“For every x” must survive every allowed choice; “there exists x” needs a witness. The order matters: in ∀x∃y, y may depend on x; in ∃y∀x one y must work for all x. Negation changes every quantifier and negates the inner predicate while keeping the domains. In ∀x∈R∃y∈R(x+y=0), read: “For each real x, I may choose a real y depending on that x.” The negation keeps the same real-number domains and asserts a particular x defeats every possible y. Never change the domain while negating.",
        "workedExample": "Over integers, the negation of ∀n∃m (m>n) is ∃n∀m (m≤n). The original is true, using m=n+1. Its negation asserts a largest integer and is false.",
        "questions": [
          {
            "id": "REM02-F1",
            "prompt": "Negate “Every student solved at least one question.” Keep the same student and question domains. Give a scenario making the original false.",
            "minutes": 10
          },
          {
            "id": "REM02-F2",
            "prompt": "Over real numbers compare ∀x∃y (x+y=0) and ∃y∀x (x+y=0). Justify each truth value.",
            "minutes": 10
          },
          {
            "id": "REM02-F3",
            "prompt": "Negate ∃a∈R ∀x∈R (x²≥a), and decide whether the original statement is true.",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "Negate the quantifier skeleton and the complete predicate. Keep the domains unchanged and read the result aloud.",
        "workedExample": "“Every real x has a real y with y²>x” negates to “There is a real x such that every real y has y²≤x.” The original is true; choosing y=|x|+1 suffices.",
        "questions": [
          {
            "id": "REM02-R1",
            "prompt": "Negate ∀n∈Z∃m∈Z (m≥n+2). Do not decide truth until you have written the entire negation.",
            "minutes": 5
          },
          {
            "id": "REM02-R2",
            "prompt": "Negate “There exists a real a such that every real x satisfies x>a.” Then decide the original statement.",
            "minutes": 15
          },
          {
            "id": "REM02-R3",
            "prompt": "Negate ∀x∈R∃y∈R (y²=x). Decide the original and show a witness for its negation.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM02-R1"
  },
  {
    "day": 3,
    "title": "Implications, equivalence and proof repair",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "An implication P⇒Q is not generally equivalent to Q⇒P. It is equivalent to its contrapositive ¬Q⇒¬P. To prove P⇔Q, prove both directions. An example establishes an existential claim but does not establish a universal one.",
        "workedExample": "If 8 divides n then 4 divides n: n=8k=4(2k). The converse fails at n=4. This combines a proof in one direction with a counterexample in the other.",
        "questions": [
          {
            "id": "REM03-F1",
            "prompt": "For integers n, assess “3|n implies 9|n” and its converse. Give a proof or counterexample for each.",
            "minutes": 10
          },
          {
            "id": "REM03-F2",
            "prompt": "Write the converse and contrapositive of “If a real x is greater than 2 then x²>4.” Which statements are true?",
            "minutes": 10
          },
          {
            "id": "REM03-F3",
            "prompt": "Prove for integers n that n is odd if and only if n² is odd. State where each implication is established.",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "Use definitions to separate a claim from its converse and contrapositive; repair the direction actually requested.",
        "workedExample": "To show n² even⇒n even, suppose n is odd: n=2k+1 gives n²=2(2k²+2k)+1, odd. This proves the contrapositive. It does not assume what we are trying to prove.",
        "questions": [
          {
            "id": "REM03-R1",
            "prompt": "Without notes, solve −5x+4>19 and explain why the inequality direction changes. Then state the negative-multiplication rule in words.",
            "minutes": 5
          },
          {
            "id": "REM03-R2",
            "prompt": "Prove: if n² is divisible by 3, then n is divisible by 3. Use the possible remainders of n on division by 3.",
            "minutes": 15
          },
          {
            "id": "REM03-R3",
            "prompt": "A claim says: if ab is even, then both a and b are even. Decide it for integers, and formulate a true conclusion.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM03-R1"
  },
  {
    "day": 4,
    "title": "Algebraic identities and arithmetic sums",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "Expansion and factorization are two views of the same equality. Use (a+b)²=a²+2ab+b² and a²−b²=(a−b)(a+b) with their conditions. In an arithmetic progression the nth term is a+(n−1)d. Pairing first and last terms gives S=n(first+last)/2.",
        "workedExample": "For 4+7+…+31 there are (31−4)/3+1=10 terms. Pairing endpoints gives sum 10(4+31)/2=175.",
        "questions": [
          {
            "id": "REM04-F1",
            "prompt": "If real x≠0 satisfies x+1/x=5, find x²+1/x² and explain the cross-term.",
            "minutes": 10
          },
          {
            "id": "REM04-F2",
            "prompt": "Derive the sum of the first n terms of an arithmetic progression by writing it forward and backward. Apply it to 6+10+…+54.",
            "minutes": 10
          },
          {
            "id": "REM04-F3",
            "prompt": "Prove (a+b)²−4ab=(a−b)². What follows about the largest possible ab if a+b=12 for real a,b?",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "A row index counts positions; increments count transitions. Derive endpoints before summing.",
        "workedExample": "A staircase has 8 rows, first row 7 stones, increasing by 3 each time. Last row=7+7·3=28; total=8(7+28)/2=140.",
        "questions": [
          {
            "id": "REM04-R1",
            "prompt": "Without notes, negate ∀x∈R∃y∈R(x+y<0). Read your answer aloud, keeping the domains unchanged.",
            "minutes": 5
          },
          {
            "id": "REM04-R2",
            "prompt": "A hall has 15 rows, beginning with 10 seats and gaining 4 seats per row. Find the last row and total. Check by a second representation.",
            "minutes": 15
          },
          {
            "id": "REM04-R3",
            "prompt": "An AP has nth term 5n−2 for n≥1. Find its first term, common difference and sum of its first 12 terms.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM04-R1"
  },
  {
    "day": 5,
    "title": "Geometric and arithmetic–geometric series",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "For G=1+r+…+r^(n−1), subtract rG to obtain (1−r)G=1−r^n. Divide only for r≠1; if r=1, G=n. For a weighted sum T=Σkr^k, shifting and subtracting reduces the weights. An infinite geometric limit requires |r|<1.",
        "workedExample": "If T=2+2·2²+3·2³, then T=34 and 2T=4+2·2³+3·2⁴. Subtraction gives −T=2+4+8−3·16=−34. The uncancelled boundary term matters.",
        "questions": [
          {
            "id": "REM05-F1",
            "prompt": "Derive the finite geometric sum for 1+r+…+r^(n−1), including r=1, and calculate 1+3+…+3⁴.",
            "minutes": 10
          },
          {
            "id": "REM05-F2",
            "prompt": "Find Σ k·3^k for k=1,…,4 by multiplying and subtracting. Explain the endpoint terms.",
            "minutes": 10
          },
          {
            "id": "REM05-F3",
            "prompt": "For which real r does 1+r+r²+… have a finite sum? Explain what fails at r=1 and r=−1.",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "A repeating decimal and a convergent geometric series can describe the same number. Align the repeating tail before subtracting.",
        "workedExample": "For x=0.454545…, multiplication gives 100x=45.454545…, so 99x=45 and x=5/11. The repeating tail cancels; the same number is a convergent geometric series.",
        "questions": [
          {
            "id": "REM05-R1",
            "prompt": "For integer n, prove or disprove: if 5n+2 is odd, then n is odd. Explain which implication direction you establish.",
            "minutes": 5
          },
          {
            "id": "REM05-R2",
            "prompt": "Express 0.125125125… as an infinite geometric series and find its fraction in lowest terms.",
            "minutes": 15
          },
          {
            "id": "REM05-R3",
            "prompt": "Convert 0.166666… to a fraction. Explain why treating “16” as a repeating block would describe a different number.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM05-R1"
  },
  {
    "day": 6,
    "title": "Differences and telescoping",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "The first difference is a_(k+1)−a_k; the second difference is the difference of successive first differences. Telescoping reverses differencing: summing b_(k+1)−b_k leaves b_(n+1)−b_1. A few observations suggest a pattern but do not prove an infinite sequence rule.",
        "workedExample": "For a_k=k², the first difference is 2k+1 and the second difference is 2. Summing (k+1)²−k² from k=1 to n leaves (n+1)²−1.",
        "questions": [
          {
            "id": "REM06-F1",
            "prompt": "For a_n=3n²+2n+1, find its first and second differences and justify them algebraically for all n≥1.",
            "minutes": 10
          },
          {
            "id": "REM06-F2",
            "prompt": "Find Σ 1/[k(k+2)] for k=1,…,8 by expressing each term as a difference.",
            "minutes": 10
          },
          {
            "id": "REM06-F3",
            "prompt": "A sequence begins 1,4,9,16. Does this prove the next term is 25? Give two formula-defined sequences matching those four terms but differing at n=5.",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "Remainders form finite states. Construct a cycle, justify its repetition and handle full-cycle exponents carefully.",
        "workedExample": "The last digits of 3^1,3²,3³,3⁴ are 3,9,7,1, after which multiplying by 3 repeats the cycle. A multiple-of-four exponent picks the final position, not an imaginary position zero.",
        "questions": [
          {
            "id": "REM06-R1",
            "prompt": "Without notes, a hall has 12 rows, beginning with 8 seats and gaining 3 seats per row. Find the last row and total; identify the number of increases.",
            "minutes": 5
          },
          {
            "id": "REM06-R2",
            "prompt": "Find the last digit of 7^2031. Explain which position corresponds to exponent remainder zero.",
            "minutes": 15
          },
          {
            "id": "REM06-R3",
            "prompt": "Find the remainder of 2^23 on division by 7, then check a changed exponent 2^24.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM06-R1"
  },
  {
    "day": 7,
    "title": "Power sums and discrete identities",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "Known sums can be derived by summing consecutive differences. Expanding (k+1)³−k³ gives 3k²+3k+1; summing links Σk² to the already known Σk. Index ranges and boundary terms must be kept consistent.",
        "workedExample": "Using k=0,…,n, Σ[(k+1)³−k³]=(n+1)³=3Σk²+3Σk+(n+1). Substituting Σk=n(n+1)/2 yields Σk²=n(n+1)(2n+1)/6.",
        "questions": [
          {
            "id": "REM07-F1",
            "prompt": "Derive Σk=n(n+1)/2 by pairing. Then derive Σk² using the consecutive-cube identity, with your summation limits stated.",
            "minutes": 10
          },
          {
            "id": "REM07-F2",
            "prompt": "Let A_k=k(k+1)/2 and A_0=0. Prove A_k²−A_(k−1)²=k³ and hence derive the sum of cubes.",
            "minutes": 10
          },
          {
            "id": "REM07-F3",
            "prompt": "Find Σ k(k+2), k=1,…,8, in two ways or with an independent small-case check.",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "Choose function inputs that produce enough equations among the same unknown values. Do not assume a global formula that has not been justified.",
        "workedExample": "If f(x)+3f(1−x)=2x for every real x, putting x=0 and x=1 gives A+3B=0 and B+3A=2. Thus A=3/4 and B=−1/4. We used only two necessary instances of the given identity.",
        "questions": [
          {
            "id": "REM07-R1",
            "prompt": "Without notes, write 0.484848… as a fraction in lowest terms and show how the repeated tails cancel.",
            "minutes": 5
          },
          {
            "id": "REM07-R2",
            "prompt": "For every real x, h(x)+2h(2−x)=3x. Find h(0) and h(2) by writing two equations.",
            "minutes": 15
          },
          {
            "id": "REM07-R3",
            "prompt": "If f is additive on R and f(1)=5, explain why f(2/3)=10/3. Does your argument determine f(x) for every irrational x without further assumptions?",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM07-R1"
  },
  {
    "day": 8,
    "title": "Digits, divisibility and large remainders",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "A positive integer N has d decimal digits exactly when 10^(d−1)≤N<10^d; equivalently d=floor(log10 N)+1. Zero has one digit and is a separate case. Last digits use modulo 10 or 100. Fermat: if p is prime and p does not divide a, then a^(p−1)≡1 mod p. Composite moduli require another valid argument. Decimal checks: divisibility by2,5,10 depends on the last digit; by4 and8 on the last two and three digits respectively because100 is divisible by4 and1000 by8. For3 and9 use the digit sum because10≡1; for11 use the alternating sum because10≡−1. These statements follow from place value, not an unrelated list of tricks.",
        "workedExample": "For 2^100 modulo 7, 2³≡1 mod7 so 2^100≡2. Alternatively Fermat gives period divisor six. Modulo 100, one cannot simply use exponent 99 because 100 is not prime.",
        "questions": [
          {
            "id": "REM08-F1",
            "prompt": "Find the number of digits of10^40−1,10^40 and10^40+1. Explain the boundaries. How many decimal digits does0 have, and why should you not substitute it into log10 N?",
            "minutes": 10
          },
          {
            "id": "REM08-F2",
            "prompt": "Find the remainder of 5^100 on division by 7 using Fermat, stating its hypotheses.",
            "minutes": 10
          },
          {
            "id": "REM08-F3",
            "prompt": "Find the last two digits of 7^100, showing a short repeated-squaring or cycle argument. Why is Fermat with modulus 100 not justified?",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "Place value explains divisibility tests. Derive the digit rule, then choose it for the number at hand.",
        "workedExample": "Because 10≡−1 mod11, 10²≡1, 10³≡−1, and so on. A decimal integer has the same remainder modulo 11 as its alternating digit sum, taken from the units place. An alternating sum may be zero or negative and still be divisible by 11.",
        "questions": [
          {
            "id": "REM08-R1",
            "prompt": "Without notes, find the last digit of 7^2034 and the remainder of 2^17 on division by7. Explain the position of each exponent in its cycle.",
            "minutes": 5
          },
          {
            "id": "REM08-R2",
            "prompt": "Derive the divisibility-by-11 criterion from decimal place value and apply it to2728. Then decide: is1008 divisible by4 and by8; is135 divisible by3,5,9 and10? Give the relevant digit-based reason each time.",
            "minutes": 15
          },
          {
            "id": "REM08-R3",
            "prompt": "Find the last digit of 7^2032 and the remainder of 3^10 modulo 7. Explain the cycle endpoints.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM08-R1"
  },
  {
    "day": 9,
    "title": "Roots, symmetry and carefully defined nested expressions",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "A quadratic can be described by coefficients, roots or a repeated expression. For a quadratic ax²+bx+c with a≠0 and roots r,s (counted with multiplicity), a(x−r)(x−s)=ax²−a(r+s)x+ars, so r+s=−b/a and rs=c/a. For an integer-coefficient polynomial with nonzero constant term, a rational root p/q written in lowest terms, q>0, must have p dividing the constant and q dividing the leading coefficient. This provides candidates, not guaranteed roots. If a substitution creates a quadratic, record which values the substituted quantity can actually take. Infinite towers need a sequence of finite truncations and convergence before a candidate fixed point becomes a valid limit.",
        "workedExample": "For2x²−5x+2=0, the rational-root candidates are±1,±2,±1/2. Vieta requires root sum5/2 and product1; the roots2 and1/2 meet both, and (2x−1)(x−2) confirms them. For nested radicals define u_0=0, u_(n+1)=sqrt(2+u_n). This particular sequence increases and stays in[0,2], so it converges; continuity gives L²=L+2 and nonnegativity selects L=2. By contrast z_0=0,z_(n+1)=2−z_n alternates0,2 even though the fixed-point equation has solution1: an equation alone does not prove convergence. Full induction/convergence justification is in the tutor extension, not extra required learner work.",
        "questions": [
          {
            "id": "REM09-F1",
            "prompt": "For3x²−7x+2=0, list the rational-root candidates in lowest terms. Find the roots and verify their sum/product from the coefficients. Explain briefly how expanding3(x−r)(x−s) gives Vieta’s formulas.",
            "minutes": 10
          },
          {
            "id": "REM09-F2",
            "prompt": "For real nonzero x, solve x²−3x+4−3/x+1/x²=0 by exploiting symmetry under x↦1/x.",
            "minutes": 10
          },
          {
            "id": "REM09-F3",
            "prompt": "Define u_0=0,u_(n+1)=sqrt(6+u_n). Write u_1 and u_2. Assume for this question that u_n converges to a finite real limit; find that limit. Separately, assuming v_(n+1)=2+1/v_n has a finite positive limit, find its only possible value. Does either fixed-point calculation alone prove convergence?",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "A repeated expression can turn an unfamiliar equation into a familiar polynomial. Preserve the range of the substitution and use polynomial division to understand remainders.",
        "workedExample": "For 4^x−6·2^x+8=0, put u=2^x>0 to obtain (u−2)(u−4)=0. Thus x=1 or 2. A root of the polynomial in u must also be an allowed value of 2^x.",
        "questions": [
          {
            "id": "REM09-R1",
            "prompt": "Without notes, a real function satisfies h(x)+2h(3−x)=x for all real x. Find h(0) and h(3), showing your two chosen substitutions.",
            "minutes": 5
          },
          {
            "id": "REM09-R2",
            "prompt": "(a) Solve4^x−9·2^x+8=0 over R, recording the range of your substitution. (b) State the remainder theorem and use it to decide whetherx−1 dividesP(x)=x³−4x+3.",
            "minutes": 15
          },
          {
            "id": "REM09-R3",
            "prompt": "A real nonzero x satisfies x+1/x=3. Derive x²+1/x² and x³+1/x³ without first solving for x.",
            "minutes": 10
          }
        ]
      }
    },
    "retrievalId": "REM09-R1"
  },
  {
    "day": 10,
    "title": "Functions, relations and precise correspondence",
    "minutes": 90,
    "glossary": [
      [
        "R",
        "real numbers"
      ],
      [
        "Z",
        "integers"
      ],
      [
        "∈",
        "is an element of"
      ],
      [
        "∀x∈D",
        "for every x in the stated domain D"
      ],
      [
        "∃x∈D",
        "there is at least one x in D"
      ],
      [
        "P∧Q",
        "P and Q: both hold"
      ],
      [
        "P∨Q",
        "inclusive or: at least one holds"
      ],
      [
        "¬P",
        "not P"
      ],
      [
        "P⇒Q",
        "if P holds, Q must hold"
      ],
      [
        "P⇔Q",
        "P and Q hold in exactly the same cases; establish both directions"
      ],
      [
        "a|b",
        "a divides b: b=ak for an integer k; our divisor a is nonzero"
      ],
      [
        "Σ from k=1 to n",
        "add the term for each integer k=1,…,n"
      ],
      [
        "a≡b (mod m)",
        "m divides a−b, where m is a positive integer"
      ],
      [
        "floor(t), ceil(t)",
        "greatest integer ≤t; least integer ≥t"
      ],
      [
        "f:D→C",
        "a function with domain D and codomain C"
      ]
    ],
    "blocks": {
      "foundations": {
        "explanation": "A function specifies domain, codomain and one output per input. Injective means equal outputs force equal inputs; surjective means every codomain element is reached; bijective means both. A relation on a set may be reflexive, symmetric or transitive; these are not synonyms for function properties. To count by a correspondence, establish a bijection, not just a map.",
        "workedExample": "f:R→R, f(x)=x² is neither injective nor surjective. Restricting its domain to [0,∞) makes it injective; also setting the codomain to [0,∞) makes it bijective. On integers, “same parity” is reflexive, symmetric and transitive.",
        "questions": [
          {
            "id": "REM10-F1",
            "prompt": "Classify f:Z→Z, f(n)=2n as injective/surjective/bijective. Then change only its codomain to the even integers and classify again.",
            "minutes": 10
          },
          {
            "id": "REM10-F2",
            "prompt": "On Z, classify the relations aRb iff a≤b, and aSb iff |a−b|≤1, for reflexivity, symmetry and transitivity. Give a counterexample for each failed property.",
            "minutes": 10
          },
          {
            "id": "REM10-F3",
            "prompt": "Show that subsets of size 2 of {1,2,3,4,5,6} correspond bijectively to six-letter R/U strings containing exactly two U symbols. Define the map and its inverse, then count.",
            "minutes": 8
          }
        ]
      },
      "repair": {
        "explanation": "Keep intermediate function values separate. A map alone does not prove equal cardinalities; establish a bijection. For occupancy bounds, use integer counts.",
        "workedExample": "For f(x)=x²+2 and g(x)=3x−1, f(g(1))=f(2)=6, while g(f(1))=g(3)=8. Separate the inner evaluations. For 17 objects in 5 boxes, if all boxes had at most 3 objects there would be at most 15; therefore some box has at least 4.",
        "questions": [
          {
            "id": "REM10-R1",
            "prompt": "Without notes, decide whether5830 is divisible by11 and explain the criterion using decimal place value.",
            "minutes": 5
          },
          {
            "id": "REM10-R2",
            "prompt": "Let f(x)=x²+2 and g(x)=2x−1. Evaluate f(g(3)) and g(f(3)), showing each inner value separately. If this is sound, use the remaining guided window to evaluate the same two compositions at x=−1 without copying an intermediate value from the first calculation.",
            "minutes": 15
          },
          {
            "id": "REM10-R3",
            "prompt": "Without looking at Day9, solve9^x−10·3^x+9=0 over R. State your substitution range.",
            "minutes": 5
          },
          {
            "id": "REM10-R4",
            "prompt": "For positive integers N,k, complete this argument: if every box contains at most ceil(N/k)−1 objects, the total is at most____, which is____N. Conclude the guaranteed largest occupancy and apply it to23 objects in6 boxes.",
            "minutes": 5
          }
        ]
      }
    },
    "retrievalId": "REM10-R1"
  }
];
