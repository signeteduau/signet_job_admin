const CITIES = [
  { city: "Adelaide", state: "SA", slug: "adelaide" },
  { city: "Sydney", state: "NSW", slug: "sydney" },
  { city: "Melbourne", state: "VIC", slug: "melbourne" },
];

const POSITION_TYPE = "Structured Workplace-Based Occupational Training";
const CATEGORY = "Australian Workplace Training";
const LOGO_URL = "/assets/images/logo/seh-icon.png";

const ROLES = [
  {
    slug: "bricklayer",
    title: "Bricklayer Trainee — ANZSCO 331111",
    occupation: "Bricklayer",
    anzsco: "331111",
    industry: "Construction",
    trainingArea: "Bricklaying and Blocklaying",
    skills: [
      "Bricklaying",
      "Blocklaying",
      "Setting out",
      "Mortar preparation",
      "Masonry construction",
      "Workplace health and safety",
    ],
    description: `Position Purpose
The Bricklayer Trainee will undertake structured workplace-based occupational training designed to improve practical skills and competency in the occupation of Bricklayer. Training will be undertaken under the supervision of appropriately qualified and experienced bricklayers and construction personnel in an Australian workplace environment. The training will focus on developing practical competency in bricklaying, blocklaying, construction techniques, setting out, mortar preparation, installation and finishing.

Training and Duties
Under appropriate supervision, the trainee will develop skills in:
• Studying plans and specifications to determine materials, dimensions and installation procedures.
• Measuring and setting out brickwork and blockwork.
• Establishing levels, lines and building positions.
• Preparing and mixing mortar.
• Selecting and preparing bricks, blocks and other masonry materials.
• Laying bricks and blocks to required patterns and specifications.
• Constructing walls, partitions and other masonry structures.
• Cutting and shaping bricks and blocks using appropriate tools.
• Checking levels, alignment, plumb and dimensions during construction.
• Applying mortar and finishing masonry joints.
• Installing or incorporating openings and associated masonry components.
• Repairing and replacing damaged brickwork where required.
• Using hand tools, power tools and construction equipment safely.
• Maintaining tools and equipment.
• Cleaning and maintaining the work area.
• Following workplace health and safety procedures and construction-site requirements.`,
    rolesAndResponsibilities: `Training Outcomes
The trainee will progressively develop competency in:
• Bricklaying techniques
• Blocklaying techniques
• Setting out and measurement
• Reading plans and specifications
• Mortar preparation and application
• Construction of masonry walls and structures
• Brick and block cutting
• Alignment, levels and finishing
• Use of bricklaying tools and equipment
• Australian construction workplace practices
• Workplace health and safety

Supervision
The trainee will undertake practical activities under the direction and supervision of appropriately qualified and experienced personnel. Tasks will be progressively increased in complexity according to the trainee's demonstrated skills, competency and progress through the training program. The trainee will not be expected to undertake tasks beyond their demonstrated level of competency or outside the approved training activities.

Candidate Requirements
Candidates should have relevant bricklaying, blocklaying or construction education, training, qualifications and/or experience and demonstrate a genuine need to undertake further occupational training. Relevant qualifications may include Certificate III in Bricklaying and Blocklaying or equivalent training.`,
  },
  {
    slug: "wall-floor-tiler",
    title: "Wall and Floor Tiler Trainee — ANZSCO 333411",
    occupation: "Wall and Floor Tiler",
    anzsco: "333411",
    industry: "Construction",
    trainingArea: "Wall and Floor Tiling",
    skills: [
      "Surface preparation",
      "Tile installation",
      "Grouting",
      "Waterproofing",
      "Measurement and set-out",
      "Workplace health and safety",
    ],
    description: `Position Purpose
The Wall and Floor Tiler Trainee will undertake structured workplace-based occupational training designed to improve practical skills and competency in the occupation of Wall and Floor Tiler. Training will be undertaken under the supervision of appropriately qualified and experienced tradespeople in an Australian workplace environment. The training will focus on developing competency in the preparation, installation, finishing and maintenance of tiled surfaces in accordance with workplace procedures, relevant specifications and applicable Australian requirements.

Training and Duties
Under supervision, the trainee will develop skills in:
• Studying plans, specifications and work instructions to determine materials, dimensions and installation procedures.
• Measuring and marking surfaces to establish tile layouts.
• Preparing surfaces for tiling.
• Preparing and applying adhesives and other appropriate materials.
• Spreading adhesive onto prepared surfaces and positioning tiles.
• Cutting and shaping tiles using appropriate hand and power tools.
• Installing ceramic, clay, slate, marble, glass and other appropriate tiles.
• Ensuring tiles are correctly aligned, levelled and spaced.
• Grouting tiled surfaces and removing excess grout.
• Applying appropriate waterproofing systems.
• Completing finishing work to achieve the required standard.
• Cleaning and maintaining the work area.
• Using tools and equipment safely and appropriately.
• Following workplace health and safety procedures.`,
    rolesAndResponsibilities: `Training Outcomes
By completion of the training program, the trainee is expected to demonstrate improved competency in:
• Surface preparation
• Measurement and set-out
• Tile selection and preparation
• Tile cutting and installation
• Adhesive application
• Alignment and spacing
• Grouting and finishing
• Waterproofing procedures
• Safe use of tiling tools and equipment
• Australian workplace practices

Supervision
The trainee will undertake practical activities under the direction and supervision of appropriately qualified and experienced personnel. The level and complexity of tasks will increase progressively according to the trainee's demonstrated skills and competency.

Candidate Requirements
Candidates should have relevant education, training, qualifications and/or experience in wall and floor tiling and demonstrate a genuine need to undertake further occupational training.`,
  },
  {
    slug: "welder",
    title: "Welder Trainee — ANZSCO 322313",
    occupation: "Welder",
    anzsco: "322313",
    industry: "Engineering / Metal Fabrication",
    trainingArea: "Welding and Fabrication",
    skills: [
      "Welding preparation",
      "Welding techniques",
      "Metal fabrication",
      "Technical drawings",
      "Weld quality inspection",
      "Workshop safety",
    ],
    description: `Position Purpose
The Welder Trainee will undertake structured workplace-based occupational training designed to improve practical welding and fabrication skills in the occupation of Welder. Training will be undertaken under appropriate supervision in an Australian engineering, manufacturing or metal fabrication workplace.

Training and Duties
Under supervision, the trainee will develop skills in:
• Reading and interpreting engineering drawings, plans and specifications.
• Identifying and selecting appropriate materials for fabrication and welding.
• Measuring, marking and preparing metal components.
• Preparing surfaces and components for welding.
• Setting up and operating appropriate welding equipment.
• Performing welding activities using appropriate welding processes.
• Fabricating and assembling metal components.
• Positioning and securing components prior to welding.
• Checking dimensions, alignment and quality of completed work.
• Identifying welding defects and undertaking appropriate rectification under supervision.
• Using hand tools, power tools and workshop equipment safely.
• Maintaining welding equipment and work areas.
• Following workplace health and safety procedures.`,
    rolesAndResponsibilities: `Training Outcomes
The training program will progressively develop competency in:
• Welding preparation
• Welding equipment operation
• Welding techniques
• Metal fabrication
• Component assembly
• Reading technical drawings
• Measurement and set-out
• Weld quality inspection
• Workshop practices
• Occupational health and safety

Supervision
The trainee will perform practical activities under the supervision of appropriately qualified and experienced personnel. Tasks will be progressively increased in complexity based on demonstrated competency and the approved training program.

Candidate Requirements
Candidates should have relevant welding, fabrication or engineering training, qualifications and/or experience and demonstrate a genuine need for further occupational training.`,
  },
  {
    slug: "diesel-mechanic",
    title: "Diesel Motor Mechanic Trainee — ANZSCO 321212",
    occupation: "Diesel Motor Mechanic",
    anzsco: "321212",
    industry: "Automotive / Heavy Vehicle",
    trainingArea: "Automotive Diesel Technology",
    skills: [
      "Diesel engine inspection",
      "Fault diagnosis",
      "Routine servicing",
      "Fuel systems",
      "Transmission systems",
      "Workshop safety",
    ],
    description: `Position Purpose
The Diesel Motor Mechanic Trainee will undertake structured workplace-based occupational training designed to improve practical skills in the maintenance, testing and repair of diesel motors and associated mechanical systems. Training will take place under the supervision of appropriately qualified and experienced automotive personnel.

Training and Duties
Under supervision, the trainee will develop skills in:
• Inspecting diesel motors and mechanical components.
• Identifying faults and determining appropriate repair requirements.
• Testing diesel motors and mechanical systems.
• Assisting with diagnosis of mechanical faults.
• Servicing diesel engines and associated systems.
• Inspecting and maintaining transmissions.
• Inspecting and maintaining suspension systems.
• Inspecting steering and braking systems.
• Removing, dismantling and inspecting mechanical components.
• Repairing or replacing worn or faulty components under supervision.
• Working with fuel injection, cooling and lubrication systems.
• Using appropriate mechanical and electronic diagnostic equipment.
• Testing mechanical systems following servicing and repair.
• Performing routine maintenance activities.
• Using automotive tools and workshop equipment safely.
• Maintaining a clean and safe work environment.`,
    rolesAndResponsibilities: `Training Outcomes
The trainee will progressively develop competency in:
• Diesel engine inspection
• Fault diagnosis
• Mechanical testing
• Routine servicing
• Engine systems
• Fuel and injection systems
• Cooling and lubrication systems
• Transmission systems
• Suspension, steering and braking systems
• Diagnostic equipment
• Workshop safety and procedures

Supervision
All practical training activities will be undertaken under appropriate supervision, with responsibility and task complexity increasing progressively according to demonstrated competency.

Candidate Requirements
Candidates should have relevant automotive, diesel technology or mechanical training, qualifications and/or experience and demonstrate a genuine need for further occupational training.`,
  },
  {
    slug: "aged-disabled-carer",
    title: "Aged or Disabled Carer Trainee — ANZSCO 423111",
    occupation: "Aged or Disabled Carer",
    anzsco: "423111",
    industry: "Aged Care / Community Services",
    trainingArea: "Individual Support – Ageing and Disability",
    skills: [
      "Person-centred support",
      "Personal care",
      "Mobility assistance",
      "Meal preparation",
      "Communication",
      "Workplace safety",
    ],
    description: `Position Purpose
The Aged or Disabled Carer Trainee will undertake structured workplace-based occupational training designed to improve practical skills and competency in providing care, support and assistance to aged persons. Training will occur under appropriate supervision in an Australian care environment. The training will focus on developing competency in providing general assistance, personal support, companionship and assistance with daily activities while maintaining client dignity, privacy and safety.

Training and Duties
Under supervision, the trainee will develop skills in:
• Supporting clients with daily activities.
• Assisting clients with mobility.
• Providing assistance with personal hygiene and dressing.
• Preparing and assisting with meals.
• Providing companionship and emotional support.
• Assisting clients to participate in appropriate social activities.
• Performing appropriate household assistance.
• Assisting with shopping and errands where required.
• Communicating appropriately with clients, families and care teams.
• Recognising and reporting changes in a client's condition or wellbeing.
• Maintaining client privacy and dignity.
• Following workplace policies and procedures.
• Applying appropriate infection prevention and control practices.
• Following workplace health and safety requirements.`,
    rolesAndResponsibilities: `Training Outcomes
The trainee will progressively develop competency in:
• Person-centred support
• Daily living assistance
• Mobility assistance
• Personal care
• Meal preparation and assistance
• Companionship and emotional support
• Household assistance
• Communication
• Client privacy and dignity
• Workplace safety
• Australian aged-care workplace practices

Supervision
Training activities will be undertaken under appropriate supervision. The trainee will only undertake tasks appropriate to their demonstrated competency, training plan and level of supervision.

Candidate Requirements
Candidates should have relevant aged care, individual support, disability support or community services education, training, qualifications and/or experience and demonstrate a genuine need for further occupational training.`,
  },
];

export function buildTrainingJobs() {
  const jobs = [];

  for (const role of ROLES) {
    for (const loc of CITIES) {
      jobs.push({
        seedKey: `training-${role.slug}-${loc.slug}`,
        postedBy: "admin",
        isSignetJob: true,
        hideCompany: true,
        companyId: "",
        companyName: "",
        logoUrl: LOGO_URL,
        title: role.title,
        occupation: role.occupation,
        anzsco: role.anzsco,
        positionType: POSITION_TYPE,
        industry: role.industry,
        trainingArea: role.trainingArea,
        location: `${loc.city}, ${loc.state}, Australia`,
        city: loc.city,
        state: loc.state,
        country: "Australia",
        type: "Traineeship",
        priority: "High",
        category: CATEGORY,
        currency: "AUD",
        salary: "Training placement",
        experience: "Entry level",
        skills: role.skills,
        description: role.description,
        rolesAndResponsibilities: role.rolesAndResponsibilities,
        attachmentUrl: "",
        status: "Active",
      });
    }
  }

  return jobs;
}
