// October–November 2026. Videos deliberately unassigned.
// Original physical problems; Bamberg & Sternberg is a teaching reference.
function platinumLinearAlgebraCurriculum() {
  return {
  "id": "priyanka-linear-algebra",
  "taskPrefix": "la",
  "startDate": "2026-10-01",
  "assumptions": "October 1–November 30, 2026. Study weeks run Thursday–Wednesday from October 1; the final block is November 26–30. The reading map uses M&M (2018) and H&H (5th edition), pending confirmation of your copies. Study hours and textbook exercise numbers are still to be selected. Video selection is deferred; no video viewing is assigned.",
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
      "resources": [],
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
      "repairDue": "2026-10-09"
    },
    {
      "week": 2,
      "mmChapter": 2,
      "title": "Light rays and composition of optical elements",
      "mm": "M&M Chapter 2: linear maps and matrix representations (complete chapter).",
      "hh": "H&H Chapter 1, §§1.4, 1.5 (2026-10-08 to 2026-10-14): Geometry, limits, and continuity.",
      "goals": "Test linearity, track domains and codomains, compose maps in the right order, and relate norms to continuity. Cover all chapter sections, including eigenvalue material where it appears in your copy.",
      "bridge": "Following a ray through successive devices makes matrix composition tangible. Read the product right to left. The model is linear only under the stated small-angle and ideal-lens assumptions; compare it with exact trigonometry to see the boundary.",
      "resources": [],
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
      "repairDue": "2026-10-16"
    },
    {
      "week": 3,
      "mmChapter": 3,
      "title": "Changing laboratory frames and calibrating a sensor",
      "mm": "M&M Chapter 3: independence, bases, and coordinates (complete chapter).",
      "hh": "H&H Chapter 1, §§1.6, 1.7 (2026-10-15 to 2026-10-21): The five major theorems and derivatives as linear maps.",
      "goals": "Choose bases, change coordinates, use dimension arguments, and interpret a Jacobian as a linear approximation. Review one-variable derivatives before H&H §1.7 if needed.",
      "bridge": "Changing coordinates does not move the apparatus. Moving the apparatus is an active transformation. A sensor Jacobian converts small measurement errors into approximate position errors; it is a local map, not the full nonlinear measurement law.",
      "resources": [],
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
      "repairDue": "2026-10-23"
    },
    {
      "week": 4,
      "mmChapter": 4,
      "title": "Work, projection, and measurements with noise",
      "mm": "M&M Chapter 4: inner products (complete chapter).",
      "hh": "H&H Chapter 1, §§1.8, 1.9, 1.10 (2026-10-22 to 2026-10-28): Derivative rules, differentiability criteria, and selected chapter review.",
      "goals": "Work with inner products, orthogonal projection, and orthonormal bases; connect derivative composition with matrix multiplication and justify approximation error.",
      "bridge": "The dot product measures an observable before it becomes a formula. Orthogonal residuals express what the available measurement model cannot explain. Weighted measurements require a corresponding change of inner product.",
      "resources": [],
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
      "repairDue": "2026-10-30"
    },
    {
      "week": 5,
      "mmChapter": 5,
      "title": "Coupled springs, principal directions, and weak measurements",
      "mm": "M&M Chapter 5: SVD and spectral theorems (complete chapter, including adjoints and the complex/normal case).",
      "hh": "H&H Chapter 1 (2026-10-29 to 2026-10-31): Chapter 1 completion checkpoint: close remaining reading and review corrections. H&H Chapter 2, §§2.1, 2.2 (2026-11-01 to 2026-11-04): Row reduction and solving systems; include §2.0 orientation.",
      "goals": "Distinguish singular values from eigenvalues, interpret SVD geometrically, and connect invertibility to solving systems. This is a dense M&M week: retain proof work and use the spring and sensor experiments to test the geometric claims.",
      "bridge": "The in-phase and out-of-phase motions reveal eigenvectors as independent modes. SVD describes directional sensitivity for more general maps, including rectangular sensor maps where eigenvectors are not available in the same way.",
      "resources": [],
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
      "repairDue": "2026-11-06"
    },
    {
      "week": 6,
      "mmChapter": 6,
      "title": "Deforming a sheet and losing geometric information",
      "mm": "M&M Chapter 6: determinants (complete chapter, including characteristic polynomials and applications). This completes the six main chapters.",
      "hh": "H&H Chapter 2, §§2.3, 2.4, 2.5, 2.6 (2026-11-05 to 2026-11-11): Inverses, span, kernels, images, dimension, and abstract spaces.",
      "goals": "Connect determinant, volume, and invertibility; use rank-nullity outside coordinate spaces; distinguish a characteristic-polynomial argument from a geometric one.",
      "bridge": "Determinants describe signed area change, whereas singular values describe directional stretch. Equal area change can hide very different distortions. Rank and nullspace describe which positional information a collapsed sheet loses.",
      "resources": [],
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
      "repairDue": "2026-11-13"
    },
    {
      "week": 7,
      "mmChapter": null,
      "title": "Finding the equilibrium of a nonlinear spring",
      "mm": "M&M consolidation: revisit maps, spectral ideas, and solving systems using feedback from Weeks 1–6; no new chapter.",
      "hh": "H&H Chapter 2, §§2.7, 2.8 (2026-11-12 to 2026-11-18): Eigenstructure and Newton iteration with its hypotheses.",
      "goals": "Use eigenvectors to predict iterates and use a Jacobian to compute a Newton correction. Separate a successful numerical step from a convergence guarantee.",
      "bridge": "Newton iteration is repeated solution of a locally linear force-balance problem. Its Jacobian is a physical tangent response. Accurate local linearization and an invertible tangent are both needed; successful iteration is not a global convergence theorem.",
      "resources": [],
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
      "repairDue": "2026-11-20"
    },
    {
      "week": 8,
      "mmChapter": null,
      "title": "Calibrating an instrument: local inverse and global ambiguity",
      "mm": "M&M consolidation: select mixed problems across Chapters 1–6, prioritizing unresolved feedback; no new chapter.",
      "hh": "H&H Chapter 2, §§2.9, 2.10 (2026-11-19 to 2026-11-25): Convergence rate, inverse and implicit function theorems.",
      "goals": "State local inverse/implicit-function hypotheses precisely, distinguish local from global conclusions, and connect invertible derivatives to reliable local solves.",
      "bridge": "An invertible local response can permit calibration nearby without ensuring unique calibration everywhere. Distinguish model error, sensor noise, numerical error, and global ambiguity in the final report.",
      "resources": [],
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
      "repairDue": "2026-11-27"
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
      "resources": []
    }
  ],
  "materialRevision": "oct-nov-2026",
  "teachingApproach": "Predict → draw → calculate → simulate → explain. Start with a physical system, specify its variables, units, and assumptions, then derive its matrix. Use geometry to predict an outcome before calculating. Vary one parameter and explain what remains invariant. Finish by stating the general mathematical principle and testing where the model fails.",
  "endDate": "2026-11-30"
};
}
