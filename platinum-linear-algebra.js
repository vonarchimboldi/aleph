// October–November 2026. Berkeley video companions in Weeks 1–8.
// Original physical problems; Bamberg & Sternberg is a teaching reference.
function platinumLinearAlgebraCurriculum() {
  return {
  "id": "priyanka-linear-algebra",
  "taskPrefix": "la",
  "startDate": "2026-10-01",
  "assumptions": "October 1–November 30, 2026. Study weeks run Thursday–Wednesday from October 1; the final block is November 26–30. The reading map uses M&M (2018) and H&H (5th edition), pending confirmation of your copies. Study hours and textbook exercise numbers are still to be selected. Selected Berkeley Math 54 videos accompany Weeks 1–8; Week 9 is consolidation. Watch before the numerical experiment and include the viewing checkpoint with practice.",
  "pacing": "M&M: Chapters 1–6 at one chapter per week, October 1–November 11, followed by consolidation. H&H: Chapter 1 completed by October 31; Chapter 2 completed by November 30. No later H&H chapters are assigned.",
  "exercisePolicy": "Keep six M&M exercises per chapter (two computations, two proofs or counterexamples, two mixed applications) and three H&H exercises per weekly block. Record exercise numbers from your edition. Complete the two original physical problems and the numerical experiment below. Submit a labelled sketch, governing equations, hand calculation, a parameter sweep or plot, and an explanation of agreement or disagreement. A spreadsheet or a short program is sufficient; numerical agreement supports a conjecture but does not prove it.",
  "feedbackPolicy": "Review the model before the algebra: are the variables, units, sign conventions, and assumptions correct? Then assess geometric prediction, derivation, numerical checks, and physical interpretation. Submit practice and review separately. Attempt reviews without notes, record confidence, and reattempt a missed question after 48 hours and in the next week. Ask whether the learner can predict a changed parameter or a limiting case. Record one repair problem and one transfer problem; the learner or course designer selects the next assignment from that evidence.",
  "sources": [
    {
      "title": "M&M publisher contents (2018)",
      "url": "https://www.cambridge.org/highereducation/books/linear-algebra/2914578A070EC0AD761C80E9B70F3897/contents/191B86A029AF9ECFA8D6FDA39C5F7516"
    },
    {
      "title": "H&H fifth-edition contents",
      "url": "https://matrixeditions.com/VC5.contents.pdf"
    },
    {
      "title": "Bamberg & Sternberg, Volume 1 — teaching reference",
      "url": "https://www.cambridge.org/core/books/abs/course-in-mathematics-for-students-of-physics/contents/8C3DB8FAECD296277BF7745B20F426FF"
    },
    {
      "title": "Alexander Paulin · Berkeley Math 54 (Spring 2022) · video source",
      "url": "https://math.berkeley.edu/~apaulin/54%20(Spring%202022).html"
    },
    {
      "title": "Gamma Digamma · Linear Algebra playlist · optional explanations",
      "url": "https://www.youtube.com/playlist?list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc"
    }
  ],
  "weeks": [
    {
      "week": 1,
      "mmChapter": 1,
      "title": "Forces, actuators, and reachable motions",
      "mm": "M&M Chapter 1: systems and vector spaces (complete chapter).",
      "hh": "H&H Chapter 1, §§1.1, 1.2, 1.3 (2026-10-01 to 2026-10-07): Points, vectors, matrices, and matrix action; include §1.0 orientation.",
      "goals": "Translate between equations, column combinations, and geometry; distinguish a vector space from an affine solution set. Check set/function and proof notation from the appendices or H&H Chapter 0 only as needed.",
      "bridge": "The columns of a matrix are the effects of individual controls. Its image describes reachable forces; its kernel describes changes of control that leave the net force unchanged. Physical restrictions on controls can make the feasible set smaller than a vector space.",
      "resources": [
        {
          "title": "Solving systems",
          "url": "https://www.youtube.com/watch?v=yv6TvdjOf38",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Vector spaces and maps",
          "url": "https://www.youtube.com/watch?v=dJ26m1ls9Hk",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Span, independence and dimension",
          "url": "https://www.youtube.com/watch?v=1BxkOPPnlrE",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. Derive A for the three actuators above. Find every control u producing (2,1) N. Draw the vector addition for three choices. Which choices remain possible if each uᵢ must be nonnegative? Explain the difference between algebraic reachability and actuator feasibility.",
        "P2. Suppose the vertical actuator breaks, leaving forces (u₁,0) and (u₃,u₃). Can you still produce (0,1) N with reversible actuators? With nonnegative controls? Now redirect the diagonal actuator to the horizontal: describe the change in rank and reachable forces."
      ],
      "review": [
        "R1. Two reversible actuators both act along the x-axis. Characterize every reachable force and every control change with zero net effect. Predict whether adding a third horizontal actuator restores vertical control.",
        "R2. A 2 kg puck accelerates at (1,0.5) m/s² with no other horizontal forces. Use the original three-actuator model to find two control vectors that produce that acceleration. Explain why the acceleration does not identify the individual controls."
      ],
      "skills": [
        "linear-systems",
        "span",
        "subspace-test",
        "affine-solution-set"
      ],
      "repair": "If image and kernel are confused, distinguish changing the requested force from changing controls while holding the force fixed. Retry with one actuator direction changed.",
      "legacyPractice": [
        "P1. Solve x + 2y = 3 and 2x + 4y = 6. Draw the solution set and express it as one solution plus the solutions of the homogeneous system. Then replace 6 by 7 and explain the geometric change.",
        "P2. Let u = (1, 2) and v = (2, 4). Which of b = (3, 6) and c = (3, 5) can be written as αu + βv? Explain your answer with a sketch and equations."
      ],
      "legacyReview": [
        "R1. Is S = {(x,y): x + y = 1} a vector subspace? Give a decisive test, then describe the parallel subspace and how S is obtained from it.",
        "R2. For A = [[1,1],[2,2]], characterize every right-hand side for which Ax = b is solvable and explain why any such system has more than one solution."
      ],
      "physicalModel": "A puck on a frictionless horizontal table has three ideal reversible actuators. Their forces are (u₁,0), (0,u₂), and (u₃,u₃) newtons. The controls uᵢ are signed force components, not all force magnitudes. Static force balance and commanded acceleration both reduce to a linear map. Nonnegative control restrictions, if imposed, are additional physical constraints.",
      "experiment": "Sweep u₃ from −2 to 3 in steps of 0.25, setting u₁=2−u₃ and u₂=1−u₃. Plot the three controls and the net force. Verify the residual A u − (2,1) stays zero; highlight the nonnegative feasible interval. Repeat after the actuator failure. Predict each plot first.",
      "startDate": "2026-10-01",
      "endDate": "2026-10-07",
      "monthLabel": "October",
      "hhBlocks": [
        {
          "chapter": 1,
          "sections": [
            "1.1",
            "1.2",
            "1.3"
          ],
          "startDate": "2026-10-01",
          "endDate": "2026-10-07",
          "focus": "Points, vectors, matrices, and matrix action; include §1.0 orientation."
        }
      ],
      "mmDue": "2026-10-03",
      "experimentDue": "2026-10-05",
      "practiceDue": "2026-10-06",
      "reviewDue": "2026-10-07",
      "repairDue": "2026-10-09",
      "videoDue": "2026-10-04",
      "videoCheckpoint": "For the actuator matrix, explain which forces are reachable and why multiple controls can give the same force. Row-reduce one example and sketch its solution set.",
      "modelLesson": {
        "question": "How can several controls produce one requested force?",
        "setup": "Imagine a puck with three independently adjustable thrusters. The first pushes horizontally, the second vertically, and the third diagonally. Choose right and up as positive. A negative control means the ideal thruster can reverse its direction. The physical question is whether we can command a desired acceleration, and whether the command is unique.",
        "quantities": [
          [
            "u = (u₁,u₂,u₃)",
            "Three signed actuator settings, measured in newtons of force component."
          ],
          [
            "b = (bₓ,bᵧ)",
            "The required net force in newtons; for a mass m and desired acceleration a, b = ma."
          ],
          [
            "A",
            "A 2×3 map from actuator settings to net force. Each column records one actuator’s response to a unit setting."
          ]
        ],
        "derivation": "Turn on one actuator at a time. Their unit responses are (1,0), (0,1), and (1,1). Add the three force vectors: the horizontal force is u₁+u₃ and the vertical force is u₂+u₃. These two scalar equations become one matrix equation. The diagonal actuator’s force magnitude is √2|u₃|, so u₃ is a component, not its total thrust.",
        "equations": [
          "bₓ = u₁ + u₃; bᵧ = u₂ + u₃",
          "A = [[1,0,1],[0,1,1]]; Au = b"
        ],
        "example": "To request b=(1,1) N, either use u=(1,1,0) N or u=(0,0,1) N. The puck feels the same net force. Their difference is a nonzero control change with zero output: this is what a vector in the kernel means in the laboratory.",
        "interpretation": "The column space is the set of forces the apparatus can make. Rank counts independent output directions. A kernel records redundancy in the controls. Thus solving a system is an engineering question about reachability and ambiguity, not just elimination on numbers.",
        "limits": "Force addition and fixed actuator directions make this model linear. Saturation, nonnegative-only thrust, and changing directions add constraints or alter the model. A zero net force implies zero acceleration; it does not imply zero velocity.",
        "check": "Before calculating: if every thruster points horizontally, which requested acceleration becomes impossible? Explain using the apparatus and then the column space."
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Span as reachable forces",
          "url": "https://www.youtube.com/watch?v=HWO9CwWDilo&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Linear Combination and Span",
          "purpose": "Connect combinations of actuator forces to the set of outputs the apparatus can produce.",
          "optional": true
        },
        {
          "title": "Gamma Digamma · Equations for a requested output",
          "url": "https://www.youtube.com/watch?v=8Dd3T4tD-1s&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Systems of Linear Equations",
          "purpose": "Relate solving Au=b to choosing actuator settings.",
          "optional": true
        }
      ]
    },
    {
      "week": 2,
      "mmChapter": 2,
      "title": "Light rays and composition of optical elements",
      "mm": "M&M Chapter 2: linear maps and matrix representations (complete chapter).",
      "hh": "H&H Chapter 1, §§1.4, 1.5 (2026-10-08 to 2026-10-14): Geometry, limits, and continuity.",
      "goals": "Test linearity, track domains and codomains, compose maps in the right order, and relate norms to continuity. Cover all chapter sections, including eigenvalue material where it appears in your copy.",
      "bridge": "Following a ray through successive devices makes matrix composition tangible. Read the product right to left. The model is linear only under the stated small-angle and ideal-lens assumptions; compare it with exact trigonometry to see the boundary.",
      "resources": [
        {
          "title": "Maps between coordinate spaces",
          "url": "https://www.youtube.com/watch?v=dJJT3R94jKo",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Calculating with matrices",
          "url": "https://www.youtube.com/watch?v=ZeNorTn95DQ",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "When a matrix is invertible",
          "url": "https://www.youtube.com/watch?v=r9g2dzlPFLw",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. A parallel ray has h=0.01 m and θ=0. Take f=0.10 m and d=0.20 m. Derive and compare P(d)L(f) and L(f)P(d), calculate both outgoing states, and draw both apparatus arrangements. Explain the different outgoing heights physically.",
        "P2. Send several parallel rays through the lens and observe them on a screen a distance d later. Derive h_out=(1−d/f)h_in. Find the focusing distance and explain why equal outgoing heights do not mean the entire two-component ray transformation is singular."
      ],
      "review": [
        "R1. Predict and calculate what changes when the lens is removed (1/f→0), and when the screen distance is zero. Identify which matrix becomes the identity in each limit.",
        "R2. For free propagation, compare h+dθ with h+d tan(θ) at θ=0.01 and 0.10 rad. Explain why the error changes with angle and which physical approximation is responsible."
      ],
      "skills": [
        "linearity",
        "composition",
        "kernel-image",
        "norm-continuity"
      ],
      "repair": "If order is confused, draw the physical devices and follow one ray step by step. If focus is mistaken for a singular matrix, retain both ray height and angle.",
      "legacyPractice": [
        "P1. Let S(x,y) = (x+y,y) and R(x,y) = (-y,x). Find RS and SR, apply both to (1,0), and draw the two resulting vectors. Explain why order matters.",
        "P2. For T(x,y) = (2x,y), prove ||T(h)|| ≤ 2||h|| using the Euclidean norm. Use the inequality to give a delta for any epsilon in a continuity proof at an arbitrary point."
      ],
      "legacyReview": [
        "R1. Is F(x,y) = (x+1,y) linear? Is it continuous? Justify both answers and explain why these are different questions.",
        "R2. Revisit Week 1 with T(x,y) = (x+y,2x+2y): find its kernel and image and describe the preimage of (3,6)."
      ],
      "physicalModel": "In the paraxial approximation, represent a ray by (h,θ): height h in metres and small angle θ in radians. Free propagation by d metres gives P(d)=[[1,d],[0,1]]. An ideal thin converging lens of focal length f metres gives L(f)=[[1,0],[−1/f,1]]. The matrix entries carry the units needed to connect height and angle. The two coordinates are not interchangeable spatial axes.",
      "experiment": "In a spreadsheet or short program, sweep d through f and plot the outgoing ray heights. Then swap device order. Compute both 2×2 products and check them against step-by-step propagation. Compare the paraxial prediction with d tan(θ) for increasing θ.",
      "startDate": "2026-10-08",
      "endDate": "2026-10-14",
      "monthLabel": "October",
      "hhBlocks": [
        {
          "chapter": 1,
          "sections": [
            "1.4",
            "1.5"
          ],
          "startDate": "2026-10-08",
          "endDate": "2026-10-14",
          "focus": "Geometry, limits, and continuity."
        }
      ],
      "mmDue": "2026-10-10",
      "experimentDue": "2026-10-12",
      "practiceDue": "2026-10-13",
      "reviewDue": "2026-10-14",
      "repairDue": "2026-10-16",
      "videoDue": "2026-10-11",
      "videoCheckpoint": "Compose a lens and a propagation matrix in both orders. Predict and calculate why the outgoing ray changes when the order changes.",
      "modelLesson": {
        "question": "How does an optical instrument transform a ray?",
        "setup": "Follow one narrow ray near a common optical axis. At a reference plane, record its height above the axis and its direction. A lens changes direction; travel through empty space changes height. We want to predict the ray at a later screen from these two pieces of information.",
        "quantities": [
          [
            "q=(h,θ)",
            "Ray height h in metres and angle θ in radians, measured relative to the optical axis."
          ],
          [
            "d and f",
            "Travel distance and lens focal length, in metres."
          ],
          [
            "P(d), L(f)",
            "Two 2×2 maps acting on the ray state; their entries have different units."
          ]
        ],
        "derivation": "During free travel the exact height change is d tan θ. For small angles tan θ≈θ, so h_new=h+dθ and θ_new=θ. A thin converging lens is idealized as leaving height unchanged while changing angle by −h/f. Put the coefficients of h and θ into the corresponding rows. The output of the first element becomes the input of the second.",
        "equations": [
          "P(d) = [[1,d],[0,1]]; L(f) = [[1,0],[−1/f,1]]",
          "q_screen = P(d)L(f)q_in for a lens followed by free travel"
        ],
        "example": "Take h=0.002 m, θ=0, and f=0.20 m. Just after the lens θ=−0.01 rad. After another 0.20 m, h=0.002+0.20(−0.01)=0. The ray reaches the axis, but it still has a nonzero direction: the complete state has not vanished.",
        "interpretation": "Matrix multiplication expresses the order of physical operations. The rightmost matrix acts first. A screen measures only height, so distinct full ray states can have the same screen reading. This distinction separates loss in a measurement from invertibility of the full transformation.",
        "limits": "This is a paraxial, thin-lens model with a common refractive medium. Large angles, lens thickness, and aberrations need a richer model. Since height and angle have different units, ordinary Euclidean lengths in this state space have no automatic physical meaning.",
        "check": "Sketch a ray before and after a lens. Which coordinate changes at the lens, and which changes during travel? Predict the effect of swapping their order."
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Composition as matrix multiplication",
          "url": "https://www.youtube.com/watch?v=nesQ8XJw7C4&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Matrix Multiplication",
          "purpose": "Apply the composition rule to lens and propagation order.",
          "optional": true
        },
        {
          "title": "Gamma Digamma · Building a map from its columns",
          "url": "https://www.youtube.com/watch?v=z-NTUBogKo4&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Matrices of Linear Maps",
          "purpose": "Reconstruct each optical map from its action on the two coordinate directions.",
          "optional": true
        }
      ]
    },
    {
      "week": 3,
      "mmChapter": 3,
      "title": "Changing laboratory frames and calibrating a sensor",
      "mm": "M&M Chapter 3: independence, bases, and coordinates (complete chapter).",
      "hh": "H&H Chapter 1, §§1.6, 1.7 (2026-10-15 to 2026-10-21): The five major theorems and derivatives as linear maps.",
      "goals": "Choose bases, change coordinates, use dimension arguments, and interpret a Jacobian as a linear approximation. Review one-variable derivatives before H&H §1.7 if needed.",
      "bridge": "Changing coordinates does not move the apparatus. Moving the apparatus is an active transformation. A sensor Jacobian converts small measurement errors into approximate position errors; it is a local map, not the full nonlinear measurement law.",
      "resources": [
        {
          "title": "Kernel and image",
          "url": "https://www.youtube.com/watch?v=DtXLvlZWiRE",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Dimensions of kernel and image",
          "url": "https://www.youtube.com/watch?v=HsCfkZMZuTU",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Coordinates relative to a basis",
          "url": "https://www.youtube.com/watch?v=0ahTb-nvyCc",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. A force has laboratory coordinates (3,1) N. An instrument frame is rotated by 30°. Find its instrument coordinates and reconstruct the original force. Check that its magnitude is unchanged. Sketch both bases without rotating the force itself.",
        "P2. Derive the Jacobian of F(r,θ)=(r cosθ,r sinθ). At r=2 m and θ=π/4, predict the position change for Δr=0.01 m and Δθ=0.005 rad. Compare with the exact change and explain what each Jacobian column measures."
      ],
      "review": [
        "R1. A vector has coordinates (1,0) in a frame rotated by 90° from the laboratory frame. Give its laboratory coordinates. Explain why rotating the physical vector by another 90° is a different operation.",
        "R2. At r=0, why can a range-and-bearing sensor not recover angle from Cartesian position? Connect your physical explanation to the Jacobian columns and their rank."
      ],
      "skills": [
        "basis",
        "coordinates",
        "dimension",
        "jacobian",
        "linear-approximation"
      ],
      "repair": "If coordinates and physical vectors are conflated, draw one fixed arrow in two frames. If Jacobian units are lost, label the input unit and output unit for every column.",
      "legacyPractice": [
        "P1. With B = ((1,1),(1,-1)), find the B-coordinates of (3,1). Represent T(x,y) = (2x,y) in B-coordinates and verify your matrix on both basis vectors.",
        "P2. For F(x,y) = (x²+y,xy), compute DF at (1,2). Expand F(1+h,2+k) exactly and separate the constant, linear, and remainder terms. Explain why the remainder is smaller than the input displacement to first order."
      ],
      "legacyReview": [
        "R1. Find a basis for span{(1,0,1),(0,1,1),(1,1,2)} and give coordinates for the third vector in that basis. Explain which vector is redundant.",
        "R2. Revisit composition: for g(t) = (t,t²) and F from P2, compute the derivative of F(g(t)) directly at t = 1 and by composing the derivative maps."
      ],
      "physicalModel": "A planar displacement can be described in a laboratory frame or a frame rotated by φ. With B=[[cosφ,−sinφ],[sinφ,cosφ]], laboratory coordinates are B times instrument coordinates. Separately, a range-and-bearing sensor maps (r,θ) to (r cosθ,r sinθ); r has units of metres and θ is in radians.",
      "experiment": "Compute exact and Jacobian-predicted sensor displacements for perturbations (ε·0.01 m, ε·0.005 rad), with ε=1,1/2,1/4,1/8. Plot the remainder against ε and estimate its order. Keep radius and angle units labelled.",
      "startDate": "2026-10-15",
      "endDate": "2026-10-21",
      "monthLabel": "October",
      "hhBlocks": [
        {
          "chapter": 1,
          "sections": [
            "1.6",
            "1.7"
          ],
          "startDate": "2026-10-15",
          "endDate": "2026-10-21",
          "focus": "The five major theorems and derivatives as linear maps."
        }
      ],
      "mmDue": "2026-10-17",
      "experimentDue": "2026-10-19",
      "practiceDue": "2026-10-20",
      "reviewDue": "2026-10-21",
      "repairDue": "2026-10-23",
      "videoDue": "2026-10-18",
      "videoCheckpoint": "Write the same displacement in two coordinate frames. For a sensor map, identify a motion that is invisible and verify the rank–nullity count.",
      "modelLesson": {
        "question": "When are we changing the physical vector, and when are we changing its description?",
        "setup": "Two observers view the same arrow from differently oriented coordinate frames. Its physical direction stays fixed. Separately, a range sensor reports distance and angle rather than Cartesian position. The first situation is an exact linear change of coordinates; the second needs a local approximation.",
        "quantities": [
          [
            "v_inst, v_lab",
            "Coordinates of the same vector, in the same physical units."
          ],
          [
            "B",
            "Its columns are the instrument’s unit basis vectors written in laboratory coordinates."
          ],
          [
            "Δr, Δθ and Δp",
            "Small range/angle changes and their corresponding Cartesian displacement."
          ]
        ],
        "derivation": "If the instrument axes are rotated by φ, a vector with instrument coordinates (a,b) is a times the first instrument axis plus b times the second. This gives v_lab=Bv_inst. For the range sensor, differentiate each output coordinate with respect to r and θ. Those two response vectors form the Jacobian columns.",
        "equations": [
          "B = [[cosφ,−sinφ],[sinφ,cosφ]]; v_inst = Bᵀv_lab",
          "p(r,θ) = (r cosθ,r sinθ)",
          "Δp ≈ JΔq; J = [[cosθ,−r sinθ],[sinθ,r cosθ]]"
        ],
        "example": "At r=3 m and θ=0, J=[[1,0],[0,3]]. A 0.002 m range change produces about 0.002 m horizontal motion; a 0.001 rad angle change produces about 0.003 m vertical motion. Each column describes a different physical way of changing the reading.",
        "interpretation": "A basis matrix translates descriptions of a fixed object. A Jacobian predicts how the object changes when inputs change. Both use columns as response vectors, but only the first relation is exact for arbitrary coordinate values.",
        "limits": "Evaluate J at a stated operating point and label units. The approximation improves as the perturbation shrinks; it does not make the polar-coordinate map globally linear. Radians and metres cannot be compared as raw input sizes without a scale convention.",
        "check": "If the coordinate frame rotates while the arrow stays still, does its physical length change? If range doubles, how does the displacement caused by a small angular error change?"
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Changing a coordinate basis",
          "url": "https://www.youtube.com/watch?v=GVRm69UK1M4&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Change of Bases",
          "purpose": "Distinguish moving the physical arrow from rewriting its coordinates.",
          "optional": true
        }
      ]
    },
    {
      "week": 4,
      "mmChapter": 4,
      "title": "Work, projection, and measurements with noise",
      "mm": "M&M Chapter 4: inner products (complete chapter).",
      "hh": "H&H Chapter 1, §§1.8, 1.9, 1.10 (2026-10-22 to 2026-10-28): Derivative rules, differentiability criteria, and selected chapter review.",
      "goals": "Work with inner products, orthogonal projection, and orthonormal bases; connect derivative composition with matrix multiplication and justify approximation error.",
      "bridge": "The dot product measures an observable before it becomes a formula. Orthogonal residuals express what the available measurement model cannot explain. Weighted measurements require a corresponding change of inner product.",
      "resources": [
        {
          "title": "Dot products, lengths and perpendicularity",
          "url": "https://www.youtube.com/watch?v=X2ls7z3J2gg",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Projecting onto a subspace",
          "url": "https://www.youtube.com/watch?v=EU9rWqL9CmE",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Building an orthonormal basis",
          "url": "https://www.youtube.com/watch?v=n7EvXRoEUl0",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. A constant force F=(3,4) N acts during displacement s=(2,0) m. Calculate the work and the force component parallel to s. Rotate both coordinate descriptions by 30° and verify that the work stays the same.",
        "P2. Three equal-weight sensors report vₓ=1.0, vᵧ=2.0, and vₓ+vᵧ=3.2 in consistent units. Build A and b and find the least-squares estimate of v. Compute the residual and verify Aᵀ(Av−b)=0. Explain why each reading cannot be matched exactly."
      ],
      "review": [
        "R1. A force is perpendicular to a nonzero displacement. Predict its work before calculating. Does zero work imply zero force? Give a physical example and a vector example.",
        "R2. Revisit the three sensors: if the third reading is known to be much less reliable, should all three equations have equal weight? State a weighted squared-error objective and predict how the estimate moves as that weight approaches zero."
      ],
      "skills": [
        "inner-product",
        "projection",
        "orthogonality",
        "chain-rule",
        "differentiability"
      ],
      "repair": "If a projection is memorized without meaning, derive it by minimizing a physical mismatch. If sensor weights are omitted, state the noise assumption and compare two choices.",
      "legacyPractice": [
        "P1. Project b = (2,0,1) onto span{u}, where u = (1,1,0). Find the residual, check it is orthogonal to u, and prove that your projection minimizes distance among all multiples of u.",
        "P2. Let F(x,y) = (x²+y,xy) and g(t) = (t,t²). Compute D(F composed with g) at t = 1 both directly and by the chain rule, then explain the dimensions of the matrices being multiplied."
      ],
      "legacyReview": [
        "R1. For b = (1,2) and u = (1,1), derive the closest point on span{u} from an inner-product argument and independently by minimizing a quadratic.",
        "R2. For f(x,y) = x²+y², give the linear approximation at (1,1), the exact remainder at (1+h,1+k), and a bound proving differentiability. State which earlier ideas about norms and maps you used."
      ],
      "physicalModel": "The work of a constant force is F·s. A directional sensor measures the projection of a vector onto its unit sensing direction. With several imperfect readings, estimating a vector becomes a least-squares fit, under an explicit equal-weight noise assumption.",
      "experiment": "Sweep the third sensor reading from 2.6 to 3.4. Plot estimated components, residual norm, and the residual in measurement space. Repeat with a smaller third-sensor weight. Derive the small normal equations by hand before checking them numerically.",
      "startDate": "2026-10-22",
      "endDate": "2026-10-28",
      "monthLabel": "October",
      "hhBlocks": [
        {
          "chapter": 1,
          "sections": [
            "1.8",
            "1.9",
            "1.10"
          ],
          "startDate": "2026-10-22",
          "endDate": "2026-10-28",
          "focus": "Derivative rules, differentiability criteria, and selected chapter review."
        }
      ],
      "mmDue": "2026-10-24",
      "experimentDue": "2026-10-26",
      "practiceDue": "2026-10-27",
      "reviewDue": "2026-10-28",
      "repairDue": "2026-10-30",
      "videoDue": "2026-10-25",
      "videoCheckpoint": "Project a force onto a displacement direction and interpret the work. Construct the projection matrix and verify both P²=P and Pᵀ=P; explain why idempotence alone does not imply an orthogonal projection.",
      "modelLesson": {
        "question": "How do we find the best physical explanation of inconsistent measurements?",
        "setup": "Several sensors observe the same unknown two-component vector. In an ideal experiment their readings agree with one vector exactly. Noise usually makes that impossible. We therefore seek the vector whose predicted measurements come closest to the observations.",
        "quantities": [
          [
            "v",
            "The unknown physical vector, with two components."
          ],
          [
            "A",
            "One row per sensor: the coefficients specifying what that sensor measures."
          ],
          [
            "b and r=Av−b",
            "Observed readings and prediction errors, in measurement units."
          ]
        ],
        "derivation": "A sensor pointing along a unit direction n reads n·v. A channel reporting vₓ+vᵧ has row (1,1); it is a calibrated sum, not a unit-direction projection. Stack the rows to obtain Av. Equal-weight least squares minimizes the sum of squared residuals. At the minimum no change of v can reduce the error to first order, giving Aᵀ(Av−b)=0.",
        "equations": [
          "A = [[1,0],[0,1],[1,1]]; minimize ||Av−b||²",
          "AᵀA v̂ = Aᵀb; Aᵀr = 0"
        ],
        "example": "For readings b=(1,1,2), v=(1,1) fits exactly. If only the third reading rises to 2+δ, the best equal-weight fit becomes v̂=(1+δ/3,1+δ/3). Its residual is (δ/3,δ/3,−δ/3), which is perpendicular to both columns of A. The disagreement is shared rather than hidden.",
        "interpretation": "Av̂ is the projection of the data onto the subspace of readings the model can produce. This projection lives in three-dimensional measurement space, even though the unknown vector has only two components. In mechanics, F·s similarly selects the part of force that contributes work along a displacement.",
        "limits": "Equal weighting assumes comparable uncertainty after calibration. Unequal or correlated errors call for a suitable weighted objective. A small residual shows agreement with the chosen model; it does not prove the sensors are unbiased.",
        "check": "Why can adding a measurement make exact solvability disappear while improving the estimate? Identify the input space, output space, and residual in your sketch."
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Kernel and image of a measurement map",
          "url": "https://www.youtube.com/watch?v=ePlQjEoaYyk&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Kernels and Images",
          "purpose": "Identify which readings are possible before projecting noisy data onto that image. This is background for least squares; use Berkeley for projection methods.",
          "optional": true
        }
      ]
    },
    {
      "week": 5,
      "mmChapter": 5,
      "title": "Coupled springs, principal directions, and weak measurements",
      "mm": "M&M Chapter 5: SVD and spectral theorems (complete chapter, including adjoints and the complex/normal case).",
      "hh": "H&H Chapter 1 (2026-10-29 to 2026-10-31): Chapter 1 completion checkpoint: close remaining reading and review corrections. H&H Chapter 2, §§2.1, 2.2 (2026-11-01 to 2026-11-04): Row reduction and solving systems; include §2.0 orientation.",
      "goals": "Distinguish singular values from eigenvalues, interpret SVD geometrically, and connect invertibility to solving systems. This is a dense M&M week: retain proof work and use the spring and sensor experiments to test the geometric claims.",
      "bridge": "The in-phase and out-of-phase motions reveal eigenvectors as independent modes. SVD describes directional sensitivity for more general maps, including rectangular sensor maps where eigenvectors are not available in the same way.",
      "resources": [
        {
          "title": "Eigenpairs and invariant directions",
          "url": "https://www.youtube.com/watch?v=2UCphBjFyyg",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Diagonal coordinates for a matrix",
          "url": "https://www.youtube.com/watch?v=RfmfFdsMWmM",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Symmetric matrices in orthogonal coordinates",
          "url": "https://www.youtube.com/watch?v=SOQCwk2FJsw",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "SVD: input and output directions",
          "url": "https://www.youtube.com/watch?v=Va8EfR_Q-YM",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. Derive K by adding the forces of all three springs on each mass. Find its two mode directions and angular frequencies. With initial displacement (0.01,0) m and zero velocity, express the motion as a sum of modes and explain why the two masses exchange motion.",
        "P2. A calibrated sensor maps a two-component displacement in metres to y=A x, also in metres, with A=diag(1,0.01). Compare the image of a 1 mm circle and the effect of adding 0.0001 m noise to each measurement component separately. Identify the weakly observed direction using singular values."
      ],
      "review": [
        "R1. Remove the middle spring while leaving both wall springs unchanged. Predict the modes, frequencies, and independence of the two masses before writing the new stiffness matrix.",
        "R2. For the sensor A=diag(1,0.01), is a small residual y−A x sufficient evidence that an estimated x is accurate? Construct a measurement perturbation and quantify the resulting displacement error."
      ],
      "skills": [
        "svd",
        "spectral-theorem",
        "adjoint",
        "conditioning",
        "linear-solve"
      ],
      "repair": "If modes are treated as arbitrary algebra, draw the spring extensions in each mode. If frequency equals eigenvalue in the calculation, restore mass and dimensional units. For SVD, separate input and output directions.",
      "legacyPractice": [
        "P1. For A = [[3,0],[0,1]], give an SVD, sketch the image of the unit circle, and find its best rank-one approximation in the spectral norm. State the error.",
        "P2. Solve diag(1,0.001)x = b for b = (1,0), then for b = (1,0.001). Compare the changes in b and x and explain the role of the smaller singular value."
      ],
      "legacyReview": [
        "R1. For A = [[0,2],[0,0]], find its eigenvalues and singular values. Explain why they need not agree.",
        "R2. Revisit Week 4: for a real matrix with orthonormal columns Q, show that QQᵀ is a projection and identify its image and kernel."
      ],
      "physicalModel": "Two 1 kg masses move along a frictionless line between fixed walls, connected by three springs of stiffness 1 N/m. For small displacements x=(x₁,x₂), restoring force is −Kx with K=[[2,−1],[−1,2]] N/m. The undamped equation is ẍ=−Kx after dividing by the common mass. Frequencies satisfy ω²=λ; eigenvalues are not frequencies themselves.",
      "experiment": "Plot both masses for 0≤t≤20 s using the analytic modal solution, then compare a numerical time-step solution. Halve the time step and inspect error and energy drift. Separately sweep the weak sensor gain from 1 to 0.001 and plot reconstruction-error amplification. State the numerical method.",
      "startDate": "2026-10-29",
      "endDate": "2026-11-04",
      "monthLabel": "October / November",
      "hhBlocks": [
        {
          "chapter": 1,
          "sections": [],
          "startDate": "2026-10-29",
          "endDate": "2026-10-31",
          "focus": "Chapter 1 completion checkpoint: close remaining reading and review corrections."
        },
        {
          "chapter": 2,
          "sections": [
            "2.1",
            "2.2"
          ],
          "startDate": "2026-11-01",
          "endDate": "2026-11-04",
          "focus": "Row reduction and solving systems; include §2.0 orientation."
        }
      ],
      "mmDue": "2026-10-31",
      "experimentDue": "2026-11-02",
      "practiceDue": "2026-11-03",
      "reviewDue": "2026-11-04",
      "repairDue": "2026-11-06",
      "videoDue": "2026-11-01",
      "videoCheckpoint": "For the spring matrix, identify independent modes and interpret their eigenvalues. Then describe why a rectangular sensor map needs separate input and output directions in its SVD.",
      "modelLesson": {
        "question": "Which motions can a coupled mechanical system sustain independently?",
        "setup": "Displace two masses from equilibrium between fixed walls. Each wall spring pulls its own mass back; the middle spring reacts to the difference between the displacements. A force on one mass therefore depends on both coordinates. We want coordinates in which the coupled motion becomes easier to understand.",
        "quantities": [
          [
            "x=(x₁,x₂)",
            "Displacements from equilibrium in metres."
          ],
          [
            "k and m",
            "Spring stiffness in N/m and common mass in kg."
          ],
          [
            "K and K/m",
            "The stiffness matrix and the acceleration map; eigenvalues of K/m have units s⁻²."
          ]
        ],
        "derivation": "On mass 1, the wall contributes −kx₁ and the middle spring contributes k(x₂−x₁). Their sum is −2kx₁+kx₂. On mass 2 the force is kx₁−2kx₂. Newton’s law gives m ẍ=−Kx. An eigenvector is a displacement pattern whose restoring acceleration points along the same pattern, so it evolves without mixing into another mode.",
        "equations": [
          "K = k[[2,−1],[−1,2]]; m ẍ = −Kx",
          "Kq = κq; ω² = κ/m",
          "A = UΣVᵀ: input directions → gains → output directions"
        ],
        "example": "Move both masses equally: the middle spring keeps its length, so only wall springs resist. Move them equally in opposite directions: the middle spring stretches or compresses as well, creating stronger restoring forces. This predicts a lower-frequency common-motion mode and a higher-frequency opposing-motion mode before solving the characteristic equation.",
        "interpretation": "Eigenvectors identify mechanically independent patterns. SVD answers a related measurement question: which input displacements a sensor amplifies or barely observes. In A=diag(1,g), the second displacement gives only g times as much output; reconstructing it divides measurement noise by g.",
        "limits": "The model assumes Hooke’s law, fixed walls, no damping, and equal masses. With unequal masses use M ẍ=−Kx and Kq=ω²Mq. A stiffness eigenvalue is not itself a frequency. For rectangular sensor maps, input and output singular vectors occupy different spaces.",
        "check": "If the coupling spring is strengthened, which of the two displacement patterns should be affected? Explain using spring extension before computing."
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Rank and independent measurement directions",
          "url": "https://www.youtube.com/watch?v=_28PtPJR8MI&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Column-Row Factorisation and Matrix Rank",
          "purpose": "Review which sensor directions are observable. Use Berkeley for eigenmodes and SVD; this video supplies rank background.",
          "optional": true
        }
      ]
    },
    {
      "week": 6,
      "mmChapter": 6,
      "title": "Deforming a sheet and losing geometric information",
      "mm": "M&M Chapter 6: determinants (complete chapter, including characteristic polynomials and applications). This completes the six main chapters.",
      "hh": "H&H Chapter 2, §§2.3, 2.4, 2.5, 2.6 (2026-11-05 to 2026-11-11): Inverses, span, kernels, images, dimension, and abstract spaces.",
      "goals": "Connect determinant, volume, and invertibility; use rank-nullity outside coordinate spaces; distinguish a characteristic-polynomial argument from a geometric one.",
      "bridge": "Determinants describe signed area change, whereas singular values describe directional stretch. Equal area change can hide very different distortions. Rank and nullspace describe which positional information a collapsed sheet loses.",
      "resources": [
        {
          "title": "Determinants and their properties",
          "url": "https://www.youtube.com/watch?v=vIt7Mdcvu4Y",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Revisit: symmetric matrices in orthogonal coordinates",
          "url": "https://www.youtube.com/watch?v=SOQCwk2FJsw",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. Transform all four corners of a unit square by F for γ=1 and s=2. Compute its area from the edge vectors and compare with det F. Repeat for s=−2 and s=0, describing orientation and information loss.",
        "P2. Compare A=diag(10,0.1) and B=I. Both preserve area. Map a circle under each and compute their singular values and 2-norm condition numbers. Explain why equal determinant does not imply equally stable recovery of the original point."
      ],
      "review": [
        "R1. Apply a shear and then its inverse to a marked sheet. Predict the final grid and total area scale, then prove your prediction by multiplying the matrices.",
        "R2. At s=0 and γ=1, find the nullspace and image of F. Give two distinct original points with the same image and explain what measurement could no longer distinguish them."
      ],
      "skills": [
        "determinant",
        "volume",
        "characteristic-polynomial",
        "rank-nullity",
        "abstract-vector-space"
      ],
      "repair": "If determinant is confused with shape, compare an area-preserving shear with a rotation. If sign is confused with physical area, distinguish oriented area from its magnitude.",
      "legacyPractice": [
        "P1. For A = [[1,2],[3,4]], find the signed area scale, characteristic polynomial, and eigenvalues. Verify that the eigenvalue product equals the determinant and interpret the sign geometrically.",
        "P2. Let D send polynomials of degree at most 2 to their derivatives, viewed in the same space. Find kernel, image, rank, nullity, and its matrix in (1,t,t²). Explain why it is not invertible."
      ],
      "legacyReview": [
        "R1. Can two 2×2 matrices both have determinant 1 but stretch the unit circle very differently? Construct examples and compare their singular values.",
        "R2. For T(x,y,z) = (x+y,y+z), find a basis for its kernel and image and verify rank-nullity. Explain why a determinant is not the right tool here."
      ],
      "physicalModel": "Mark a square grid on an ideal sheet and map positions by F=[[1,γ],[0,s]], where γ is dimensionless shear and s is dimensionless vertical stretch. A negative s reverses orientation; s=0 collapses the plane to a line. The model describes a uniform geometric deformation, not an assumed constitutive law for a real material.",
      "experiment": "Plot a grid and unit circle for γ=0,1,2 and s=1,0.1,0,−1. Track signed determinant, nonnegative area, and smallest singular value separately. For nonsingular cases, add a small output perturbation and observe recovery error.",
      "startDate": "2026-11-05",
      "endDate": "2026-11-11",
      "monthLabel": "November",
      "hhBlocks": [
        {
          "chapter": 2,
          "sections": [
            "2.3",
            "2.4",
            "2.5",
            "2.6"
          ],
          "startDate": "2026-11-05",
          "endDate": "2026-11-11",
          "focus": "Inverses, span, kernels, images, dimension, and abstract spaces."
        }
      ],
      "mmDue": "2026-11-07",
      "experimentDue": "2026-11-09",
      "practiceDue": "2026-11-10",
      "reviewDue": "2026-11-11",
      "repairDue": "2026-11-13",
      "videoDue": "2026-11-08",
      "videoCheckpoint": "Predict the signed area change under the deformation matrix and check it by its determinant. Use a symmetric 2×2 matrix to write a quadratic form along its eigenvector axes and classify its sign.",
      "modelLesson": {
        "question": "What information survives when a sheet is stretched and sheared?",
        "setup": "Draw a unit square and a small circle on a sheet. Apply the same geometric transformation to every point. Tracking the two original edge directions is enough to determine the image of the entire grid because every point is a linear combination of those directions.",
        "quantities": [
          [
            "p and p_new",
            "Original and transformed positions, in metres."
          ],
          [
            "γ and s",
            "Dimensionless shear and vertical stretch parameters."
          ],
          [
            "F",
            "The 2×2 deformation map; columns are the images of the original unit directions."
          ]
        ],
        "derivation": "Specify the coordinate rule x_new=x+γy and y_new=sy. Its coefficients form F. The horizontal unit edge becomes (1,0); the vertical edge becomes (γ,s). Their parallelogram has signed area s. A circle becomes an ellipse whose semiaxes are the singular values times the original radius.",
        "equations": [
          "p_new = Fp; F = [[1,γ],[0,s]]",
          "signed area factor = det F = s; area factor = |s|",
          "κ₂(F) = σ_max/σ_min when F is invertible"
        ],
        "example": "For pure shear, s=1 and γ=2. The square leans into a parallelogram while its area stays unchanged. The inverse still exists, but some directions stretch more than others. As s approaches zero with γ fixed, the sheet becomes nearly flat in one direction and small output errors can cause large reconstruction errors.",
        "interpretation": "Determinant measures total signed area scaling. Rank records how many independent directions remain. Singular values reveal separate directional changes and sensitivity. These answer different physical questions; area preservation does not guarantee stable inversion.",
        "limits": "This is a uniform map of geometry, not a material law predicting forces or stress. A negative determinant reverses orientation; area itself remains nonnegative. Real sheets may buckle or resist such a deformation.",
        "check": "Can one direction stretch by 100 while another shrinks by 100 and area remain unchanged? Explain why recovering the original point can still be sensitive to noise."
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Invertibility and information recovery",
          "url": "https://www.youtube.com/watch?v=D-r3cVGKCN8&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Inverses and Invertibility",
          "purpose": "Connect an inverse map to recovering an undeformed point, and distinguish existence from numerical sensitivity.",
          "optional": true
        }
      ]
    },
    {
      "week": 7,
      "mmChapter": null,
      "title": "Finding the equilibrium of a nonlinear spring",
      "mm": "M&M consolidation: revisit maps, spectral ideas, and solving systems using feedback from Weeks 1–6; no new chapter.",
      "hh": "H&H Chapter 2, §§2.7, 2.8 (2026-11-12 to 2026-11-18): Eigenstructure and Newton iteration with its hypotheses.",
      "goals": "Use eigenvectors to predict iterates and use a Jacobian to compute a Newton correction. Separate a successful numerical step from a convergence guarantee.",
      "bridge": "Newton iteration is repeated solution of a locally linear force-balance problem. Its Jacobian is a physical tangent response. Accurate local linearization and an invertible tangent are both needed; successful iteration is not a global convergence theorem.",
      "resources": [
        {
          "title": "Linear maps and solvability",
          "url": "https://www.youtube.com/watch?v=sEIIBaDovOc",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Revisit: when a matrix is invertible",
          "url": "https://www.youtube.com/watch?v=r9g2dzlPFLw",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. Derive Newton’s displacement update for the nonlinear spring and perform three steps from x₀=0.10 m. At every step report x, force residual in N, and tangent stiffness in N/m. Compare with the purely linear estimate F/k and explain why the cubic term changes equilibrium.",
        "P2. Consider instead the force law F_s(x)=a x−b x³, with a=1 N/m and b=1 N/m³, at applied force 0.2 N. Locate where tangent stiffness vanishes. Explain why Newton correction becomes unreliable there and why this idealized law can have multiple equilibria."
      ],
      "review": [
        "R1. In the hardening-spring model, derive the approximate equilibrium displacement change produced by an extra 0.01 N load. Compare the units and sign with physical intuition.",
        "R2. For a pair of coupled nonlinear equilibrium equations, explain what must replace the scalar division in Newton’s method. Relate an almost singular Jacobian to the weak-sensor example from Week 5."
      ],
      "skills": [
        "eigenvectors",
        "matrix-powers",
        "newton-step",
        "jacobian",
        "convergence-hypotheses"
      ],
      "repair": "If Newton is treated as a black box, label the force residual, tangent stiffness, and displacement correction on the graph. Explain failure before changing the starting guess.",
      "legacyPractice": [
        "P1. Starting at x₀ = 1, perform two Newton steps for f(x) = x²−2. Compute the residual after each step and explain why convergence from one initial value says nothing about all initial values.",
        "P2. For F(x,y) = (x²+y²−1,x−y), take one Newton step from (1,1). Write the Jacobian system before solving it and compare the residual before and after."
      ],
      "legacyReview": [
        "R1. For A = [[2,1],[1,2]], use the directions (1,1) and (1,−1) to compute A³(1,0) without three matrix multiplications.",
        "R2. For F(x,y) = (x²−1,y), explain why the Newton step is undefined at (0,0). Identify the failed prerequisite rather than merely reporting division by zero."
      ],
      "physicalModel": "A spring has restoring-force magnitude kx+αx³, with k=10 N/m and α=1000 N/m³, under a constant applied force F=2 N. Static equilibrium solves f(x)=kx+αx³−F=0. The tangent stiffness f′(x) has units N/m and converts a force residual into a displacement correction.",
      "experiment": "Plot force against displacement and draw the first three Newton tangent steps. Try x₀=0,0.1,0.5 m, stopping when |f|<10⁻⁸ N or after 50 steps. Record failures rather than hiding them. In the softening model, compare starts on opposite sides of a zero-tangent point.",
      "startDate": "2026-11-12",
      "endDate": "2026-11-18",
      "monthLabel": "November",
      "hhBlocks": [
        {
          "chapter": 2,
          "sections": [
            "2.7",
            "2.8"
          ],
          "startDate": "2026-11-12",
          "endDate": "2026-11-18",
          "focus": "Eigenstructure and Newton iteration with its hypotheses."
        }
      ],
      "mmDue": "2026-11-14",
      "experimentDue": "2026-11-16",
      "practiceDue": "2026-11-17",
      "reviewDue": "2026-11-18",
      "repairDue": "2026-11-20",
      "videoDue": "2026-11-15",
      "videoCheckpoint": "For the nonlinear spring problem, treat the Jacobian at one point as a linear map. Explain when the local correction is unique and why this alone does not establish global uniqueness. These videos review the linear tools; use H&H for the nonlinear argument.",
      "modelLesson": {
        "question": "How does linear algebra help solve a nonlinear equilibrium equation?",
        "setup": "Apply a steady load to a spring that stiffens as it extends. The restoring-force magnitude kx+αx³ does not obey superposition. We cannot represent the entire force law by one constant matrix. We can, however, replace a small part of its curve by its tangent and solve for a correction.",
        "quantities": [
          [
            "x and F",
            "Extension in metres and applied force in newtons."
          ],
          [
            "f(x)=kx+αx³−F",
            "Force imbalance: zero at equilibrium."
          ],
          [
            "J(x)=k+3αx²",
            "Tangent stiffness in N/m; a 1×1 Jacobian."
          ]
        ],
        "derivation": "At a trial extension x, approximate the new imbalance by f(x+Δx)≈f(x)+J(x)Δx. Ask for the approximate imbalance to be zero. This produces a linear equation in the unknown correction Δx. After applying it, recompute the actual nonlinear force and build a new tangent.",
        "equations": [
          "J(x)Δx = −f(x)",
          "x_next = x − f(x)/J(x)",
          "For several unknowns: J(x)Δx = −f(x) is a matrix system"
        ],
        "example": "If the current imbalance is −0.30 N and tangent stiffness is 15 N/m, the correction is +0.02 m. The units and sign tell a physical story: restoring force is too small, so increase extension. The actual next imbalance must still be checked because the tangent is only an approximation.",
        "interpretation": "Newton’s method repeatedly turns a nonlinear modeling problem into a linear correction problem. In more dimensions, a Jacobian column says how one adjustment changes every residual. Gaussian elimination or LU can solve the correction system without explicitly forming an inverse.",
        "limits": "A small or zero tangent stiffness makes the correction large or undefined. A nonsingular tangent at one point does not guarantee convergence from every initial guess or uniqueness of all equilibria. This scalar example illustrates the mechanism before H&H develops the multivariable theory.",
        "check": "If tangent stiffness has units N/m, why must the force residual be divided by stiffness rather than multiplied by it? What should happen before accepting a large predicted step?"
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · What makes a map linear?",
          "url": "https://www.youtube.com/watch?v=eNaYzZwkHi4&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Linear Maps",
          "purpose": "Test superposition for a tangent correction map; explain why the cubic spring law itself fails that test.",
          "optional": true
        }
      ]
    },
    {
      "week": 8,
      "mmChapter": null,
      "title": "Calibrating an instrument: local inverse and global ambiguity",
      "mm": "M&M consolidation: select mixed problems across Chapters 1–6, prioritizing unresolved feedback; no new chapter.",
      "hh": "H&H Chapter 2, §§2.9, 2.10 (2026-11-19 to 2026-11-25): Convergence rate, inverse and implicit function theorems.",
      "goals": "State local inverse/implicit-function hypotheses precisely, distinguish local from global conclusions, and connect invertible derivatives to reliable local solves.",
      "bridge": "An invertible local response can permit calibration nearby without ensuring unique calibration everywhere. Distinguish model error, sensor noise, numerical error, and global ambiguity in the final report.",
      "resources": [
        {
          "title": "Fitting inconsistent systems by least squares",
          "url": "https://www.youtube.com/watch?v=28_74320am0",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        },
        {
          "title": "Revisit: SVD input and output directions",
          "url": "https://www.youtube.com/watch?v=Va8EfR_Q-YM",
          "provider": "Alexander Paulin · Berkeley Math 54",
          "kind": "video"
        }
      ],
      "practice": [
        "P1. At r=2 m and θ=π/4, derive the local inverse Jacobian of the range sensor. Use it to estimate Δr and Δθ for a measured position change (0.01,−0.01) m. Compare with exact range and atan2 on a stated local angle branch.",
        "P2. The positions from (r,θ) and (r,θ+2π) agree. Explain why this does not contradict the inverse function theorem for r>0. Then examine r=0 and identify both the physical and mathematical failure."
      ],
      "review": [
        "R1. Design a short calibration test distinguishing a weakly observed direction from angle-branch ambiguity. Use the Week 5 sensor and the rotating range sensor, with concrete perturbations and predicted outputs.",
        "R2. Revisit the nonlinear hardening spring: justify local dependence of equilibrium x on force F and derive dx/dF. Predict what changes for a softening spring near zero tangent stiffness. State the theorem assumptions you need."
      ],
      "skills": [
        "implicit-function",
        "local-inverse",
        "quadratic-convergence",
        "cumulative-linear-algebra"
      ],
      "repair": "For each unresolved concept, submit one unseen physical variant with a prediction, a derived model, and a checked calculation. Revisit local/global hypotheses if a numerical success is used as a proof.",
      "legacyPractice": [
        "P1. On x²+y² = 1 near (0,1), explain why y is locally a function of x and find its derivative at x = 0. Explain why the same choice of dependent variable fails near (1,0).",
        "P2. For F(x,y) = (eˣ cos y,eˣ sin y), compute the Jacobian determinant. Explain why F is locally invertible everywhere but not one-to-one on all of R²."
      ],
      "legacyReview": [
        "R1. For A = [[1,1],[1,1]], connect kernel, image, determinant, eigenvalues, and singular values. Then find the closest vector in its image to (1,0) and describe all x attaining that least-squares fit.",
        "R2. For f(x) = x²−2 and positive Newton iterates, derive eₙ₊₁ = eₙ²/(2xₙ), where eₙ = xₙ−√2. State the condition on xₙ needed to turn this identity into a quadratic error bound."
      ],
      "physicalModel": "A rotating range sensor maps (r,θ) to (r cosθ,r sinθ). Locally, position can determine range and angle away from r=0, but angle is globally periodic. Calibration must specify an angle branch, units, and the operating region. This revisits the sensor from Week 3 with inverse-function hypotheses.",
      "experiment": "Sweep small Cartesian perturbations around (√2,√2) m, comparing the exact inverse with its linear approximation. Repeat near the origin and near an atan2 branch cut. Keep local sensitivity and coordinate-branch jumps on separate plots; do not interpret branch jumps as physical motion.",
      "startDate": "2026-11-19",
      "endDate": "2026-11-25",
      "monthLabel": "November",
      "hhBlocks": [
        {
          "chapter": 2,
          "sections": [
            "2.9",
            "2.10"
          ],
          "startDate": "2026-11-19",
          "endDate": "2026-11-25",
          "focus": "Convergence rate, inverse and implicit function theorems."
        }
      ],
      "mmDue": "2026-11-21",
      "experimentDue": "2026-11-23",
      "practiceDue": "2026-11-24",
      "reviewDue": "2026-11-25",
      "repairDue": "2026-11-27",
      "videoDue": "2026-11-22",
      "videoCheckpoint": "Fit the calibration model, check that the residual is perpendicular to the design-matrix columns, and explain how a small singular value makes the inferred parameters sensitive to noise.",
      "modelLesson": {
        "question": "When can a measurement be inverted, and how sensitive is the answer?",
        "setup": "A sensor reports Cartesian position, but the experiment needs range and bearing. Away from the origin we can recover them locally. Two separate difficulties arise: small errors may be amplified, and several angle values may describe the same physical point.",
        "quantities": [
          [
            "p=(x,y)",
            "Measured position in metres."
          ],
          [
            "q=(r,θ)",
            "Range in metres and a bearing in radians on a chosen local angle branch."
          ],
          [
            "J⁻¹",
            "The local map from small Cartesian errors to range and angle errors."
          ]
        ],
        "derivation": "The forward Jacobian has columns e_r=(cosθ,sinθ) and r e_θ=r(−sinθ,cosθ). Resolve a small displacement into radial and tangential parts. Its radial component changes range directly; its tangential component divided by r changes angle.",
        "equations": [
          "Δr ≈ cosθ Δx + sinθ Δy",
          "Δθ ≈ (−sinθ Δx + cosθ Δy)/r",
          "J⁻¹ = [[cosθ,sinθ],[−sinθ/r,cosθ/r]] for r>0"
        ],
        "example": "At r=4 m on the positive horizontal axis, a 0.004 m vertical error changes bearing by about 0.001 rad. At r=0.04 m, the same error predicts about 0.1 rad, and the linear approximation deserves closer checking. Angular sensitivity increases as range decreases.",
        "interpretation": "Invertibility answers whether local recovery exists. Sensitivity asks how much the recovered quantity moves when measurements change. A jump from angle π to −π may be just a branch convention, not a sudden physical displacement. Redundant measurements instead lead to the least-squares recovery studied earlier.",
        "limits": "The inverse function theorem is local. At r=0, bearing is undefined and the angular Jacobian column vanishes. Globally θ and θ+2π describe the same point. Numerical condition measures require a stated scaling when input coordinates use different units.",
        "check": "Distinguish three observations: a branch-cut jump, amplified angular noise near the origin, and a truly missing measurement direction. Which can be fixed by changing only the coordinate convention?"
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Revisit: invertibility",
          "url": "https://www.youtube.com/watch?v=D-r3cVGKCN8&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Inverses and Invertibility",
          "purpose": "Review the linear inverse underlying a local inverse Jacobian. H&H supplies the additional hypotheses for a nonlinear local inverse.",
          "optional": true
        }
      ]
    },
    {
      "week": 9,
      "mmChapter": null,
      "title": "November synthesis and repair of remaining gaps",
      "mm": "M&M Chapters 1–6: revisit the two weakest topics identified by prior reviews; no new chapter.",
      "hh": "H&H Chapter 2, §§2.11 (2026-11-26 to 2026-11-30): Chapter 2 review, cumulative assessment, and final corrections.",
      "goals": "Combine a physical model, geometric prediction, computation, and a justified conclusion. Distinguish what has been demonstrated numerically from what has been proved.",
      "physicalModel": "Revisit the reversible actuators, optical system, coupled springs, and calibrated sensors used throughout the plan. State the units and idealizations each time; do not transfer a formula without checking its physical meaning.",
      "bridge": "The same linear structures recur in force balance, optical propagation, deformation, and local calibration. Transfer is demonstrated by recognizing a structure in a changed system and checking the assumptions.",
      "practice": [
        "P1. A pair of 1 kg masses between fixed walls has wall-spring stiffnesses 2 N/m and a coupling spring of 1 N/m. Derive the stiffness matrix from forces, predict the two mode shapes, compute their frequencies, and compare with Week 5. Explain why changing both wall springs shifts both mode frequencies.",
        "P2. A sensor maps x to y=diag(1,0.02)x in consistent metre units. A second instrument adds a direct measurement of the second displacement component with comparable noise. Construct the stacked measurement map and compare its smallest singular value with that of the first instrument alone. Explain the physical improvement in recoverability."
      ],
      "review": [
        "R1. Choose your least secure earlier physical problem, change one parameter or assumption, and make a written prediction before solving the new instance. Supply a sketch, derivation, numerical check, and explanation of the limiting case.",
        "R2. Explain, using the spring and sensor examples, the distinct roles of eigenvalues, singular values, rank, and determinant. Give one situation where a chosen tool does not apply or where its conclusion would be insufficient."
      ],
      "skills": [
        "physical-modeling",
        "spectral-theorem",
        "conditioning",
        "transfer",
        "theorem-hypotheses"
      ],
      "experiment": "Compare the modified spring modes and stacked-sensor singular values with the earlier models. Present one plot or table for each, label units, and explain which change improves stiffness or observability. Use the November 30 repair session to check one unseen variant.",
      "repair": "By November 30, submit a compact record of secure ideas, unresolved gaps, and successful fresh rechecks. Carry any remaining gaps into the next plan explicitly.",
      "startDate": "2026-11-26",
      "endDate": "2026-11-30",
      "monthLabel": "November",
      "hhBlocks": [
        {
          "chapter": 2,
          "sections": [
            "2.11"
          ],
          "startDate": "2026-11-26",
          "endDate": "2026-11-30",
          "focus": "Chapter 2 review, cumulative assessment, and final corrections."
        }
      ],
      "mmDue": "2026-11-26",
      "experimentDue": "2026-11-27",
      "practiceDue": "2026-11-27",
      "reviewDue": "2026-11-28",
      "repairDue": "2026-11-30",
      "resources": [],
      "modelLesson": {
        "question": "Can you build and defend a new model without being handed its matrix?",
        "setup": "Return to springs and sensors with one physical feature changed. Begin with the apparatus and the question it must answer. The purpose of this final block is to transfer a modeling method, rather than recognize a familiar matrix and reuse a calculation.",
        "quantities": [
          [
            "Inputs",
            "Displacements or controls, with a stated ordering and units."
          ],
          [
            "Outputs",
            "Forces or measurements, using a matching sign convention."
          ],
          [
            "Coefficients",
            "The response of each output to a unit change in one input while the others are fixed."
          ]
        ],
        "derivation": "For springs, draw each extension and add forces on each mass to assemble a stiffness matrix. For sensors, write one measurement equation per row and stack additional readings underneath. Identify whether the forward law is exact under the idealizations or only a local approximation. Only then choose a method of solving or analyzing it.",
        "equations": [
          "Forward prediction: y=Ax; local prediction: Δy≈JΔx",
          "Exact recovery: Ax=b; noisy recovery: minimize ||Ax−b||²",
          "Independent motion: Kq=ω²Mq; observability: inspect singular directions"
        ],
        "example": "Adding a second measurement channel duplicates or extends the set of observed directions. A duplicate can improve precision under independent noise, but cannot increase rank. A channel observing a previously missing direction can remove an ambiguity. State which improvement the instrument actually supplies.",
        "interpretation": "Modeling connects a physical question to a mathematical object and returns the result to the original setting. Rank, eigenvalues, determinant, and SVD are useful because each answers a distinct question about that setting.",
        "limits": "Do not compare singular values across differently scaled units without explaining the scaling. Do not confuse a stiffness change with a mass change, or a small residual with proof of a correct physical law. Validate predictions against limits and perturbations.",
        "check": "For your final submission, explain one matrix column, one limiting case, and one failure of the model. Then give a changed apparatus for which your original conclusion no longer holds."
      },
      "suggestedVideos": [
        {
          "title": "Gamma Digamma · Revisit: rank and factorisation",
          "url": "https://www.youtube.com/watch?v=_28PtPJR8MI&list=PL1mB_Bn-o2RRkwifT-dtFjDNUDhhQVyTc",
          "provider": "Gamma Digamma",
          "sourceTitle": "Linear Algebra Series: Column-Row Factorisation and Matrix Rank",
          "purpose": "Explain whether an extra sensor adds an independent direction or only a repeated measurement.",
          "optional": true
        }
      ]
    }
  ],
  "materialRevision": "oct-nov-2026",
  "teachingApproach": "Predict → draw → calculate → simulate → explain. Start with a physical system, specify its variables, units, and assumptions, then derive its matrix. Use geometry to predict an outcome before calculating. Vary one parameter and explain what remains invariant. Finish by stating the general mathematical principle and testing where the model fails.",
  "endDate": "2026-11-30",
  "videoPolicy": "Use the selected lectures as companions to the books. Pause before worked calculations, predict the result, then reproduce one example without the video. Complete the weekly checkpoint and include it with practice. Replay only the relevant examples for lectures marked Revisit. These selections do not replace GATE practice; explicitly check LU, partitioned/idempotent matrices, and quadratic forms in the reading and problem sessions."
};
}
